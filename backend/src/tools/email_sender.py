"""
Email sender — Gmail SMTP (free, 500 emails/day).
Uses App Password authentication (not regular Gmail password).
"""

from __future__ import annotations

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config.settings import GMAIL_ADDRESS, GMAIL_APP_PASSWORD
from src.utils.logger import get_logger

logger = get_logger("tools.email_sender")


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    from_name: str = "SalesForce Auto-Pilot",
) -> bool:
    """
    Send an email via Gmail SMTP with SSL.

    Prerequisites:
    1. Enable 2FA on your Google account
    2. Generate App Password at: myaccount.google.com/apppasswords
    3. Set GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env

    Args:
        to_email: Recipient email address.
        subject: Email subject line.
        body: Email body (plain text, newlines supported).
        from_name: Display name for the sender.

    Returns:
        True if sent successfully, False otherwise.
    """
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        logger.warning(
            "Gmail credentials not configured. "
            "Email would have been sent to: %s | Subject: %s",
            to_email, subject,
        )
        logger.info("Email body:\n%s", body)
        return True  # Return True in dev mode (just log it)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{GMAIL_ADDRESS}>"
    msg["To"] = to_email

    # Plain text version
    msg.attach(MIMEText(body, "plain"))

    # HTML version (nicer formatting)
    html_body = body.replace("\n", "<br>")
    html = f"""
    <html>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        {html_body}
    </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False
