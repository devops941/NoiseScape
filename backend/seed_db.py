"""Database Seeding Script.

Populates the SQLite database with initial monitoring stations from data/seeds/initial_stations.json.
"""
import json
import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.station import Station, ZoneType, StationStatus


def seed_database():
    seed_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seeds", "initial_stations.json")
    if not os.path.exists(seed_path):
        print(f"Seed file not found at {seed_path}")
        return

    print("Creating database tables if not existing...")
    Base.metadata.create_all(bind=engine)

    with open(seed_path, "r", encoding="utf-8") as f:
        stations_data = json.load(f)

    db = SessionLocal()
    try:
        count = 0
        for item in stations_data:
            exists = db.query(Station).filter(Station.name == item["name"]).first()
            if not exists:
                station = Station(
                    name=item["name"],
                    zone=ZoneType(item["zone"]),
                    status=StationStatus.ACTIVE,
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    description=item.get("description", "")
                )
                db.add(station)
                count += 1
        db.commit()
        print(f"Successfully seeded {count} initial monitoring stations into SQLite database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

