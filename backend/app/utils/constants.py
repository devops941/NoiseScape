"""Standard regulatory noise thresholds (in dB(A) Leq) according to CPCB / EPA standards."""

# Day (06:00 - 22:00) and Night (22:00 - 06:00) limits
NOISE_LIMITS_DB = {
    "SILENT": {
        "day": 50.0,
        "night": 40.0,
    },
    "RESIDENTIAL": {
        "day": 55.0,
        "night": 45.0,
    },
    "COMMERCIAL": {
        "day": 65.0,
        "night": 55.0,
    },
    "INDUSTRIAL": {
        "day": 75.0,
        "night": 70.0,
    },
}

TIME_WINDOWS = {
    "day_start_hour": 6,   # 06:00
    "night_start_hour": 22 # 22:00
}

