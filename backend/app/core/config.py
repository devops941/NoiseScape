import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_URL = f"sqlite:///{BACKEND_DIR / 'noise_monitor.db'}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "NoiseScape API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    # SQLite Database URI (Defaults to backend/noise_monitor.db)
    DATABASE_URL: str = DEFAULT_DB_URL
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    SECRET_KEY: str = "insecure-dev-secret-key-change-in-production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

