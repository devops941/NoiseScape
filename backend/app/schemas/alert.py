from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertSeverity


class AlertBase(BaseModel):
    station_id: int
    reading_id: int
    severity: AlertSeverity
    message: str
    threshold_exceeded: float
    actual_value: float


class AlertResolve(BaseModel):
    is_resolved: bool = True


class AlertResponse(AlertBase):
    id: int
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

