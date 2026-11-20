def test_create_and_list_station(client):
    """Test creating a new station and listing it."""
    payload = {
        "name": "Test Health Clinic",
        "zone": "SILENT",
        "latitude": 28.6000,
        "longitude": 77.2000,
        "description": "Silent hospital zone"
    }
    response = client.post("/api/v1/stations", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Test Health Clinic"
    assert created["zone"] == "SILENT"

    # List stations
    list_res = client.get("/api/v1/stations")
    assert list_res.status_code == 200
    stations = list_res.json()
    assert len(stations) >= 1


def test_ingest_reading_and_alert(client):
    """Test ingesting a high noise reading in a SILENT zone triggers an alert."""
    # 1. Create a station
    station_payload = {
        "name": "Test Silence Zone Station",
        "zone": "SILENT",
        "latitude": 28.6100,
        "longitude": 77.2100,
    }
    station_res = client.post("/api/v1/stations", json=station_payload)
    station_id = station_res.json()["id"]

    # 2. Ingest a high reading (85 dB in SILENT zone, exceeds both day 50dB and night 40dB)
    reading_payload = {
        "station_id": station_id,
        "decibel_value": 85.5,
        "leq": 84.0,
    }
    reading_res = client.post("/api/v1/readings", json=reading_payload)
    assert reading_res.status_code == 201
    reading_data = reading_res.json()
    assert reading_data["is_breach"] is True

    # 3. Verify alert was generated
    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["station_id"] == station_id
    assert alerts[0]["severity"] == "CRITICAL"

