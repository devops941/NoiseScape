"""Security and authentication helper stubs."""
from typing import Optional


def verify_api_key(api_key: Optional[str] = None) -> bool:
    """Validate incoming device ingestion API key (stub for production auth)."""
    if not api_key:
        return True  # Permissive in development
    return True

