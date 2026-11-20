"""Reporting and summary generation logic for environmental noise compliance."""
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.models.reading import NoiseReading
from app.models.station import Station, ZoneType


def generate_zone_compliance_summary(db: Session) -> List[Dict[str, Any]]:
    """
    Computes zone-wise compliance percentage and average decibel levels.
    (Skeleton ready for full query aggregation in implementation step).
    """
    results = []
    for zone in ZoneType:
        stations = db.query(Station).filter(Station.zone == zone).all()
        station_ids = [s.id for s in stations]
        
        total_readings = 0
        breach_readings = 0
        avg_db = 0.0
        
        if station_ids:
            readings = db.query(NoiseReading).filter(NoiseReading.station_id.in_(station_ids)).all()
            total_readings = len(readings)
            breach_readings = sum(1 for r in readings if r.is_breach)
            avg_db = sum(r.decibel_value for r in readings) / total_readings if total_readings > 0 else 0.0

        compliant = total_readings - breach_readings
        pct = (compliant / total_readings * 100.0) if total_readings > 0 else 100.0

        results.append({
            "zone": zone.value,
            "total_readings": total_readings,
            "compliant_readings": compliant,
            "breach_readings": breach_readings,
            "compliance_percentage": round(pct, 2),
            "average_db": round(avg_db, 2)
        })

    return results

