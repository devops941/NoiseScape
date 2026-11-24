from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.station import ZoneType, StationStatus


class StationBase(BaseModel):
    name: str = Field(..., max_length=100)
    zone: ZoneType = ZoneType.RESIDENTIAL
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    description: Optional[str] = None


class StationCreate(StationBase):
    pass


class StationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    zone: Optional[ZoneType] = None
    status: Optional[StationStatus] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    description: Optional[str] = None


class StationResponse(StationBase):
    id: int
    status: StationStatus
    created_at: datetime
    latest_decibel: Optional[float] = None

    class Config:
        from_attributes = True

