from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.station import Station, ZoneType, StationStatus
from app.models.reading import NoiseReading
from app.schemas.station import StationCreate, StationResponse, StationUpdate

router = APIRouter()


@router.get("", response_model=List[StationResponse])
def list_stations(
    zone: Optional[ZoneType] = None,
    status: Optional[StationStatus] = None,
    db: Session = Depends(get_db)
):
    """Retrieve all monitoring stations with optional zone or status filters."""
    query = db.query(Station)
    if zone:
        query = query.filter(Station.zone == zone)
    if status:
        query = query.filter(Station.status == status)
    
    stations = query.all()
    # Attach latest decibel reading
    response_items = []
    for s in stations:
        latest = db.query(NoiseReading).filter(NoiseReading.station_id == s.id).order_by(NoiseReading.recorded_at.desc()).first()
        res = StationResponse.model_validate(s)
        res.latest_decibel = latest.decibel_value if latest else None
        response_items.append(res)
    return response_items


@router.post("", response_model=StationResponse, status_code=status.HTTP_201_CREATED)
def create_station(station_in: StationCreate, db: Session = Depends(get_db)):
    """Register a new noise monitoring station."""
    existing = db.query(Station).filter(Station.name == station_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A station with this name already exists")
    
    station = Station(**station_in.model_dump())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station


@router.get("/{station_id}", response_model=StationResponse)
def get_station(station_id: int, db: Session = Depends(get_db)):
    """Fetch station details by ID."""
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    latest = db.query(NoiseReading).filter(NoiseReading.station_id == station.id).order_by(NoiseReading.recorded_at.desc()).first()
    res = StationResponse.model_validate(station)
    res.latest_decibel = latest.decibel_value if latest else None
    return res


@router.put("/{station_id}", response_model=StationResponse)
@router.patch("/{station_id}", response_model=StationResponse)
def update_station(
    station_id: int,
    station_in: StationUpdate,
    db: Session = Depends(get_db)
):
    """Update details of an existing noise monitoring station."""
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    update_data = station_in.model_dump(exclude_unset=True)

    # Check unique name if name is being changed
    if "name" in update_data and update_data["name"] and update_data["name"].strip():
        new_name = update_data["name"].strip()
        if new_name != station.name:
            existing = db.query(Station).filter(Station.name == new_name).first()
            if existing:
                raise HTTPException(status_code=400, detail="A station with this name already exists")
        update_data["name"] = new_name

    for field, value in update_data.items():
        setattr(station, field, value)

    db.commit()
    db.refresh(station)

    latest = db.query(NoiseReading).filter(NoiseReading.station_id == station.id).order_by(NoiseReading.recorded_at.desc()).first()
    res = StationResponse.model_validate(station)
    res.latest_decibel = latest.decibel_value if latest else None
    return res


