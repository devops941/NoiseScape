"""CSV Import Script for NoiseGuard.

Imports readings from a CSV file (e.g. data/raw/madurai_noise_readings.csv)
directly into the SQLite database with station auto-registration and alert generation.
"""
import csv
import os
import sys
from datetime import datetime

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.station import Station, ZoneType, StationStatus
from app.models.reading import NoiseReading
from app.models.alert import Alert, AlertSeverity
from app.services.noise_analyzer import evaluate_reading_threshold


def import_csv(csv_path: str = None):
    if not csv_path:
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data", "raw", "madurai_noise_readings.csv"
        )

    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return

    print(f"Importing data from: {csv_path}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            alert_count = 0

            # Cache stations by name
            stations_map = {s.name: s for s in db.query(Station).all()}

            for row in reader:
                st_name = row["station_name"]
                zone_str = row.get("zone", "COMMERCIAL").upper()
                zone = ZoneType[zone_str] if zone_str in ZoneType.__members__ else ZoneType.COMMERCIAL

                # Ensure station exists
                if st_name not in stations_map:
                    station = Station(
                        name=st_name,
                        zone=zone,
                        status=StationStatus.ACTIVE,
                        latitude=float(row["latitude"]),
                        longitude=float(row["longitude"]),
                        description=row.get("location", "")
                    )
                    db.add(station)
                    db.flush()
                    stations_map[st_name] = station
                else:
                    station = stations_map[st_name]

                # Parse timestamp
                time_str = row["recorded_at"].replace("Z", "+00:00")
                try:
                    recorded_dt = datetime.fromisoformat(time_str)
                except Exception:
                    recorded_dt = datetime.utcnow()

                db_val = float(row["decibel_value"])
                leq = float(row.get("leq") or db_val)
                lmax = float(row.get("lmax") or db_val)
                lmin = float(row.get("lmin") or db_val)

                # Check threshold
                is_breach, severity, alert_msg, threshold = evaluate_reading_threshold(
                    zone=station.zone,
                    decibel_value=db_val,
                    recorded_at=recorded_dt
                )

                reading = NoiseReading(
                    station_id=station.id,
                    decibel_value=db_val,
                    leq=leq,
                    lmax=lmax,
                    lmin=lmin,
                    is_breach=is_breach,
                    recorded_at=recorded_dt,
                )
                db.add(reading)
                db.flush()

                if is_breach and severity and alert_msg:
                    alert = Alert(
                        station_id=station.id,
                        reading_id=reading.id,
                        severity=severity,
                        message=alert_msg,
                        threshold_exceeded=threshold,
                        actual_value=db_val,
                        is_resolved=False,
                        created_at=recorded_dt,
                    )
                    db.add(alert)
                    alert_count += 1

                count += 1
                if count % 200 == 0:
                    db.commit()
                    print(f"Processed {count} rows...")

            db.commit()
            print(f"Successfully imported {count} readings and logged {alert_count} threshold alerts into SQLite!")

    except Exception as e:
        db.rollback()
        print(f"Failed to import CSV: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    import_csv(target)

