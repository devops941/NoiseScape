from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.reading import NoiseReading
from app.models.station import Station
from app.models.alert import Alert
from app.schemas.reading import ReadingCreate, ReadingResponse
from app.services.noise_analyzer import evaluate_reading_threshold

router = APIRouter()


@router.post("", response_model=ReadingResponse, status_code=status.HTTP_201_CREATED)
def ingest_reading(reading_in: ReadingCreate, db: Session = Depends(get_db)):
    """Ingest a new sound measurement from a station, evaluate thresholds, and trigger alerts if breached."""
    station = db.query(Station).filter(Station.id == reading_in.station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Monitoring station not found")

    recorded_time = reading_in.recorded_at or datetime.now(timezone.utc)
    
    # Evaluate regulatory limit
    is_breach, severity, alert_msg, threshold = evaluate_reading_threshold(
        zone=station.zone,
        decibel_value=reading_in.decibel_value,
        recorded_at=recorded_time
    )

    reading = NoiseReading(
        station_id=reading_in.station_id,
        decibel_value=reading_in.decibel_value,
        leq=reading_in.leq or reading_in.decibel_value,
        lmax=reading_in.lmax or reading_in.decibel_value,
        lmin=reading_in.lmin or reading_in.decibel_value,
        is_breach=is_breach,
        recorded_at=recorded_time,
    )
    db.add(reading)
    db.flush()

    if is_breach and severity and alert_msg:
        alert = Alert(
            station_id=station.id,
            reading_id=reading.id,
            severity=severity,
            message=alert_msg,
            threshold_exceeded=threshold,
            actual_value=reading.decibel_value,
            is_resolved=False,
            created_at=recorded_time,
        )
        db.add(alert)

    db.commit()
    db.refresh(reading)
    return reading


@router.get("", response_model=List[ReadingResponse])
def list_readings(
    station_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List historical noise readings with optional station filter."""
    query = db.query(NoiseReading)
    if station_id:
        query = query.filter(NoiseReading.station_id == station_id)
    return query.order_by(NoiseReading.recorded_at.desc()).limit(limit).all()

