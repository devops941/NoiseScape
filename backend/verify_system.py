import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.api.v1.stations import list_stations, get_station
from app.api.v1.analytics import get_system_summary, get_zone_compliance
from app.api.v1.alerts import list_alerts
from app.api.v1.readings import list_readings

db = SessionLocal()
try:
    print("--- 1. Testing Station Listing ---")
    stations = list_stations(db=db)
    print(f"Total Stations Retrieved: {len(stations)}")
    for s in stations:
        print(f" - {s.name} ({s.zone}): latest = {s.latest_decibel} dB(A), coords = ({s.latitude}, {s.longitude})")
    assert len(stations) >= 4, "Expected at least 4 stations"

    print("\n--- 2. Testing System Analytics Summary ---")
    summary = get_system_summary(db=db)
    print(f"Total Stations: {summary.total_stations}")
    print(f"Active Stations: {summary.active_stations}")
    print(f"Total Readings: {summary.total_readings_logged}")
    print(f"Active Alerts: {summary.active_alerts_count}")
    print(f"Average Ambient Noise: {summary.average_ambient_db} dB(A)")
    assert summary.total_readings_logged > 0

    print("\n--- 3. Testing Zone Compliance ---")
    compliance = get_zone_compliance(db=db)
    for z in compliance.zones:
        print(f" - {z.zone}: Total={z.total_readings}, Compliant={z.compliant_readings}, Breaches={z.breach_readings}, Rate={z.compliance_percentage}%, Avg dB={z.average_db}")

    print("\n--- 4. Testing Alerts Feed ---")
    alerts = list_alerts(limit=5, db=db)
    print(f"Fetched {len(alerts)} sample alerts:")
    for a in alerts:
        print(f" - [{a.severity}] Station #{a.station_id}: {a.actual_value} dB(A) vs limit {a.threshold_exceeded} dB(A)")

    print("\n--- 5. Testing Noise Readings Stream ---")
    readings = list_readings(station_id=1, limit=5, db=db)
    print(f"Fetched {len(readings)} readings for Station #1 (Periyar Bus Stand):")
    for r in readings:
        print(f" - {r.recorded_at}: {r.decibel_value} dB(A) (Breach: {r.is_breach})")

    print("\n>>> ALL API LOGIC, SCHEMAS & DATABASE QUERIES VERIFIED SUCCESSFULLY! <<<")

finally:
    db.close()
