from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.station import Station, StationStatus
from app.models.reading import NoiseReading
from app.models.alert import Alert
from app.schemas.analytics import SystemSummaryResponse, ZoneComplianceResponse
from app.services.report_generator import generate_zone_compliance_summary

router = APIRouter()


@router.get("/summary", response_model=SystemSummaryResponse)
def get_system_summary(db: Session = Depends(get_db)):
    """Fetch high-level system summary metrics for dashboard cards."""
    total_stations = db.query(Station).count()
    active_stations = db.query(Station).filter(Station.status == StationStatus.ACTIVE).count()
    total_readings = db.query(NoiseReading).count()
    active_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()
    
    # Calculate average dB across readings
    avg_db = 0.0
    latest_reading = db.query(NoiseReading).order_by(NoiseReading.recorded_at.desc()).first()
    if total_readings > 0:
        readings = db.query(NoiseReading.decibel_value).all()
        avg_db = sum(r[0] for r in readings) / total_readings

    return SystemSummaryResponse(
        total_stations=total_stations,
        active_stations=active_stations,
        total_readings_logged=total_readings,
        active_alerts_count=active_alerts,
        average_ambient_db=round(avg_db, 1),
        latest_reading_time=latest_reading.recorded_at.isoformat() if latest_reading else datetime.now(timezone.utc).isoformat()
    )


@router.get("/zone-compliance", response_model=ZoneComplianceResponse)
def get_zone_compliance(db: Session = Depends(get_db)):
    """Compute zone compliance percentages and breach distributions."""
    zone_stats = generate_zone_compliance_summary(db)
    return ZoneComplianceResponse(zones=zone_stats)

