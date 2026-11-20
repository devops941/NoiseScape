"""Madurai Environmental Noise Dataset Generator.

Generates realistic, timestamped acoustic telemetry (dB, Leq, Lmax, Lmin)
for key Madurai monitoring locations (Periyar Bus Stand, Mattuthavani Bus Stand,
Anna Nagar, Kalavasal, Government Rajaji Hospital, Kappalur Industrial Estate)
following Central Pollution Control Board (CPCB) sound level rules.
"""
import csv
import os
import random
from datetime import datetime, timedelta, timezone

# Regulatory limits (in dB(A) Leq)
CPCB_LIMITS = {
    "SILENT": {"day": 50.0, "night": 40.0},
    "RESIDENTIAL": {"day": 55.0, "night": 45.0},
    "COMMERCIAL": {"day": 65.0, "night": 55.0},
    "INDUSTRIAL": {"day": 75.0, "night": 70.0},
}

MADURAI_STATIONS = [
    {
        "id": 1,
        "name": "Periyar Bus Stand Terminal",
        "location": "Periyar, Madurai",
        "zone": "COMMERCIAL",
        "latitude": 9.9158,
        "longitude": 78.1117,
        "day_mean": 72.5,
        "day_std": 4.5,
        "night_mean": 60.0,
        "night_std": 4.0,
    },
    {
        "id": 2,
        "name": "Mattuthavani Integrated Bus Terminus (MIBT)",
        "location": "Mattuthavani, Madurai",
        "zone": "COMMERCIAL",
        "latitude": 9.9439,
        "longitude": 78.1561,
        "day_mean": 74.0,
        "day_std": 5.0,
        "night_mean": 63.5,
        "night_std": 4.5,
    },
    {
        "id": 3,
        "name": "Anna Nagar Residential Sector",
        "location": "Anna Nagar 80 Feet Road, Madurai",
        "zone": "RESIDENTIAL",
        "latitude": 9.9263,
        "longitude": 78.1500,
        "day_mean": 54.0,
        "day_std": 3.8,
        "night_mean": 44.0,
        "night_std": 3.0,
    },
    {
        "id": 4,
        "name": "Kalavasal Junction",
        "location": "Theni Highway Junction, Madurai",
        "zone": "COMMERCIAL",
        "latitude": 9.9303,
        "longitude": 78.0955,
        "day_mean": 73.0,
        "day_std": 4.8,
        "night_mean": 61.0,
        "night_std": 4.2,
    },
    {
        "id": 5,
        "name": "Government Rajaji Hospital (GRH)",
        "location": "Goripalayam, Madurai",
        "zone": "SILENT",
        "latitude": 9.9288,
        "longitude": 78.1292,
        "day_mean": 54.5,
        "day_std": 3.5,
        "night_mean": 45.0,
        "night_std": 3.0,
    },
    {
        "id": 6,
        "name": "Kappalur Industrial Estate",
        "location": "Kappalur, Madurai",
        "zone": "INDUSTRIAL",
        "latitude": 9.8450,
        "longitude": 78.0560,
        "day_mean": 71.0,
        "day_std": 4.0,
        "night_mean": 59.0,
        "night_std": 4.0,
    },
]


def is_daytime(dt: datetime) -> bool:
    return 6 <= dt.hour < 22


def generate_dataset(days_of_history: int = 7, interval_minutes: int = 60, output_path: str = None):
    if not output_path:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(base_dir, "raw", "madurai_noise_readings.csv")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    random.seed(42)  # Deterministic seed for reproducible results

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    start_time = now - timedelta(days=days_of_history)

    total_steps = int((days_of_history * 24 * 60) / interval_minutes)
    records = []

    print(f"Generating {days_of_history} days of Madurai acoustic readings ({total_steps} time steps per station)...")

    for step in range(total_steps):
        current_time = start_time + timedelta(minutes=step * interval_minutes)
        day_flag = is_daytime(current_time)
        hour = current_time.hour

        # Rush hour boost (08:00 - 11:00 and 17:00 - 21:00)
        is_rush_hour = (8 <= hour <= 11) or (17 <= hour <= 21)
        rush_boost = 3.5 if is_rush_hour else 0.0

        for station in MADURAI_STATIONS:
            zone = station["zone"]
            limit = CPCB_LIMITS[zone]["day"] if day_flag else CPCB_LIMITS[zone]["night"]

            mean = (station["day_mean"] if day_flag else station["night_mean"]) + rush_boost
            std = station["day_std"] if day_flag else station["night_std"]

            # Generate realistic Gaussian acoustic decibels
            db_val = round(max(30.0, min(115.0, random.gauss(mean, std))), 1)

            # Rare horn/heavy engine spikes
            if random.random() < 0.08:
                db_val = round(min(115.0, db_val + random.uniform(5.0, 12.0)), 1)

            leq = round(db_val + random.uniform(-1.0, 1.5), 1)
            lmax = round(max(db_val, leq) + random.uniform(2.0, 7.0), 1)
            lmin = round(min(db_val, leq) - random.uniform(3.0, 8.0), 1)

            diff = db_val - limit
            is_breach = diff > 0
            if is_breach:
                severity = "CRITICAL" if diff > 10.0 else "WARNING"
            else:
                severity = "SAFE"

            records.append({
                "station_id": station["id"],
                "station_name": station["name"],
                "location": station["location"],
                "zone": station["zone"],
                "latitude": station["latitude"],
                "longitude": station["longitude"],
                "recorded_at": current_time.isoformat(),
                "decibel_value": db_val,
                "leq": leq,
                "lmax": lmax,
                "lmin": lmin,
                "permissible_limit": limit,
                "is_breach": 1 if is_breach else 0,
                "severity": severity,
            })

    # Write to CSV
    fieldnames = [
        "station_id", "station_name", "location", "zone",
        "latitude", "longitude", "recorded_at", "decibel_value",
        "leq", "lmax", "lmin", "permissible_limit", "is_breach", "severity"
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Generated {len(records)} records saved to: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_dataset()

