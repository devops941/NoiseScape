from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.models.station import ZoneType
from app.ml.predictor import predictor

router = APIRouter()


class PredictionRequest(BaseModel):
    area_name: str = Field("Custom Location", description="Name of the area/neighborhood")
    zone: ZoneType = Field(ZoneType.COMMERCIAL, description="Regulatory zone type")
    hour: Optional[int] = Field(None, ge=0, le=23, description="Hour of the day (0-23)")
    traffic_level: Optional[str] = Field("NORMAL", description="Traffic condition: LOW, NORMAL, HIGH")


class HourlyItem(BaseModel):
    hour: str
    predicted_db: float
    limit: float
    is_breach: bool


class PredictionResponse(BaseModel):
    area_name: str
    zone: str
    target_hour: str
    traffic_intensity: str
    predicted_decibels: float
    predicted_leq: float
    permissible_limit: float
    is_breach: bool
    breach_amount: float
    severity: str
    health_advisory: str
    hourly_forecast: List[HourlyItem]


@router.post("", response_model=PredictionResponse)
def predict_area_noise(req: PredictionRequest):
    """
    Predict ambient sound level (dB(A)) and CPCB threshold breach
    for any custom area, time of day, and zone using the trained Random Forest model.
    """
    target_hour = req.hour if req.hour is not None else datetime.now(timezone.utc).hour
    zone_val = req.zone.value if hasattr(req.zone, "value") else str(req.zone)

    result = predictor.predict(
        zone=zone_val,
        hour=target_hour,
        traffic_level=req.traffic_level or "NORMAL",
        area_name=req.area_name
    )
    return result

