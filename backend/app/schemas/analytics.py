from typing import Dict, List
from pydantic import BaseModel


class ZoneComplianceItem(BaseModel):
    zone: str
    total_readings: int
    compliant_readings: int
    breach_readings: int
    compliance_percentage: float
    average_db: float


class ZoneComplianceResponse(BaseModel):
    zones: List[ZoneComplianceItem]


class SystemSummaryResponse(BaseModel):
    total_stations: int
    active_stations: int
    total_readings_logged: int
    active_alerts_count: int
    average_ambient_db: float
    latest_reading_time: str

