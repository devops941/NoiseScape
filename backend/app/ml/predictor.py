"""Machine Learning Noise Predictor Model.

Trained on Madurai environmental noise measurements to forecast
acoustic pressure levels (dB(A)) and CPCB threshold breach probability
for ANY location, zone type, and time window.
"""
import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_FILE = os.path.join(MODEL_DIR, "trained_noise_model.joblib")
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(MODEL_DIR))), "data", "raw", "madurai_noise_readings.csv")

CPCB_LIMITS = {
    "SILENT": {"day": 50.0, "night": 40.0},
    "RESIDENTIAL": {"day": 55.0, "night": 45.0},
    "COMMERCIAL": {"day": 65.0, "night": 55.0},
    "INDUSTRIAL": {"day": 75.0, "night": 70.0},
}

ZONE_MAP = {
    "SILENT": 0,
    "RESIDENTIAL": 1,
    "COMMERCIAL": 2,
    "INDUSTRIAL": 3,
}

TRAFFIC_MAP = {
    "LOW": 0.8,
    "NORMAL": 1.0,
    "HIGH": 1.25,
}


class NoisePredictor:
    def __init__(self):
        self.model = None
        self._load_or_train()

    def _extract_features(self, df):
        # Parse timestamp into hour, is_daytime, is_rush_hour, is_weekend
        dt = pd.to_datetime(df["recorded_at"])
        hours = dt.dt.hour
        is_daytime = ((hours >= 6) & (hours < 22)).astype(int)
        is_rush = (((hours >= 8) & (hours <= 11)) | ((hours >= 17) & (hours <= 21))).astype(int)
        zone_enc = df["zone"].map(ZONE_MAP).fillna(2)

        # Feature matrix
        X = pd.DataFrame({
            "zone_enc": zone_enc,
            "hour": hours,
            "is_daytime": is_daytime,
            "is_rush": is_rush,
            "traffic_factor": 1.0,
        })
        return X

    def _load_or_train(self):
        if os.path.exists(MODEL_FILE):
            try:
                self.model = joblib.load(MODEL_FILE)
                return
            except Exception:
                pass
        
        self.train_model()

    def train_model(self):
        if not os.path.exists(CSV_PATH):
            print(f"Warning: Dataset not found at {CSV_PATH}. Creating baseline model.")
            return

        print("Training Random Forest Noise Predictor from Madurai dataset...")
        df = pd.read_csv(CSV_PATH)
        X = self._extract_features(df)
        y = df["decibel_value"].values

        model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=12)
        model.fit(X, y)
        self.model = model

        joblib.dump(model, MODEL_FILE)
        print("Noise Predictor model successfully trained and saved!")

    def predict(self, zone: str, hour: int, traffic_level: str = "NORMAL", area_name: str = "Custom Area"):
        zone_key = zone.upper() if zone else "COMMERCIAL"
        traffic_factor = TRAFFIC_MAP.get(traffic_level.upper(), 1.0)
        zone_enc = ZONE_MAP.get(zone_key, 2)

        is_daytime = 1 if 6 <= hour < 22 else 0
        is_rush = 1 if (8 <= hour <= 11) or (17 <= hour <= 21) else 0

        # Construct single feature row
        X_in = pd.DataFrame([{
            "zone_enc": zone_enc,
            "hour": hour,
            "is_daytime": is_daytime,
            "is_rush": is_rush,
            "traffic_factor": traffic_factor,
        }])

        if self.model:
            base_pred = float(self.model.predict(X_in)[0])
        else:
            # Fallback baseline
            base_pred = 65.0 + (zone_enc * 3) + (5.0 if is_rush else 0.0)

        # Apply traffic factor variance
        predicted_db = round(base_pred * (0.95 if traffic_level == "LOW" else 1.05 if traffic_level == "HIGH" else 1.0), 1)

        limit = CPCB_LIMITS.get(zone_key, CPCB_LIMITS["COMMERCIAL"])["day" if is_daytime else "night"]
        diff = round(predicted_db - limit, 1)
        is_breach = diff > 0

        severity = "SAFE"
        if is_breach:
            severity = "CRITICAL" if diff > 10.0 else "WARNING"

        # Generate 24-hour predictive profile for this area
        hourly_forecast = []
        for h in range(24):
            h_day = 1 if 6 <= h < 22 else 0
            h_rush = 1 if (8 <= h <= 11) or (17 <= h <= 21) else 0
            h_X = pd.DataFrame([{
                "zone_enc": zone_enc,
                "hour": h,
                "is_daytime": h_day,
                "is_rush": h_rush,
                "traffic_factor": traffic_factor,
            }])
            h_val = round(float(self.model.predict(h_X)[0]) if self.model else 60.0, 1)
            h_limit = CPCB_LIMITS.get(zone_key, CPCB_LIMITS["COMMERCIAL"])["day" if h_day else "night"]
            hourly_forecast.append({
                "hour": f"{h:02d}:00",
                "predicted_db": h_val,
                "limit": h_limit,
                "is_breach": h_val > h_limit,
            })

        # Health recommendation
        if predicted_db < 55:
            health_note = "Acoustically quiet and soothing. Ideal for residential dwelling, study, and restful sleep."
        elif predicted_db <= 65:
            health_note = "Moderate commercial urban sound level. Comfortable for daytime retail and regular commerce."
        elif predicted_db <= 75:
            health_note = "Elevated traffic and transit noise. Noticeable speech interference and long-term auditory fatigue risk."
        else:
            health_note = "Hazardous noise peak. Continuous exposure (>2 hours) may induce temporary hearing threshold shifts."

        return {
            "area_name": area_name,
            "zone": zone_key,
            "target_hour": f"{hour:02d}:00",
            "traffic_intensity": traffic_level,
            "predicted_decibels": predicted_db,
            "predicted_leq": round(predicted_db + 0.4, 1),
            "permissible_limit": limit,
            "is_breach": is_breach,
            "breach_amount": max(0.0, diff),
            "severity": severity,
            "health_advisory": health_note,
            "hourly_forecast": hourly_forecast,
        }


predictor = NoisePredictor()

