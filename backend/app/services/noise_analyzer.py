"""Core noise analysis engine: threshold verification and level classification."""
from datetime import datetime
from typing import Tuple, Optional
from app.utils.constants import NOISE_LIMITS_DB, TIME_WINDOWS
from app.models.station import ZoneType
from app.models.alert import AlertSeverity


def is_daytime(dt: datetime) -> bool:
    """Return True if the given timestamp falls within daytime hours (06:00 to 22:00)."""
    return TIME_WINDOWS["day_start_hour"] <= dt.hour < TIME_WINDOWS["night_start_hour"]


def get_zone_threshold(zone: ZoneType, dt: datetime) -> float:
    """Retrieve permissible dB limit for given zone and timestamp."""
    zone_key = zone.value if hasattr(zone, "value") else str(zone)
    limits = NOISE_LIMITS_DB.get(zone_key, NOISE_LIMITS_DB["RESIDENTIAL"])
    return limits["day"] if is_daytime(dt) else limits["night"]


def evaluate_reading_threshold(
    zone: ZoneType,
    decibel_value: float,
    recorded_at: datetime
) -> Tuple[bool, Optional[AlertSeverity], Optional[str], float]:
    """
    Evaluates whether a sound level exceeds regulatory thresholds.
    Returns:
        (is_breach, severity, alert_message, allowed_threshold)
    """
    threshold = get_zone_threshold(zone, recorded_at)
    diff = decibel_value - threshold

    if diff <= 0:
        return False, None, None, threshold

    # Sound level exceeds allowed limit
    severity = AlertSeverity.CRITICAL if diff > 10.0 else AlertSeverity.WARNING
    period = "Day" if is_daytime(recorded_at) else "Night"
    message = (
        f"{severity.value} breach in {zone.value} zone: "
        f"{decibel_value:.1f} dB(A) exceeds {period} limit of {threshold:.1f} dB(A) by {diff:.1f} dB."
    )
    return True, severity, message, threshold

