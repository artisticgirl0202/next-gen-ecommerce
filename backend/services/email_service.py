"""
Email service — sends HTML verification emails via Gmail SMTP (TLS).

Environment variables (all read from backend/.env):
  SMTP_SERVER    — SMTP hostname        (default: smtp.gmail.com)
  SMTP_PORT      — SMTP port            (default: 587)
  SMTP_USERNAME  — Gmail address        (e.g. you@gmail.com)
  SMTP_PASSWORD  — Gmail App Password   (16-char, no spaces)
  EMAIL_FROM     — Displayed sender     (defaults to SMTP_USERNAME)
  FRONTEND_URL   — Base URL for links   (default: http://localhost:5173)

Local-dev fallback:
  When SMTP_PASSWORD is absent the function skips the real send and
  prints the verification link to the terminal instead.
"""
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config — read once at import time
# ---------------------------------------------------------------------------
SMTP_SERVER: str   = os.getenv("SMTP_SERVER",   "smtp.gmail.com")
SMTP_PORT: int     = int(os.getenv("SMTP_PORT",  "587"))
SMTP_USERNAME: str = os.getenv("SMTP_USERNAME",  "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD",  "")
EMAIL_FROM: str    = os.getenv("EMAIL_FROM",     SMTP_USERNAME)
FRONTEND_URL: str  = os.getenv("FRONTEND_URL",   "http://localhost:5173")


def _is_configured() -> bool:
    return bool(SMTP_USERNAME and SMTP_PASSWORD)


def _send_raw(to: str, subject: str, html: str) -> None:
    """Open a TLS connection and deliver the message. Raises on any failure."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = EMAIL_FROM
    msg["To"]      = to
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, [to], msg.as_string())


def send_verification_email(to_email: str, token: str) -> None:
    """
    Send a cyberpunk-themed account-verification email.

    Falls back to a console print when SMTP is not configured so that
    local development works without any email setup.
    """
    link = f"{FRONTEND_URL}/verify-email?token={token}"

    # ── Local-dev fallback ────────────────────────────────────────────────
    if not _is_configured():
        print("\n" + "─" * 60)
        print("  [로컬 개발 모드] 이메일 발송 생략")
        print(f"  수신자  : {to_email}")
        print(f"  인증 링크: {link}")
        print("─" * 60 + "\n")
        logger.info("DEV MODE — verification link for %s: %s", to_email, link)
        return

    # ── HTML template (cyberpunk theme) ───────────────────────────────────
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Verify your NEXTGEN account</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;
             font-family:'Courier New',Courier,monospace;color:#e2e8f0">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#0f172a">
    <tr>
      <td align="center" style="padding:40px 16px">

        <!-- ── outer card ──────────────────────────────────────────── -->
        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;
                      background-color:#0f172a;
                      border:1px solid rgba(6,182,212,0.25);
                      border-radius:20px;overflow:hidden">

          <!-- top glow bar -->
          <tr>
            <td style="height:3px;
                       background:linear-gradient(90deg,
                         transparent 0%,
                         #06b6d4 40%,
                         #7c3aed 70%,
                         transparent 100%)">
            </td>
          </tr>

          <!-- scan-line header -->
          <tr>
            <td style="padding:32px 40px 0;
                       background:repeating-linear-gradient(
                         0deg,
                         transparent,transparent 3px,
                         rgba(6,182,212,0.015) 3px,rgba(6,182,212,0.015) 4px)">

              <!-- logo -->
              <p style="margin:0 0 28px;font-size:20px;font-weight:900;
                        color:#ffffff;font-style:italic;letter-spacing:-0.5px">
                NEXTGEN<span style="color:#06b6d4">_</span>
              </p>

              <!-- headline -->
              <h1 style="margin:0 0 8px;font-size:30px;font-weight:900;
                         color:#ffffff;text-transform:uppercase;
                         letter-spacing:-1px;line-height:1.1">
                Verify Your
              </h1>
              <h1 style="margin:0 0 24px;font-size:30px;font-weight:900;
                         color:#06b6d4;text-transform:uppercase;
                         letter-spacing:-1px;line-height:1.1;
                         text-shadow:0 0 20px rgba(6,182,212,0.5)">
                Neural&nbsp;ID
              </h1>

              <!-- divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="margin:0 0 24px">
                <tr>
                  <td style="height:1px;
                             background:linear-gradient(90deg,
                               #06b6d4 0%,rgba(6,182,212,0.1) 100%)">
                  </td>
                </tr>
              </table>

              <!-- body copy -->
              <p style="margin:0 0 10px;font-size:14px;line-height:1.7;
                        color:#94a3b8">
                A new identity has been registered in the system.<br>
                Click the button below to activate your account.
              </p>
              <p style="margin:0 0 32px;font-size:13px;color:#475569">
                This link expires in&nbsp;
                <span style="color:#e2e8f0;font-weight:700">24 hours</span>.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;
                             background:linear-gradient(135deg,#0891b2 0%,#06b6d4 100%);
                             box-shadow:0 0 24px rgba(6,182,212,0.35)">
                    <a href="{link}"
                       target="_blank"
                       style="display:inline-block;padding:15px 44px;
                              font-size:12px;font-weight:900;
                              color:#000000;text-decoration:none;
                              text-transform:uppercase;letter-spacing:3px;
                              font-family:'Courier New',Courier,monospace">
                      &#9654;&nbsp; ACTIVATE ACCOUNT
                    </a>
                  </td>
                </tr>
              </table>

              <!-- fallback link -->
              <p style="margin:28px 0 0;font-size:11px;color:#334155;
                        word-break:break-all;line-height:1.6">
                Button not working? Copy this link:<br>
                <a href="{link}"
                   style="color:#0891b2;text-decoration:underline">{link}</a>
              </p>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:24px 40px;
                       border-top:1px solid rgba(255,255,255,0.05);
                       background-color:rgba(0,0,0,0.2)">
              <p style="margin:0;font-size:11px;color:#1e293b;line-height:1.6">
                You received this message because someone registered with this
                email address on NEXTGEN. If this wasn't you, you can safely
                ignore this email — no account will be activated.
              </p>
            </td>
          </tr>

          <!-- bottom accent bar -->
          <tr>
            <td style="height:2px;
                       background:linear-gradient(90deg,
                         transparent,rgba(6,182,212,0.15),transparent)">
            </td>
          </tr>

        </table>
        <!-- ── / outer card ─────────────────────────────────────────── -->

      </td>
    </tr>
  </table>

</body>
</html>"""

    # ── Attempt real send ─────────────────────────────────────────────────
    try:
        _send_raw(to_email, "Activate your NEXTGEN account", html)
        logger.info("✅ Verification email sent → %s", to_email)
    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP authentication failed for %s. "
            "Check SMTP_USERNAME / SMTP_PASSWORD in backend/.env",
            SMTP_USERNAME,
        )
        raise
    except Exception as exc:
        logger.error("Failed to send verification email to %s: %s", to_email, exc)
        raise


# ---------------------------------------------------------------------------
# Password-reset email
# ---------------------------------------------------------------------------

def send_password_reset_email(to_email: str, token: str) -> None:
    """
    Send a cyberpunk-themed password-reset link to the user.
    Link expires in 15 minutes (enforced by the JWT on the backend).
    Falls back to console print when SMTP is not configured.
    """
    link = f"{FRONTEND_URL}/reset-password?token={token}"

    # ── Local-dev fallback ────────────────────────────────────────────────
    if not _is_configured():
        print("\n" + "─" * 60)
        print("  [로컬 개발 모드] 비밀번호 재설정 이메일 발송 생략")
        print(f"  수신자    : {to_email}")
        print(f"  재설정 링크: {link}")
        print("─" * 60 + "\n")
        logger.info("DEV MODE — password reset link for %s: %s", to_email, link)
        return

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Reset your NEXTGEN password</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;
             font-family:'Courier New',Courier,monospace;color:#e2e8f0">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#0f172a">
    <tr>
      <td align="center" style="padding:40px 16px">

        <table role="presentation" width="560" cellpadding="0" cellspacing="0"
               style="max-width:560px;width:100%;
                      background-color:#0f172a;
                      border:1px solid rgba(244,63,94,0.25);
                      border-radius:20px;overflow:hidden">

          <!-- top glow bar — pink/rose accent for password reset -->
          <tr>
            <td style="height:3px;
                       background:linear-gradient(90deg,
                         transparent 0%,
                         #f43f5e 40%,
                         #7c3aed 70%,
                         transparent 100%)">
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0;
                       background:repeating-linear-gradient(
                         0deg,
                         transparent,transparent 3px,
                         rgba(244,63,94,0.012) 3px,rgba(244,63,94,0.012) 4px)">

              <!-- logo -->
              <p style="margin:0 0 28px;font-size:20px;font-weight:900;
                        color:#ffffff;font-style:italic;letter-spacing:-0.5px">
                NEXTGEN<span style="color:#f43f5e">_</span>
              </p>

              <h1 style="margin:0 0 8px;font-size:30px;font-weight:900;
                         color:#ffffff;text-transform:uppercase;
                         letter-spacing:-1px;line-height:1.1">
                Password
              </h1>
              <h1 style="margin:0 0 24px;font-size:30px;font-weight:900;
                         color:#f43f5e;text-transform:uppercase;
                         letter-spacing:-1px;line-height:1.1;
                         text-shadow:0 0 20px rgba(244,63,94,0.5)">
                Override&nbsp;Request
              </h1>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="margin:0 0 24px">
                <tr>
                  <td style="height:1px;
                             background:linear-gradient(90deg,
                               #f43f5e 0%,rgba(244,63,94,0.1) 100%)">
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 10px;font-size:14px;line-height:1.7;
                        color:#94a3b8">
                A password reset was requested for this identity.<br>
                Click the button below to set a new access code.
              </p>
              <p style="margin:0 0 32px;font-size:13px;color:#475569">
                This link expires in&nbsp;
                <span style="color:#e2e8f0;font-weight:700">15 minutes</span>.
                If you did not request this, ignore this email.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;
                             background:linear-gradient(135deg,#be123c 0%,#f43f5e 100%);
                             box-shadow:0 0 24px rgba(244,63,94,0.35)">
                    <a href="{link}"
                       target="_blank"
                       style="display:inline-block;padding:15px 44px;
                              font-size:12px;font-weight:900;
                              color:#ffffff;text-decoration:none;
                              text-transform:uppercase;letter-spacing:3px;
                              font-family:'Courier New',Courier,monospace">
                      &#9654;&nbsp; RESET ACCESS CODE
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:11px;color:#334155;
                        word-break:break-all;line-height:1.6">
                Button not working? Copy this link:<br>
                <a href="{link}"
                   style="color:#f43f5e;text-decoration:underline">{link}</a>
              </p>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:24px 40px;
                       border-top:1px solid rgba(255,255,255,0.05);
                       background-color:rgba(0,0,0,0.2)">
              <p style="margin:0;font-size:11px;color:#1e293b;line-height:1.6">
                If you did not request a password reset, your account may be
                at risk. Please contact support immediately.
              </p>
            </td>
          </tr>

          <tr>
            <td style="height:2px;
                       background:linear-gradient(90deg,
                         transparent,rgba(244,63,94,0.15),transparent)">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>"""

    try:
        _send_raw(to_email, "Reset your NEXTGEN access code", html)
        logger.info("✅ Password reset email sent → %s", to_email)
    except smtplib.SMTPAuthenticationError:
        logger.error(
            "SMTP authentication failed. "
            "Check SMTP_USERNAME / SMTP_PASSWORD in backend/.env"
        )
        raise
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", to_email, exc)
        raise
