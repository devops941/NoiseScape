# NoiseScape — Urban Sound Pollution Mapping & Exposure Intelligence

AI-powered environmental sound pollution monitoring, predictive noise exposure analysis, and CPCB regulatory compliance for Madurai city.

---

## 🏛️ System Architecture Overview

```
Noise/
├── backend/          # FastAPI REST API, SQLAlchemy ORM, SQLite database & ML Noise Predictor
├── frontend/         # React 18 (Vite) single-page app with Tailwind CSS & Leaflet OpenStreetMap
├── data/             # Historical Madurai acoustic readings CSV, seeds, and generators
├── docs/             # Technical architecture, API specification, and CPCB noise standards
├── start_backend.bat # 1-Click launcher for FastAPI backend
└── start_frontend.bat# 1-Click launcher for React frontend
```

---

## 🌟 Key Features

1. **Zero IoT Hardware Dependency**:
   - Driven by 1,008 historical acoustic records (`madurai_noise_readings.csv`) across Madurai key sectors.
   - Built-in Browser Web Audio API sound meter using mobile/laptop microphone.
2. **Machine Learning Noise Predictor**:
   - Trained `RandomForestRegressor` model predicting decibels ($\text{dB(A)}$) for any custom Madurai area with a 24-hour forecast curve.
3. **CPCB Regulatory Compliance Engine**:
   - Enforces Central Pollution Control Board (CPCB) Noise Rules 2000 Schedule IV standards across Silence, Residential, Commercial, and Industrial zones.
4. **Interactive Geospatial GIS Mapping**:
   - 100% Free OpenStreetMap with dynamic sound wave radiuses and dual view modes (🌙 Dark & 🗺️ Streets).
5. **Glassmorphic UI**:
   - Responsive, dark-themed UI built with React 18, Tailwind CSS, and Chart.js.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 1-Click Run (Windows)
- Double-click `start_backend.bat` to launch the API at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).
- Double-click `start_frontend.bat` to launch the React App at `http://localhost:5173`.

---

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Comprehensive Verification
To verify all 10 API endpoints, database integrity, and the ML prediction engine:
```bash
cd backend
python verify_all_endpoints.py
```

---

## 📜 Regulatory Standards (CPCB Schedule IV)

| Zone Type | Day Limit (06:00 - 22:00) | Night Limit (22:00 - 06:00) | Madurai Monitored Sector |
|---|---|---|---|
| **Silence** | 50 dB(A) | 40 dB(A) | Government Rajaji Hospital (GRH) |
| **Residential** | 55 dB(A) | 45 dB(A) | Anna Nagar Residential Sector |
| **Commercial** | 65 dB(A) | 55 dB(A) | Periyar Bus Stand, MIBT, Kalavasal |
| **Industrial** | 75 dB(A) | 70 dB(A) | Kappalur Industrial Estate |

---

## 📄 License
Academic & Open Source Project © 2026 NoiseScape.
