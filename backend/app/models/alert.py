import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class AlertSeverity(str, enum.Enum):
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False, index=True)
    reading_id = Column(Integer, ForeignKey("noise_readings.id"), nullable=False, unique=True)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.WARNING)
    message = Column(String(255), nullable=False)
    threshold_exceeded = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    station = relationship("Station", back_populates="alerts")
    reading = relationship("NoiseReading", back_populates="alert")

