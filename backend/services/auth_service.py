"""
Auth service: password hashing, JWT generation/verification,
Redis-backed token blacklisting and login rate limiting,
and Google OAuth ID-token verification.
"""
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import redis as _sync_redis_mod
from jose import JWTError, jwt
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
_jwt_secret = os.getenv("JWT_SECRET")
if not _jwt_secret:
    raise RuntimeError(
        "JWT_SECRET environment variable is not set. "
        'Generate one with: python -c "import secrets; print(secrets.token_hex(64))"'
    )
JWT_SECRET: str = _jwt_secret
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

RATE_LIMIT_MAX: int = 5          # max login attempts
RATE_LIMIT_WINDOW: int = 60      # per 60 seconds
LOCKOUT_ATTEMPTS: int = 5        # consecutive failures before DB lockout
LOCKOUT_DURATION_MINUTES: int = 15

# ---------------------------------------------------------------------------
# Password hashing (Argon2 via passlib)
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: int, email: str) -> str:
    jti = str(uuid.uuid4())
    expire = _utc_now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "jti": jti,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    jti = str(uuid.uuid4())
    expire = _utc_now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT.
    Raises JWTError if invalid or expired.
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


# ---------------------------------------------------------------------------
# Redis client (sync) — used for blacklist & rate limiting
# ---------------------------------------------------------------------------
_REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
_redis: Optional[_sync_redis_mod.Redis] = None


def _get_redis() -> Optional[_sync_redis_mod.Redis]:
    global _redis
    if _redis is None:
        try:
            _redis = _sync_redis_mod.from_url(_REDIS_URL, decode_responses=True)
            _redis.ping()
        except Exception as exc:
            logger.warning("auth_service: Redis unavailable (%s) — blacklist/rate-limit skipped", exc)
            _redis = None
    return _redis


# ---------------------------------------------------------------------------
# Token blacklist
# ---------------------------------------------------------------------------

def blacklist_token(jti: str, ttl_seconds: int) -> None:
    """Store jti in Redis with TTL = remaining token lifetime."""
    r = _get_redis()
    if r is None:
        return
    try:
        r.setex(f"blacklist:{jti}", ttl_seconds, "1")
    except Exception as exc:
        logger.warning("blacklist_token failed: %s", exc)


def is_blacklisted(jti: str) -> bool:
    r = _get_redis()
    if r is None:
        return False
    try:
        return r.exists(f"blacklist:{jti}") == 1
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Rate limiting (Redis INCR + EXPIRE)
# ---------------------------------------------------------------------------

def check_rate_limit(identifier: str) -> bool:
    """
    Returns True if the identifier is within limits (allowed).
    Returns False if the rate limit is exceeded (block the request).
    """
    r = _get_redis()
    if r is None:
        return True  # fail-open if Redis is unavailable

    key = f"rate_limit:login:{identifier}"
    try:
        count = r.incr(key)
        if count == 1:
            r.expire(key, RATE_LIMIT_WINDOW)
        return count <= RATE_LIMIT_MAX
    except Exception as exc:
        logger.warning("check_rate_limit failed: %s", exc)
        return True  # fail-open


# ---------------------------------------------------------------------------
# Google OAuth verification
# ---------------------------------------------------------------------------

def verify_google_token(credential: str) -> dict:
    """
    Verify a Google OAuth2 access token (returned by @react-oauth/google's
    implicit flow) by calling Google's userinfo endpoint.

    Returns dict with keys: sub, email, name, picture.
    Raises ValueError if the token is invalid or email is missing.
    """
    import requests as _requests

    try:
        resp = _requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {credential}"},
            timeout=10,
        )
    except Exception as exc:
        raise ValueError(f"Failed to reach Google API: {exc}") from exc

    if resp.status_code != 200:
        raise ValueError(f"Google token verification failed (HTTP {resp.status_code}).")

    data = resp.json()
    email: str = data.get("email", "")
    if not email:
        raise ValueError("Google did not return an email address. Ensure the openid+email scope is granted.")

    return {
        "sub": data.get("sub", ""),
        "email": email,
        "name": data.get("name", ""),
        "picture": data.get("picture", ""),
    }
