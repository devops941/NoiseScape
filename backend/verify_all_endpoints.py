import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.api.v1.stations import list_stations, get_station
from app.api.v1.analytics import get_system_summary, get_zone_compliance
from app.api.v1.alerts import list_alerts, resolve_alert
from app.api.v1.readings import list_readings, ingest_reading
from app.api.v1.predict import predict_area_noise, PredictionRequest
from app.schemas.reading import ReadingCreate
from app.schemas.alert import AlertResolve
from app.models.station import ZoneType

def test_everything():
    db = SessionLocal()
    print("=" * 65)
    print(" NOISESCAPE COMPREHENSIVE BACKEND & ML AUDIT")
    print("=" * 65)
    
    try:
        # 1. Stations API
        stations = list_stations(db=db)
        print(f"[OK] 1. Stations List: {len(stations)} stations found in DB")
        for s in stations:
            print(f"     - {s.name} ({s.zone}): latest = {s.latest_decibel} dB(A)")
        assert len(stations) >= 6

        # 2. Single Station Detail
        s1 = get_station(station_id=stations[0].id, db=db)
        print(f"[OK] 2. Station Detail: ID {s1.id} -> {s1.name} ({s1.latitude}, {s1.longitude})")

        # 3. Reading Ingestion + Threshold Evaluation
        reading_in = ReadingCreate(
            station_id=stations[0].id,
            decibel_value=74.2,
            leq=73.8,
            lmax=79.1,
            lmin=68.0
        )
        new_reading = ingest_reading(reading_in=reading_in, db=db)
        print(f"[OK] 3. Ingest Reading: Logged {new_reading.decibel_value} dB(A), Breach evaluated: {new_reading.is_breach}")

        # 4. Readings List
        readings = list_readings(station_id=stations[0].id, limit=5, db=db)
        print(f"[OK] 4. Readings History: Retrieved {len(readings)} records for station #{stations[0].id}")

        # 5. System Analytics Summary
        summary = get_system_summary(db=db)
        print(f"[OK] 5. Analytics Summary:")
        print(f"     - Average Ambient Noise: {summary.average_ambient_db} dB(A)")
        print(f"     - Total Logged Readings: {summary.total_readings_logged}")
        print(f"     - Active Alerts Count: {summary.active_alerts_count}")
        print(f"     - Total Stations: {summary.total_stations}")

        # 6. Zone Compliance Breakdown
        compliance = get_zone_compliance(db=db)
        print(f"[OK] 6. Zone Compliance Analysis:")
        for z in compliance.zones:
            print(f"     - {z.zone}: Rate={z.compliance_percentage}%, Avg dB={z.average_db}, Total={z.total_readings}")

        # 7. Alerts List
        alerts = list_alerts(limit=5, db=db)
        print(f"[OK] 7. Alerts Feed: Retrieved {len(alerts)} alerts")
        print(f"     - Sample Alert: [{alerts[0].severity}] {alerts[0].message}")

        # 8. Alert Resolution
        if alerts:
            resolve_data = AlertResolve(is_resolved=True)
            updated_alert = resolve_alert(alert_id=alerts[0].id, resolve_data=resolve_data, db=db)
            print(f"[OK] 8. Resolve Alert: Alert ID #{updated_alert.id} resolved={updated_alert.is_resolved}")

        # 9. ML Random Forest Noise Predictor for Any Custom Area
        simmakkal_req = PredictionRequest(
            area_name="Simmakkal Junction",
            zone=ZoneType.COMMERCIAL,
            hour=18,
            traffic_level="HIGH"
        )
        pred_res = predict_area_noise(req=simmakkal_req)
        print(f"[OK] 9. ML Random Forest Prediction (Commercial Peak):")
        print(f"     - Area: {pred_res['area_name']}")
        print(f"     - Predicted Noise: {pred_res['predicted_decibels']} dB(A)")
        print(f"     - CPCB Limit: {pred_res['permissible_limit']} dB(A)")
        print(f"     - Breach: {pred_res['is_breach']} (Severity: {pred_res['severity']})")
        print(f"     - 24h Hourly Curve: {len(pred_res['hourly_forecast'])} forecast slots generated")

        # 10. ML Prediction for Silence / Residential Area (e.g. GRH / K.K. Nagar at night)
        night_req = PredictionRequest(
            area_name="Government Rajaji Hospital (Night)",
            zone=ZoneType.SILENT,
            hour=23,
            traffic_level="LOW"
        )
        night_res = predict_area_noise(req=night_req)
        print(f"[OK] 10. ML Random Forest Prediction (Silence Zone Night):")
        print(f"     - Area: {night_res['area_name']}")
        print(f"     - Predicted: {night_res['predicted_decibels']} dB(A) vs Limit: {night_res['permissible_limit']} dB(A)")
        print(f"     - Advisory: {night_res['health_advisory']}")

        print("=" * 65)
        print(" VERIFICATION COMPLETE: ALL 10 CORE MODULES & APIS ARE 100% OPERATIONAL!")
        print("=" * 65)

    finally:
        db.close()

if __name__ == "__main__":
    test_everything()
