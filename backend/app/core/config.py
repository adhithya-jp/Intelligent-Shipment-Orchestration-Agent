import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

class Settings:
    PROJECT_NAME: str = "Intelligent Shipment Orchestration Agent"

    # --- Core ---
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "shipment_db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_for_development")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "uO6zWp4tF3Y7sSj6zO8gR2yD_3B8uJ-wJ_sM1Qo9Y2Q=")

    # --- AI ---
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # --- External Integrations ---
    # Weather: https://openweathermap.org/appid
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")

    # Currency: https://app.exchangerate-api.com/sign-up
    EXCHANGE_RATE_API_KEY: str = os.getenv("EXCHANGE_RATE_API_KEY", "")

    # Flights: https://aviationstack.com/signup/free
    AVIATIONSTACK_API_KEY: str = os.getenv("AVIATIONSTACK_API_KEY", "")

    # Fuel: https://www.eia.gov/opendata/register.php
    EIA_API_KEY: str = os.getenv("EIA_API_KEY", "")

    # Maps / Routing: https://openrouteservice.org/dev/#/login
    ORS_API_KEY: str = os.getenv("ORS_API_KEY", "")

    # Traffic: https://developer.tomtom.com/user/register
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")

    # Ports: IMF PortWatch — no API key required (open access)

settings = Settings()


