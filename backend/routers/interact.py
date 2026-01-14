
# backend/routers/interact.py
import os
import json
import logging
from typing import Any
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from backend.schemas.interact import InteractRequest, InteractionCreate

# try import real service; if it doesn't exist, we'll fallback to file logging
try:
    from backend.services.user_activity import log_user_activity
except Exception:
    log_user_activity = None  # type: ignore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI"])


# simple interaction endpoint (view/click/purchase)
@router.post("/", summary="Interaction endpoint (view/click/purchase)")
async def interact(req: InteractRequest):
    # minimal safe behavior: try to call send to kafka/cache but never crash the request
    try:
        uid = str(req.user_id)
        event = getattr(req, "event", "view")
        # Example: add_recent_click() or send_user_event() could be called here.
        # We keep this endpoint minimal and non-blocking in this example.
        return {"ok": True}
    except Exception as e:
        logger.exception("interact error")
        return JSONResponse(status_code=200, content={"ok": False, "error": str(e)})


# robust feedback endpoint used by the frontend
@router.post("/feedback", summary="Receive AI feedback / user activity from frontend")
async def ai_feedback(payload: InteractionCreate, request: Request):
    """
    Frontend should POST to /api/ai/feedback with:
    {
      "userId": "u123",
      "orderId": "o456",
      "action": "view_details"
    }
    This endpoint validates shape (422 if missing/wrong types) and then tries to record the activity.
    If the real logging (Kafka/DB) fails, we catch errors and fallback to writing a file to avoid 500.
    """

    # Always log what we received for easier debugging
    try:
        # pydantic v2: model_dump(); by_alias=True will show userId/orderId keys as sent by client
        logger.info("Received /api/ai/feedback payload: %s", payload.model_dump())
    except Exception:
        raw = await request.body()
        logger.info("Received /api/ai/feedback payload (raw): %s", raw)

    # 1) Attempt to call real service if available
    if log_user_activity:
        try:
            # NOTE: use snake_case attributes (these are model attributes)
            maybe_result = log_user_activity(
                user_id=payload.user_id,
                order_id=payload.order_id,
                action=payload.action,
            )
            # if it's a coroutine, await it
            if hasattr(maybe_result, "__await__"):
                await maybe_result  # type: ignore
            return {"ok": True}
        except Exception as e:
            logger.exception("log_user_activity failed, falling back to file append")

    # 2) Fallback: append to a local file for development
    interactions_file = os.getenv("INTERACTIONS_FILE", "/data/interactions.json")
    try:
        os.makedirs(os.path.dirname(interactions_file), exist_ok=True)
        # Save using alias (camelCase) so file reflects client shape if desired
        entry = payload.model_dump(by_alias=True)
        entry.update({"ts": __import__("datetime").datetime.utcnow().isoformat()})
        # Append as JSON Lines (safe concurrent append)
        with open(interactions_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        logger.info("Appended interaction to %s: %s", interactions_file, entry)
        return {"ok": True, "saved_to": interactions_file}
    except Exception as e:
        logger.exception("Failed to persist interaction to file")
        # Final fallback: structured error (keeps HTTP 200 as original pattern, but includes details)
        return JSONResponse(status_code=200, content={"ok": False, "error": "persist_failed", "details": str(e)})
