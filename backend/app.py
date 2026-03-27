"""
backend/app.py — FastAPI application entry point.

Boot order (must not be changed):
  1. load_dotenv          — env vars available before any module import
  2. env validation       — fail fast for missing critical variables
  3. DB / ORM models      — Base + engine, then all model classes
  4. Middleware           — CORS first (outermost), then security headers
  5. Routers              — registered after all models are in metadata
"""
import logging
import os
import re
from pathlib import Path

# ── 1. Load .env BEFORE any backend module is imported ──────────────────────
# db/session.py reads DATABASE_URL at module-import time via os.getenv().
# Without this call, the value is empty → SQLite fallback → "no such table".
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env", override=False)

# ── 2. Validate critical environment variables ───────────────────────────────
# Fail immediately at startup with a clear message rather than producing
# cryptic runtime errors deep inside request handlers.
_REQUIRED: dict[str, str] = {
    "DATABASE_URL": "PostgreSQL connection string — postgresql://user:pass@host/db",
    "JWT_SECRET":   "64-byte hex secret — python -c \"import secrets; print(secrets.token_hex(64))\"",
}
_missing = [f"  {k}  →  {hint}" for k, hint in _REQUIRED.items() if not os.getenv(k)]
if _missing:
    raise RuntimeError(
        "🚨 Missing required environment variables:\n"
        + "\n".join(_missing)
        + "\n\nAdd them to backend/.env or your hosting provider's env dashboard."
    )

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402
from starlette.middleware.base import BaseHTTPMiddleware  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── 3. Runtime config ────────────────────────────────────────────────────────
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production").lower()
IS_PROD: bool = ENVIRONMENT == "production"
ENABLE_KAFKA: bool = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

logger.info("🚀 Environment: %s  |  Kafka: %s", ENVIRONMENT, ENABLE_KAFKA)

# ── 4. DB + ORM models (must come before any router import) ─────────────────
# Routers reference model classes. If they load before Base.metadata is
# populated, create_all() silently skips tables that weren't registered yet.
from backend.db import Base, engine  # noqa: E402
from sqlalchemy import text  # noqa: E402

import backend.models  # noqa: F401, E402  — registers Order, Product, User, Refund
from backend.models.user import User  # noqa: F401, E402  — explicit: guarantees `users` table

# ── 5. Routers ───────────────────────────────────────────────────────────────
from backend.routers.health import router as health_router  # noqa: E402
from backend.routers.recommend import router as recommend_router  # noqa: E402
from backend.routers.interact import router as interact_router  # noqa: E402
from backend.routers.products import router as products_router  # noqa: E402
from backend.routers import events  # noqa: E402
from backend.routers.auth import router as auth_router  # noqa: E402
from backend.services.kafka_producer import get_producer, stop_producer  # noqa: E402

try:
    from backend.routers.orders import router as orders_router
    _HAS_ORDERS = True
except ImportError:
    _HAS_ORDERS = False
    orders_router = None

# ── 6. FastAPI application ───────────────────────────────────────────────────
app = FastAPI(
    title="Next-Gen E-Commerce API",
    # Hide interactive docs in production to reduce attack surface.
    # Developers can set ENVIRONMENT=development locally to re-enable them.
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
)

# ── 7. CORS middleware ───────────────────────────────────────────────────────
# allow_credentials=True is required for HttpOnly refresh-token cookies to be
# sent cross-origin. With credentials enabled, allow_origins cannot be ["*"] —
# every origin must be explicitly listed (browser requirement, not just FastAPI).
#
# Vercel preview deployments get unique URLs like
#   https://next-gen-ecommerce-abc123-artisticgirls-projects.vercel.app
# Enumerating them all is impractical, so we support an optional regex via
# VERCEL_ORIGIN_REGEX.  Set it in your Render dashboard, e.g.:
#   https://next-gen-ecommerce.*-artisticgirls-projects\.vercel\.app

_raw_origins = os.getenv(
    "FRONT_ORIGINS",
    # Safe fallback: local dev only. Production MUST set this via env.
    "http://localhost:5173,http://127.0.0.1:5173",
)
FRONT_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]
logger.info("🌐 CORS explicit origins: %s", FRONT_ORIGINS)

_VERCEL_REGEX_RAW: str = os.getenv("VERCEL_ORIGIN_REGEX", "")
if _VERCEL_REGEX_RAW:
    try:
        re.compile(_VERCEL_REGEX_RAW)  # validate at boot — typos fail fast
        logger.info("🌐 CORS regex pattern: %s", _VERCEL_REGEX_RAW)
    except re.error as exc:
        logger.error("❌ VERCEL_ORIGIN_REGEX is invalid regex (%s) — ignoring", exc)
        _VERCEL_REGEX_RAW = ""

# Starlette adds middlewares in reverse order (last added = outermost).
# We add CORS first so it is innermost (but outermost of the two we define
# here), ensuring it handles OPTIONS preflight before the route handler runs.
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONT_ORIGINS,
    allow_origin_regex=_VERCEL_REGEX_RAW or None,
    allow_credentials=True,  # must be True for HttpOnly cookie transport
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # Explicit header allowlist (defence-in-depth vs. allow_headers=["*"])
    allow_headers=[
        "Authorization",    # Bearer access token sent by axiosInstance
        "Content-Type",     # JSON request bodies
        "X-Requested-With", # conventional AJAX marker
        "Accept",           # content negotiation
        "Origin",           # echoed back by CORS middleware
    ],
    # Headers that browser JS is permitted to read from the response.
    # Access-token is in the JSON body; refresh-token is HttpOnly — neither
    # needs to be in expose_headers.
    expose_headers=["Content-Length", "WWW-Authenticate", "X-Request-ID"],
    # 10-minute preflight cache. Shorter than the previous 3600 s so CORS
    # config changes (new origins etc.) propagate faster.
    max_age=600,
)

# ── 8. Security headers middleware ───────────────────────────────────────────
# Added AFTER CORSMiddleware so it becomes the outermost middleware.
# Every response — including CORS preflight 200s and error responses — will
# receive these headers.
#
# Cross-Origin-Opener-Policy:
#   Google Sign-In opens an OAuth popup. With COOP=same-origin the browser
#   blocks window.closed / window.opener calls from that popup and logs a
#   console warning. "same-origin-allow-popups" preserves the security boundary
#   while letting the Google SDK communicate back through the popup channel.
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ── 9. Startup / Shutdown ────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    _db_url = os.getenv("DATABASE_URL", "")
    try:
        from urllib.parse import urlparse
        _p = urlparse(_db_url)
        logger.info("🗄️  DB → %s:%s / %s", _p.hostname, _p.port or 5432, _p.path.lstrip("/"))
    except Exception:
        logger.info("🗄️  DATABASE_URL = %s…", _db_url[:40])

    try:
        registered = sorted(Base.metadata.tables.keys())
        logger.info("📋 Tables in metadata: %s", registered)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ DB schema ensured")
    except Exception as exc:
        logger.error("❌ DB schema creation failed: %s", exc)

    if ENABLE_KAFKA:
        try:
            await get_producer()
            logger.info("✅ Kafka producer ready")
        except Exception as exc:
            logger.warning(
                "⚠️  Kafka unavailable (%s) — running without event streaming. "
                "Set ENABLE_KAFKA=false to silence this warning.",
                exc,
            )
    else:
        logger.info("🚫 Kafka disabled (ENABLE_KAFKA=false)")


@app.on_event("shutdown")
async def on_shutdown():
    if ENABLE_KAFKA:
        await stop_producer()
        logger.info("🛑 Kafka producer stopped")


# ── 10. Seed endpoint (development only) ────────────────────────────────────
# /api/seed runs TRUNCATE + INSERT which would wipe production data if hit
# accidentally (e.g., by a crawler or misconfigured CI script).
# It is unconditionally blocked in production and optionally gated behind a
# shared secret (SEED_SECRET) even in development.
_SEED_SECRET: str = os.getenv("SEED_SECRET", "")


@app.get("/api/seed", include_in_schema=not IS_PROD, tags=["dev"])
def seed_database(request: Request):
    if IS_PROD:
        return JSONResponse(
            status_code=403,
            content={"detail": "This endpoint is disabled in production."},
        )

    if _SEED_SECRET and request.headers.get("X-Seed-Secret") != _SEED_SECRET:
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing or invalid X-Seed-Secret header."},
        )

    try:
        with engine.connect() as conn:
            conn.execute(text("TRUNCATE TABLE products RESTART IDENTITY CASCADE;"))
            conn.execute(text("""
                INSERT INTO products (name, price, category, image, description, specs, reviews) VALUES
                ('Quantum Blade Laptop', 1299.00, 'Computing Devices',  '/images/products/laptop-1.jpg',  'Next-generation processing power.',  '{"cpu": "i9",        "ram": "32GB"}',              4.8),
                ('Neural Link Watch',    399.00,  'Mobile & Wearables', '/images/products/watch-1.jpg',   'Advanced biometric tracking.',       '{"battery": "48h",   "waterproof": "5ATM"}',       4.5),
                ('Sonic Echo Pods',      199.00,  'Audio Devices',       '/images/products/earbuds-1.jpg', 'Lossless spatial audio.',            '{"noise_cancel": "active", "playtime": "24h"}',   4.6),
                ('OLED Curve 8K',       2499.00,  'Video & Display',     '/images/products/tv-1.jpg',      'Ultra-thin 8K OLED display.',        '{"size": "65inch",   "refresh": "120Hz"}',         4.9),
                ('Alpha Lens Z9',       1899.00,  'Cameras & Imaging',   '/images/products/camera-1.jpg',  'Full-frame mirrorless camera.',       '{"sensor": "50MP",   "video": "8K"}',              4.7)
            """))
            conn.commit()
        return {"message": "✅ Seed data inserted successfully."}
    except Exception as exc:
        logger.error("Seed failed: %s", exc)
        return JSONResponse(status_code=500, content={"error": str(exc)})


# ── 11. Router registration ──────────────────────────────────────────────────
app.include_router(auth_router,      prefix="/api/auth",      tags=["auth"])
app.include_router(health_router,    prefix="/health",        tags=["health"])
app.include_router(products_router,  prefix="/api/products",  tags=["products"])
app.include_router(recommend_router, prefix="/api/recommend", tags=["recommend"])
app.include_router(interact_router)
app.include_router(events.router,    prefix="/events",        tags=["events"])

if _HAS_ORDERS and orders_router:
    app.include_router(orders_router, prefix="/api/orders", tags=["orders"])
    logger.info("✅ Orders router registered")


@app.get("/", include_in_schema=False)
def root():
    return {"ok": True, "service": "next-gen-ecom-backend", "env": ENVIRONMENT}
