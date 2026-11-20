import sys
import os

# Add backend directory to path
backend_dir = os.path.abspath("backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print(" NOISESCAPE SYSTEM COMPREHENSIVE API & FLOW AUDIT")
    print("=" * 60)
    
    passed = 0
    total = 0

    # 1. Root Healthcheck
    total += 1
    r = client.get("/")
    assert r.status_code == 200, f"Root healthcheck failed: {r.status_code}"
    print(f"[PASS] 1. GET / -> Status {r.status_code} | {r.json()['message']}")
    passed += 1

    # 2. Stations API
    total += 1
    r = client.get("/api/v1/stations")
    assert r.status_code == 200, f"Stations API failed: {r.status_code}"
    stations = r.json()
    assert len(stations) > 0, "No stations returned"
    print(f"[PASS] 2. GET /api/v1/stations -> Status {r.status_code} | Total Stations: {len(stations)}")
    for s in stations[:3]:
        print(f"       * {s['name']} ({s['zone']}) - Latest: {s['latest_decibel']} dB")
    passed += 1

    # 3. Single Station Detail
    total += 1
    station_id = stations[0]["id"]
    r = client.get(f"/api/v1/stations/{station_id}")
    assert r.status_code == 200, f"Station detail failed: {r.status_code}"
    print(f"[PASS] 3. GET /api/v1/stations/{station_id} -> Status {r.status_code} | Name: {r.json()['name']}")
    passed += 1

    # 4. Ingest Reading API (Test Adding a New Acoustic Reading)
    total += 1
    reading_payload = {
        "station_id": station_id,
        "decibel_value": 68.4,
        "temperature_celsius": 31.0,
        "humidity_percent": 60.0,
        "traffic_density": "MEDIUM"
    }
    r = client.post("/api/v1/readings", json=reading_payload)
    assert r.status_code == 201, f"Ingest reading failed: {r.status_code} {r.text}"
    new_reading = r.json()
    print(f"[PASS] 4. POST /api/v1/readings -> Status {r.status_code} | Created Reading ID: {new_reading['id']}, dB: {new_reading['decibel_value']}")
    passed += 1

    # 5. Readings History
    total += 1
    r = client.get(f"/api/v1/readings?station_id={station_id}&limit=5")
    assert r.status_code == 200, f"Readings history failed: {r.status_code}"
    readings = r.json()
    assert len(readings) > 0, "No readings returned"
    print(f"[PASS] 5. GET /api/v1/readings -> Status {r.status_code} | Retrieved {len(readings)} records for station {station_id}")
    passed += 1

    # 6. Analytics Summary
    total += 1
    r = client.get("/api/v1/analytics/summary")
    assert r.status_code == 200, f"Summary API failed: {r.status_code}"
    summary = r.json()
    assert "average_ambient_db" in summary, "average_ambient_db missing"
    assert "compliance_rate" in summary, "compliance_rate missing"
    print(f"[PASS] 6. GET /api/v1/analytics/summary -> Status {r.status_code}")
    print(f"       * Avg Noise: {summary['average_ambient_db']} dB")
    print(f"       * Compliance Rate: {summary['compliance_rate']}%")
    print(f"       * Total Logged Readings: {summary['total_readings_logged']}")
    passed += 1

    # 7. Zone Compliance Breakdown
    total += 1
    r = client.get("/api/v1/analytics/zone-compliance")
    assert r.status_code == 200, f"Zone compliance failed: {r.status_code}"
    zones = r.json()
    assert len(zones) > 0, "No zones returned"
    print(f"[PASS] 7. GET /api/v1/analytics/zone-compliance -> Status {r.status_code} | Zones: {len(zones)}")
    for z in zones:
        print(f"       * Zone {z['zone']}: Compliance {z['compliance_rate']}% | Avg dB: {z['average_decibel']}")
    passed += 1

    # 8. Alerts API
    total += 1
    r = client.get("/api/v1/alerts?limit=5")
    assert r.status_code == 200, f"Alerts API failed: {r.status_code}"
    alerts = r.json()
    assert len(alerts) > 0, "No alerts returned"
    print(f"[PASS] 8. GET /api/v1/alerts -> Status {r.status_code} | Total Alerts Sample: {len(alerts)}")
    print(f"       * Latest Alert: {alerts[0]['message']} (Severity: {alerts[0]['severity']})")
    passed += 1

    # 9. Resolve Alert API
    total += 1
    alert_id = alerts[0]["id"]
    r = client.patch(f"/api/v1/alerts/{alert_id}/resolve")
    assert r.status_code == 200, f"Resolve alert failed: {r.status_code}"
    print(f"[PASS] 9. PATCH /api/v1/alerts/{alert_id}/resolve -> Status {r.status_code} | Resolved Alert ID {alert_id}")
    passed += 1

    # 10. Machine Learning Random Forest Noise Prediction API (Simmakkal Circle)
    total += 1
    ml_payload = {
        "area_name": "Simmakkal Junction",
        "zone": "COMMERCIAL",
        "hour": 18,
        "day_of_week": 4,
        "traffic_density": "HIGH",
        "temperature_celsius": 33.0,
        "humidity_percent": 65.0
    }
    r = client.post("/api/v1/predict", json=ml_payload)
    assert r.status_code == 200, f"ML Predict failed: {r.status_code} {r.text}"
    prediction = r.json()
    assert "predicted_decibel" in prediction, "predicted_decibel missing"
    assert "forecast_24h" in prediction, "forecast_24h missing"
    print(f"[PASS] 10. POST /api/v1/predict (ML Random Forest Model) -> Status {r.status_code}")
    print(f"        * Area: {prediction['area_name']}")
    print(f"        * Predicted Noise: {prediction['predicted_decibel']} dB(A)")
    print(f"        * CPCB Limit: {prediction['cpcb_limit']} dB(A)")
    print(f"        * Compliance Status: {prediction['cpcb_status']}")
    print(f"        * 24-Hour Forecast Curve: {len(prediction['forecast_24h'])} hourly points generated")
    passed += 1

    # 11. ML Prediction for a Residential Area (K.K. Nagar)
    total += 1
    res_payload = {
        "area_name": "K.K. Nagar East",
        "zone": "RESIDENTIAL",
        "hour": 23,
        "day_of_week": 6,
        "traffic_density": "LOW",
        "temperature_celsius": 26.0,
        "humidity_percent": 80.0
    }
    r = client.post("/api/v1/predict", json=res_payload)
    assert r.status_code == 200, f"ML Predict residential failed: {r.status_code}"
    res_pred = r.json()
    print(f"[PASS] 11. POST /api/v1/predict (Night Residential Test) -> Status {r.status_code}")
    print(f"        * Area: {res_pred['area_name']} at 23:00 (Night)")
    print(f"        * Predicted: {res_pred['predicted_decibel']} dB(A) | CPCB Night Limit: {res_pred['cpcb_limit']} dB(A)")
    passed += 1

    print("=" * 60)
    print(f" AUDIT RESULT: ALL {passed}/{total} ENDPOINTS & WORKFLOWS PASSED 100%!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

