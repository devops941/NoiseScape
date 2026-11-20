from app.main import app
from app.db.session import SessionLocal
from app.models.station import Station
from app.models.reading import NoiseReading
from app.models.alert import Alert

db = SessionLocal()
try:
    stations = db.query(Station).all()
    print(f"Total stations in SQLite DB: {len(stations)}")
    for s in stations:
        print(f" - {s.name} ({s.zone}): {s.latitude}, {s.longitude}")

    readings_count = db.query(NoiseReading).count()
    alerts_count = db.query(Alert).count()
    print(f"Total Readings Logged: {readings_count}")
    print(f"Total Alerts Logged: {alerts_count}")
finally:
    db.close()

