# System Architecture & Technical Design

## 1. Introduction
The **Environmental Noise Pollution Monitoring & Mapping System** is designed to capture, process, analyse, and present ambient sound pressure levels across geographical zones. It enables urban planners, environmental researchers, and local authorities to monitor regulatory compliance with noise pollution standards.

---

## 2. Architectural Pattern: Layered Clean Architecture

The platform uses a decoupled client-server architecture:

```
[IoT / Sound Sensors / Web Audio Input]
                   │
                   ▼ (HTTP JSON Payload)
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Port 8000)              │
│                                                             │
│   ┌───────────────┐     ┌───────────────┐     ┌──────────┐  │
│   │  API Routers  │ ──► │  Services &   │ ──► │ Database │  │
│   │ (v1 Endpoints)│     │  Analyzers    │     │  Models  │  │
│   └───────────────┘     └───────────────┘     └────┬─────┘  │
│           ▲                                        │        │
│           │ Pydantic Validation                    ▼        │
│           │                                   SQLite DB     │
└───────────┼─────────────────────────────────────────────────┘
            │
            │ REST API (JSON) / WebSocket
            ▼
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite, Port 5173)            │
│                                                             │
│   ┌───────────────┐     ┌───────────────┐     ┌──────────┐  │
│   │ Pages & Views │ ──► │  Components   │ ──► │ Services │  │
│   │ (Router)      │     │ (Maps, Charts)│     │ (Axios)  │  │
│   └───────────────┘     └───────────────┘     └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture (`backend/app`)

- **`core/config.py`**: Centralized application configuration using `pydantic-settings`. Reads environment variables with defaults.
- **`db/`**:
  - `session.py`: Manages SQLite engine, connection pooling parameters, and `get_db` generator.
  - `base.py`: Central declarative base for SQLAlchemy models.
- **`models/`**:
  - `Station`: Physical or virtual noise monitoring station (location, coordinates, zone category).
  - `NoiseReading`: Decibel measurements (`decibel_value`, `leq`, `lmax`, `lmin`, `timestamp`).
  - `Alert`: Triggered notifications when a reading exceeds the zone's day/night threshold.
- **`schemas/`**: Pydantic models for strict input validation, serialization, and OpenAPI generation.
- **`services/`**:
  - `noise_analyzer.py`: Compares ingested readings against zone rules and computes Leq (Equivalent Continuous Sound Level).
  - `report_generator.py`: Aggregates hourly/daily compliance rates.
- **`api/v1/`**: Modular routing endpoints for `/stations`, `/readings`, `/alerts`, and `/analytics`.

---

## 4. Frontend Architecture (`frontend/src`)

- **`components/common/`**: Reusable UI elements such as `Navbar`, `Sidebar`, `StatCard`, and `NoiseBadge`.
- **`components/map/`**: Geospatial visualization (`NoiseMap`) using Leaflet to render stations, color-coded by noise status.
- **`components/charts/`**: Time-series charts (`NoiseTrendChart`, `ZoneBarChart`) showing dB trends over time.
- **`pages/`**: Primary route views (`Dashboard`, `MapView`, `Stations`, `Analytics`, `Alerts`).
- **`services/`**: Modular API client communicating with the backend via Axios with standard error handling.
- **`context/`**: React Context provider (`NoiseContext`) managing shared station and notification state.

