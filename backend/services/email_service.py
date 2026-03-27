"""
backend/services/email_service.py

Sends transactional emails via Resend's HTTPS REST API (port 443).

Why not SMTP?
  Render.com free tier blocks all outbound SMTP traffic (port 587, 465, 25).
  The Resend HTTP API communicates only over HTTPS (port 443) which is always
  open, making it the reliable choice for serverless / managed hosting.

Environment variables (set in backend/.env AND in Render dashboard):
  RESEND_API_KEY  — your Resend API key (re_xxxxxxxxxxxx)
                    Get one free at https://resend.com
  EMAIL_FROM      — verified sender address registered in Resend
                    Falls back to "onboarding@resend.dev" (Resend sandbox)
  FRONTEND_URL    — base URL for action links (default: http://localhost:5173)

Local-dev fallback:
  When RESEND_API_KEY is absent the function skips the real HTTP call and
  prints the action link to the terminal so development works without any
  email setup.
"""
from __future__ import annotations

import logging
import os

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config — read at import time
# ---------------------------------------------------------------------------
RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM: str     = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
FRONTEND_URL: str   = os.getenv("FRONTEND_URL", "http://localhost:5173")

_RESEND_ENDPOINT = "https://api.resend.com/emails"
_TIMEOUT_SECONDS = 15


def _is_configured() -> bool:
    return bool(RESEND_API_KEY)


# ---------------------------------------------------------------------------
# Low-level send — shared by both public functions
# ---------------------------------------------------------------------------

async def _send(*, to: str, subject: str, html: str) -> None:
    """
    POST to Resend's /emails endpoint.

    Raises RuntimeError on HTTP errors or network failures so callers
    (and their BackgroundTask wrappers) can log and discard as needed.
    """
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": EMAIL_FROM,
        "to":   [to],
        "subject": subject,
        "html": html,
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
        resp = await client.post(_RESEND_ENDPOINT, json=payload, headers=headers)

    if resp.is_success:
        msg_id = resp.json().get("id", "n/a")
        logger.info("✅ Email sent via Resend → %s  (id=%s)", to, msg_id)
    else:
        # Log the full error body so debugging is straightforward
        logger.error(
            "❌ Resend API error  status=%s  to=%s\n  body: %s",
            resp.status_code,
            to,
            resp.text[:500],
        )
        raise RuntimeError(
            f"Resend returned HTTP {resp.status_code}: {resp.text[:200]}"
        )


# ---------------------------------------------------------------------------
# HTML templates — helpers
# ---------------------------------------------------------------------------

def _base_card(*, accent: str, glow: str, content: str, footer: str) -> str:
    """Shared outer card shell. accent/glow are hex colours."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0f172a;
             font-family:'Courier New',Courier,monospace;color:#e2e8f0">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#0f172a">
    <tr>
      <td align="center" style="padding:48px 16px">

        <!-- outer card -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;background:#0f172a;
                      border:1px solid {accent}40;
                      border-radius:16px;overflow:hidden;
                      box-shadow:0 0 48px {glow}18">

          <!-- top accent bar -->
          <tr>
            <td style="height:3px;
                       background:linear-gradient(90deg,
                         transparent 0%,{accent} 40%,#7c3aed 70%,transparent 100%)">
            </td>
          </tr>

          <!-- body -->
          <tr>
            <td style="padding:36px 44px 28px;
                       background:repeating-linear-gradient(
                         0deg,transparent,transparent 3px,
                         {glow}04 3px,{glow}04 4px)">
              {content}
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:20px 44px 24px;
                       border-top:1px solid #ffffff0d;
                       background:#00000022">
              <p style="margin:0;font-size:11px;color:#334155;line-height:1.6">
                {footer}
              </p>
            </td>
          </tr>

          <!-- bottom accent bar -->
          <tr>
            <td style="height:2px;
                       background:linear-gradient(90deg,
                         transparent,{accent}26,transparent)">
            </td>
          </tr>
        </table>
        <!-- / outer card -->

      </td>
    </tr>
  </table>
</body>
</html>"""


def _cta_button(*, href: str, label: str, accent: str, text_color: str = "#000") -> str:
    return f"""
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px">
      <tr>
        <td style="border-radius:10px;
                   background:linear-gradient(135deg,{accent}cc 0%,{accent} 100%);
                   box-shadow:0 0 28px {accent}44">
          <a href="{href}" target="_blank"
             style="display:inline-block;padding:14px 48px;
                    font-size:11px;font-weight:900;color:{text_color};
                    text-decoration:none;text-transform:uppercase;
                    letter-spacing:3px;
                    font-family:'Courier New',Courier,monospace">
            &#9654;&nbsp; {label}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:11px;color:#334155;
              word-break:break-all;line-height:1.6">
      Button not working? Copy this link:<br>
      <a href="{href}"
         style="color:{accent};text-decoration:underline">{href}</a>
    </p>"""


def _divider(accent: str) -> str:
    return f"""
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin:0 0 24px">
      <tr>
        <td style="height:1px;
                   background:linear-gradient(90deg,
                     {accent} 0%,{accent}1a 100%)">
        </td>
      </tr>
    </table>"""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def send_verification_email(to_email: str, token: str) -> None:
    """
    Send a verification email after sign-up.
    Falls back to a console print when RESEND_API_KEY is not configured
    so that local development works without any email setup.
    """
    link = f"{FRONTEND_URL}/verify-email?token={token}"

    # ── Local-dev fallback ────────────────────────────────────────────────
    if not _is_configured():
        _dev_print("Email verification", to_email, link)
        return

    accent = "#06b6d4"   # cyan
    glow   = "#06b6d4"

    content = f"""
      <p style="margin:0 0 28px;font-size:20px;font-weight:900;
                color:#fff;font-style:italic;letter-spacing:-0.5px">
        NEXTGEN<span style="color:{accent}">_</span>
      </p>
      <h1 style="margin:0 0 4px;font-size:28px;font-weight:900;
                 color:#fff;text-transform:uppercase;letter-spacing:-1px">
        Verify Your
      </h1>
      <h1 style="margin:0 0 22px;font-size:28px;font-weight:900;
                 color:{accent};text-transform:uppercase;letter-spacing:-1px;
                 text-shadow:0 0 20px {accent}80">
        Neural&nbsp;ID
      </h1>

      {_divider(accent)}

      <p style="margin:0 0 8px;font-size:14px;line-height:1.75;color:#94a3b8">
        A new identity has been registered in the system.<br>
        Click the button below to activate your account.
      </p>
      <p style="margin:0 0 28px;font-size:13px;color:#475569">
        This link expires in
        <span style="color:#e2e8f0;font-weight:700">24 hours</span>.
      </p>

      {_cta_button(href=link, label="ACTIVATE ACCOUNT", accent=accent)}
    """

    footer = (
        "You received this message because someone registered with this "
        "email address on NEXTGEN. If this wasn't you, you can safely "
        "ignore this email — no account will be activated."
    )

    html = _base_card(accent=accent, glow=glow, content=content, footer=footer)

    try:
        await _send(to=to_email, subject="Activate your NEXTGEN account", html=html)
    except Exception as exc:
        logger.error("send_verification_email failed for %s: %s", to_email, exc)
        raise


async def send_password_reset_email(to_email: str, token: str) -> None:
    """
    Send a password-reset link.
    The link expires in 15 minutes (enforced by the JWT on the backend).
    Falls back to console print when RESEND_API_KEY is not configured.
    """
    link = f"{FRONTEND_URL}/reset-password?token={token}"

    # ── Local-dev fallback ────────────────────────────────────────────────
    if not _is_configured():
        _dev_print("Password reset", to_email, link)
        return

    accent = "#f43f5e"   # rose / pink
    glow   = "#f43f5e"

    content = f"""
      <p style="margin:0 0 28px;font-size:20px;font-weight:900;
                color:#fff;font-style:italic;letter-spacing:-0.5px">
        NEXTGEN<span style="color:{accent}">_</span>
      </p>
      <h1 style="margin:0 0 4px;font-size:28px;font-weight:900;
                 color:#fff;text-transform:uppercase;letter-spacing:-1px">
        Password
      </h1>
      <h1 style="margin:0 0 22px;font-size:28px;font-weight:900;
                 color:{accent};text-transform:uppercase;letter-spacing:-1px;
                 text-shadow:0 0 20px {accent}80">
        Override&nbsp;Request
      </h1>

      {_divider(accent)}

      <p style="margin:0 0 8px;font-size:14px;line-height:1.75;color:#94a3b8">
        A password reset was requested for this identity.<br>
        Click the button below to set a new access code.
      </p>
      <p style="margin:0 0 28px;font-size:13px;color:#475569">
        This link expires in
        <span style="color:#e2e8f0;font-weight:700">15 minutes</span>.
        If you did not request this, ignore this email.
      </p>

      {_cta_button(href=link, label="RESET ACCESS CODE",
                   accent=accent, text_color="#ffffff")}
    """

    footer = (
        "If you did not request a password reset, your account may be "
        "at risk. Please contact support immediately."
    )

    html = _base_card(accent=accent, glow=glow, content=content, footer=footer)

    try:
        await _send(to=to_email, subject="Reset your NEXTGEN access code", html=html)
    except Exception as exc:
        logger.error("send_password_reset_email failed for %s: %s", to_email, exc)
        raise


# ---------------------------------------------------------------------------
# Dev helper
# ---------------------------------------------------------------------------

def _dev_print(label: str, to: str, link: str) -> None:
    sep = "─" * 62
    print(f"\n{sep}")
    print(f"  [DEV MODE] {label} — email send skipped (no RESEND_API_KEY)")
    print(f"  To  : {to}")
    print(f"  Link: {link}")
    print(f"{sep}\n")
    logger.info("DEV — %s link for %s → %s", label, to, link)
