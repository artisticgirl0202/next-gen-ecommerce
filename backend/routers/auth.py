"""
Auth router — /api/auth/*

Endpoints:
  POST /register        — email/password sign-up (sends verification email)
  GET  /verify-email    — verify email with token from link
  POST /login           — email/password sign-in (requires verified email)
  POST /google          — Google OAuth sign-in / sign-up
  POST /refresh         — issue new access token from HttpOnly refresh-token cookie
  POST /logout          — blacklist tokens + clear cookie
  GET  /me              — return current user from access token
  PUT  /me              — update name or password
  DELETE /me            — soft-delete (deactivate) account
"""
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from jose import JWTError
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models.user import User
from backend.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    UpdateMeRequest,
    UserResponse,
)
from backend.services.auth_service import (
    LOCKOUT_ATTEMPTS,
    LOCKOUT_DURATION_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    blacklist_token,
    check_rate_limit,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    is_blacklisted,
    verify_google_token,
    verify_password,
)
from backend.services.email_service import send_password_reset_email, send_verification_email

logger = logging.getLogger(__name__)
router = APIRouter()

# ---------------------------------------------------------------------------
# Cookie config — auto-switches between local dev and production
# ---------------------------------------------------------------------------
_ENV = os.getenv("ENVIRONMENT", "development").lower()
_IS_PRODUCTION = _ENV == "production"

_COOKIE_SECURE: bool = _IS_PRODUCTION
_COOKIE_SAMESITE: str = "strict" if _IS_PRODUCTION else "lax"
_COOKIE_MAX_AGE: int = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600

logger.info(
    "🍪 Cookie policy: secure=%s  samesite=%s  (ENVIRONMENT=%s)",
    _COOKIE_SECURE, _COOKIE_SAMESITE, _ENV,
)


def _set_refresh_cookie(response: JSONResponse, refresh_token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=_COOKIE_MAX_AGE,
        path="/api/auth",
    )


def _clear_refresh_cookie(response: JSONResponse) -> None:
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        path="/api/auth",
    )


# ---------------------------------------------------------------------------
# Bearer token dependency
# ---------------------------------------------------------------------------

def _get_bearer_token(request: Request) -> str:
    auth_header: Optional[str] = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_header.split(" ", 1)[1]


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = _get_bearer_token(request)
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired.",
        )

    jti: Optional[str] = payload.get("jti")
    if jti and is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked.",
        )

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid.",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated.",
        )
    return user


# ---------------------------------------------------------------------------
# POST /register
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account (sends verification email)",
)
def register(
    body: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JSONResponse:
    try:
        # ── 1. Block if an active account already uses this email ─────────
        active_user: Optional[User] = (
            db.query(User)
            .filter(User.email == body.email, User.is_active == True)
            .first()
        )
        if active_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        # ── 2. Look for a soft-deleted account with this email ────────────
        # On deletion the email becomes "deleted_{id}_{original_email}",
        # so we check whether any inactive row ends with "_{body.email}".
        deleted_user: Optional[User] = (
            db.query(User)
            .filter(
                User.email.endswith(f"_{body.email}"),
                User.is_active == False,
            )
            .first()
        )

        verification_token: str = uuid.uuid4().hex  # shared by both paths

        if deleted_user is not None:
            # ── 3. Account Recovery ───────────────────────────────────────
            deleted_user.email                  = body.email
            deleted_user.full_name              = body.full_name
            deleted_user.hashed_password        = hash_password(body.password)
            deleted_user.is_active              = True
            deleted_user.is_verified            = False  # must re-verify
            deleted_user.verification_token     = verification_token
            deleted_user.failed_login_attempts  = 0
            deleted_user.account_locked_until   = None
            db.commit()
            db.refresh(deleted_user)
            user = deleted_user
            logger.info("Account recovered (unverified): id=%s email=%s", user.id, user.email)

        else:
            # ── 4. Brand-new registration ─────────────────────────────────
            user = User(
                email=body.email,
                hashed_password=hash_password(body.password),
                full_name=body.full_name,
                is_oauth=False,
                is_verified=False,
                is_active=True,
                verification_token=verification_token,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("New user registered (unverified): id=%s email=%s", user.id, user.email)

    except HTTPException:
        # Re-raise known HTTP exceptions (409, etc.) as-is
        raise
    except Exception as exc:
        # Catch unexpected DB / hashing errors and return 500 instead of
        # letting FastAPI produce an unhandled 500 with a bare traceback.
        db.rollback()
        logger.exception("Unexpected error during registration for %s: %s", body.email, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to an internal error. Please try again.",
        )

    # ── 5. Send verification email in the background ──────────────────────
    # Response is returned immediately — SMTP latency is hidden from the user.
    background_tasks.add_task(
        _send_verification_email_safe, user.email, verification_token
    )

    return JSONResponse(
        content={
            "message": "Registration successful! Please check your inbox to verify your email address.",
            "email": user.email,
        },
        status_code=201,
    )


async def _send_verification_email_safe(email: str, token: str) -> None:
    """Async wrapper used by BackgroundTasks — swallows exceptions so a mail
    failure never crashes the background runner."""
    try:
        await send_verification_email(email, token)
    except Exception as exc:
        logger.error("Background verification email failed for %s: %s", email, exc)


# ---------------------------------------------------------------------------
# GET /verify-email
# ---------------------------------------------------------------------------

@router.get(
    "/verify-email",
    summary="Verify email address via token from the verification link",
)
def verify_email(
    token: str = Query(..., description="Verification token from the email link"),
    db: Session = Depends(get_db),
) -> JSONResponse:
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or has already been used.",
        )

    if user.is_verified:
        return JSONResponse(content={"detail": "Email is already verified. Please log in."})

    user.is_verified = True
    user.verification_token = None  # one-time use
    db.commit()
    logger.info("Email verified for user id=%s", user.id)

    return JSONResponse(content={"detail": "Email verified successfully! You can now log in."})


# ---------------------------------------------------------------------------
# POST /login
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Sign in with email and password",
)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)) -> JSONResponse:
    client_ip: str = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in 60 seconds.",
        )

    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email or password is incorrect.",
    )

    # Explicitly include is_active=True so soft-deleted rows (email starts with
    # "deleted_{id}_...") can never interfere with authentication.
    user: Optional[User] = (
        db.query(User)
        .filter(User.email == body.email, User.is_active == True)
        .first()
    )
    if not user or not user.hashed_password:
        raise _invalid

    # Account lockout check
    if user.account_locked_until and user.account_locked_until > datetime.now(timezone.utc).replace(tzinfo=None):
        remaining = int((user.account_locked_until - datetime.utcnow()).total_seconds() // 60) + 1
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account is temporarily locked. Try again in {remaining} minute(s).",
        )

    # Verify password
    if not verify_password(body.password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= LOCKOUT_ATTEMPTS:
            user.account_locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Too many failed attempts. Account locked for {LOCKOUT_DURATION_MINUTES} minutes.",
            )
        db.commit()
        raise _invalid

    # Block unverified users
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in. Check your inbox for the verification link.",
        )

    # Success — reset counters
    user.failed_login_attempts = 0
    user.account_locked_until = None
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)

    payload = AuthResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
    response = JSONResponse(content=payload.model_dump())
    _set_refresh_cookie(response, refresh_token)
    return response


# ---------------------------------------------------------------------------
# POST /google
# ---------------------------------------------------------------------------

@router.post(
    "/google",
    response_model=AuthResponse,
    summary="Sign in or register with Google OAuth",
)
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)) -> JSONResponse:
    try:
        google_info = verify_google_token(body.credential)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    google_email: str = google_info["email"]
    full_name: str    = google_info.get("name") or google_email.split("@")[0]

    # ── 1. Active account lookup ──────────────────────────────────────────
    user: Optional[User] = (
        db.query(User)
        .filter(User.email == google_email, User.is_active == True)
        .first()
    )

    if user is not None:
        # Normal sign-in — active account found
        logger.info("OAuth sign-in: id=%s email=%s", user.id, user.email)

    else:
        # ── 2. Soft-deleted account lookup (Account Recovery) ─────────────
        # On deletion the email becomes "deleted_{id}_{original_email}",
        # so we check whether any inactive row ends with "_{google_email}".
        deleted_user: Optional[User] = (
            db.query(User)
            .filter(
                User.email.endswith(f"_{google_email}"),
                User.is_active == False,
            )
            .first()
        )

        if deleted_user is not None:
            # ── 3. Recover the old account ────────────────────────────────
            deleted_user.email     = google_email   # restore original email
            deleted_user.is_active = True
            deleted_user.is_verified = True         # Google re-confirmed the email
            db.commit()
            db.refresh(deleted_user)
            user = deleted_user
            logger.info(
                "OAuth account recovered: id=%s email=%s", user.id, user.email
            )

        else:
            # ── 4. Brand-new registration ─────────────────────────────────
            user = User(
                email=google_email,
                full_name=full_name,
                is_oauth=True,
                is_verified=True,   # Google already verified the email
                is_active=True,
                hashed_password=None,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(
                "New OAuth user registered: id=%s email=%s", user.id, user.email
            )

    # ── 5. Issue tokens ───────────────────────────────────────────────────
    access_token  = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id)

    payload = AuthResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
    response = JSONResponse(content=payload.model_dump())
    _set_refresh_cookie(response, refresh_token)
    return response


# ---------------------------------------------------------------------------
# POST /refresh
# ---------------------------------------------------------------------------

@router.post(
    "/refresh",
    response_model=AuthResponse,
    summary="Issue a new access token using the HttpOnly refresh-token cookie",
)
def refresh(
    db: Session = Depends(get_db),
    refresh_token: Optional[str] = Cookie(default=None),
) -> JSONResponse:
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found. Please log in again.",
        )

    try:
        payload = decode_token(refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or expired.",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
        )

    jti: Optional[str] = payload.get("jti")
    if jti and is_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked.",
        )

    user_id: Optional[str] = payload.get("sub")
    user: Optional[User] = (
        db.query(User).filter(User.id == int(user_id)).first() if user_id else None
    )
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    new_access_token = create_access_token(user.id, user.email)
    resp_payload = AuthResponse(
        access_token=new_access_token,
        user=UserResponse.model_validate(user),
    )
    return JSONResponse(content=resp_payload.model_dump())


# ---------------------------------------------------------------------------
# POST /logout
# ---------------------------------------------------------------------------

@router.post("/logout", summary="Revoke tokens and clear refresh-token cookie")
def logout(
    request: Request,
    refresh_token: Optional[str] = Cookie(default=None),
) -> JSONResponse:
    auth_header: Optional[str] = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        access_token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(access_token)
            jti = payload.get("jti")
            exp = payload.get("exp", 0)
            ttl = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
            if jti and ttl > 0:
                blacklist_token(jti, ttl)
        except JWTError:
            pass

    if refresh_token:
        try:
            payload = decode_token(refresh_token)
            jti = payload.get("jti")
            exp = payload.get("exp", 0)
            ttl = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
            if jti and ttl > 0:
                blacklist_token(jti, ttl)
        except JWTError:
            pass

    response = JSONResponse(content={"detail": "Logged out successfully."})
    _clear_refresh_cookie(response)
    return response


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserResponse, summary="Get current authenticated user")
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


# ---------------------------------------------------------------------------
# PUT /me  — update name and/or password
# ---------------------------------------------------------------------------

@router.put("/me", response_model=UserResponse, summary="Update current user's name or password")
def update_me(
    body: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    updated = False

    if body.full_name is not None:
        current_user.full_name = body.full_name
        updated = True

    if body.password is not None:
        if current_user.is_oauth:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth accounts cannot set a password. Use Google Sign-In to log in.",
            )
        current_user.hashed_password = hash_password(body.password)
        updated = True

    if updated:
        db.commit()
        db.refresh(current_user)
        logger.info("User id=%s updated their profile.", current_user.id)

    return UserResponse.model_validate(current_user)


# ---------------------------------------------------------------------------
# DELETE /me  — soft-delete (deactivate) account
# ---------------------------------------------------------------------------

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, summary="Deactivate (soft-delete) account")
def delete_me(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    refresh_token: Optional[str] = Cookie(default=None),
) -> JSONResponse:
    # Blacklist active tokens so they can't be reused
    auth_header: Optional[str] = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        access_token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(access_token)
            jti = payload.get("jti")
            exp = payload.get("exp", 0)
            ttl = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
            if jti and ttl > 0:
                blacklist_token(jti, ttl)
        except JWTError:
            pass

    if refresh_token:
        try:
            payload = decode_token(refresh_token)
            jti = payload.get("jti")
            exp = payload.get("exp", 0)
            ttl = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
            if jti and ttl > 0:
                blacklist_token(jti, ttl)
        except JWTError:
            pass

    # Soft-delete: mark inactive instead of hard-deleting to preserve order history
    current_user.is_active = False
    current_user.email = f"deleted_{current_user.id}_{current_user.email}"  # free up the email for re-registration
    db.commit()
    logger.info("User id=%s soft-deleted their account.", current_user.id)

    response = JSONResponse(content=None, status_code=204)
    _clear_refresh_cookie(response)
    return response


# ---------------------------------------------------------------------------
# POST /forgot-password
# ---------------------------------------------------------------------------

_RESET_TOKEN_EXPIRE_MINUTES = 15
_RESET_TOKEN_TYPE = "password_reset"


@router.post(
    "/forgot-password",
    summary="Request a password-reset link via email",
)
def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> JSONResponse:
    # Always return the same response to prevent email enumeration attacks.
    _safe_response = JSONResponse(
        content={
            "message": (
                "If an account with that email exists, "
                "a reset link has been dispatched to your inbox."
            )
        }
    )

    user: Optional[User] = (
        db.query(User)
        .filter(User.email == body.email, User.is_active == True)
        .first()
    )
    if user is None:
        return _safe_response

    # Build a short-lived JWT specifically for password reset.
    # Reuses the same signing secret but marks type="password_reset"
    # so it cannot be used as an access token.
    from backend.services.auth_service import JWT_SECRET, JWT_ALGORITHM
    from jose import jwt as _jwt

    now = datetime.now(timezone.utc)
    reset_payload = {
        "sub": str(user.id),
        "email": user.email,
        "type": _RESET_TOKEN_TYPE,
        "iat": now,
        "exp": now + timedelta(minutes=_RESET_TOKEN_EXPIRE_MINUTES),
    }
    reset_token = _jwt.encode(reset_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    background_tasks.add_task(_send_reset_email_safe, user.email, reset_token)
    logger.info("Password reset requested for user id=%s", user.id)
    return _safe_response


async def _send_reset_email_safe(email: str, token: str) -> None:
    try:
        await send_password_reset_email(email, token)
    except Exception as exc:
        logger.error("Background password-reset email failed for %s: %s", email, exc)


# ---------------------------------------------------------------------------
# POST /reset-password
# ---------------------------------------------------------------------------

@router.post(
    "/reset-password",
    summary="Set a new password using a valid reset token",
)
def reset_password(
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> JSONResponse:
    from backend.services.auth_service import JWT_SECRET, JWT_ALGORITHM
    from jose import jwt as _jwt, JWTError as _JWTError

    _invalid_token = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Reset link is invalid or has expired. Please request a new one.",
    )

    try:
        payload = _jwt.decode(body.token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except _JWTError:
        raise _invalid_token

    if payload.get("type") != _RESET_TOKEN_TYPE:
        raise _invalid_token

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise _invalid_token

    user: Optional[User] = (
        db.query(User)
        .filter(User.id == int(user_id), User.is_active == True)
        .first()
    )
    if not user:
        raise _invalid_token

    user.hashed_password = hash_password(body.new_password)
    # Reset any lockout state so the user can log in immediately
    user.failed_login_attempts = 0
    user.account_locked_until = None
    db.commit()
    logger.info("Password reset completed for user id=%s", user.id)

    return JSONResponse(
        content={"message": "Password updated successfully. You can now log in."}
    )
