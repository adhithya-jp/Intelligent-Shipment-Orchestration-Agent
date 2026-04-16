import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

class Settings:
    PROJECT_NAME: str = "Intelligent Shipment Orchestration Agent"
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "shipment_db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_for_development")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "uO6zWp4tF3Y7sSj6zO8gR2yD_3B8uJ-wJ_sM1Qo9Y2Q=")

settings = Settings()

