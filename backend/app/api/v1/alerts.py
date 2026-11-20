from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.alert import Alert, AlertSeverity
from app.schemas.alert import AlertResponse, AlertResolve

router = APIRouter()


@router.get("", response_model=List[AlertResponse])
def list_alerts(
    severity: Optional[AlertSeverity] = None,
    is_resolved: Optional[bool] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve threshold violation alerts with optional filtering."""
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: int,
    resolve_data: AlertResolve,
    db: Session = Depends(get_db)
):
    """Update resolution status for an alert."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = resolve_data.is_resolved
    db.commit()
    db.refresh(alert)
    return alert

