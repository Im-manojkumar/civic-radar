import logging
logger = logging.getLogger("civic_radar")

def generate_alert_explanation(prompt_text: str) -> str | None:
    """Gemini integration removed. Always returns None to trigger fallback."""
    logger.info("Gemini integration disabled. Using deterministic fallback.")
    return None
