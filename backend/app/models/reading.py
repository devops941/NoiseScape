from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class NoiseReading(Base):
    __tablename__ = "noise_readings"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    decibel_value = Column(Float, nullable=False)  # Current instant dB(A)
    leq = Column(Float, nullable=True)             # Equivalent continuous sound level
    lmax = Column(Float, nullable=True)            # Max sound level in interval
    lmin = Column(Float, nullable=True)            # Min sound level in interval
    is_breach = Column(Boolean, default=False)     # True if threshold exceeded
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    station = relationship("Station", back_populates="readings")
    alert = relationship("Alert", back_populates="reading", uselist=False)

