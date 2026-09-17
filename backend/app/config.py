from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "MARITRACE API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LIVE_MODE: bool = False

    # Satellite (Copernicus)
    COPERNICUS_CLIENT_ID: str = ""
    COPERNICUS_CLIENT_SECRET: str = ""
    SATELLITE_PROVIDER: str = "copernicus"

    # AIS
    AIS_API_KEY: str = ""
    AIS_API_URL: str = ""

    # Ocean / Weather – Open-Meteo
    OCEAN_API_URL: str = "https://marine-api.open-meteo.com/v1/marine"
    OCEAN_API_KEY: str = "free"
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1/forecast"
    WEATHER_API_KEY: str = "free"

    # Model
    MODEL_PATH: str = "models/best_model.pth"

    # Database
    DATABASE_URL: str = "sqlite:///./maritrace.db"

    # Frontend API URL (used in some places, now defined)
    vite_api_url: Optional[str] = None  # 👈 added this

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # If you want to allow extra fields, you can set:
        # extra = "allow"
        # But it's better to define them explicitly.

config = Settings()