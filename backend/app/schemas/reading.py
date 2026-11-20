from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReadingBase(BaseModel):
    station_id: int
    decibel_value: float = Field(..., ge=0.0, le=180.0, description="Sound level in dB(A)")
    leq: Optional[float] = Field(None, ge=0.0, le=180.0)
    lmax: Optional[float] = Field(None, ge=0.0, le=180.0)
    lmin: Optional[float] = Field(None, ge=0.0, le=180.0)


class ReadingCreate(ReadingBase):
    recorded_at: Optional[datetime] = None


class ReadingResponse(ReadingBase):
    id: int
    is_breach: bool
    recorded_at: datetime

    class Config:
        from_attributes = True

