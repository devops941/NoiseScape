# REST API Specification (v1)

**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Monitoring Stations (`/stations`)

### `GET /stations`
List all registered noise monitoring stations with optional zone or status filters.
- **Query Parameters**:
  - `zone` (optional): `SILENT` | `RESIDENTIAL` | `COMMERCIAL` | `INDUSTRIAL`
  - `status` (optional): `ACTIVE` | `INACTIVE` | `MAINTENANCE`
- **Response**: `200 OK` — Array of `StationResponse` objects.

### `POST /stations`
Register a new noise monitoring station.
- **Request Body**:
  ```json
  {
    "name": "Central Hospital Gate 2",
    "zone": "SILENT",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "description": "Installed near ICU building"
  }
  ```
- **Response**: `201 Created` — Created `StationResponse`.

### `GET /stations/{station_id}`
Retrieve details for a specific station along with latest sound reading.

---

## 2. Noise Readings (`/readings`)

### `POST /readings`
Ingest sound level readings from a monitoring node or sensor.
- **Request Body**:
  ```json
  {
    "station_id": 1,
    "decibel_value": 68.4,
    "leq": 65.2,
    "lmax": 74.1,
    "lmin": 52.0,
    "recorded_at": "2026-11-20T14:30:00Z"
  }
  ```
- **Response**: `201 Created` — `ReadingResponse` (includes threshold violation check).

### `GET /readings`
Fetch readings with filtering and pagination.
- **Query Parameters**:
  - `station_id` (optional): integer
  - `start_time` (optional): ISO-8601 string
  - `end_time` (optional): ISO-8601 string
  - `limit`: default `100`

---

## 3. Alerts (`/alerts`)

### `GET /alerts`
List triggered threshold violation alerts.
- **Query Parameters**:
  - `severity` (optional): `WARNING` | `CRITICAL`
  - `resolved` (optional): boolean
- **Response**: `200 OK` — Array of `AlertResponse` objects.

### `PATCH /alerts/{alert_id}/resolve`
Mark an alert incident as acknowledged or resolved.

---

## 4. Analytics & Compliance (`/analytics`)

### `GET /analytics/summary`
Get high-level system summary metrics (average dB, active stations, breach counts).

### `GET /analytics/zone-compliance`
Get compliance percentage across all four zones (Silent, Residential, Commercial, Industrial).

### `GET /analytics/trends/{station_id}`
Time-series day vs. night Leq analysis for a specific station.

