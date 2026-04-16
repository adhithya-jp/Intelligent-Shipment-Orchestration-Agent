"""
Integration: OpenWeatherMap API
Purpose: Fetch current weather and sea conditions at origin/destination ports.
API Docs: https://openweathermap.org/api
Free Tier: 60 calls/min, 1M calls/month
Sign up: https://openweathermap.org/appid
"""
import httpx
from app.core.config import settings
from app.core.logger import log

BASE_URL = "https://api.openweathermap.org/data/2.5"


async def get_weather_at_port(city: str) -> dict:
    """
    Fetch current weather conditions for a given city/port.
    Returns temperature, wind speed, visibility, and a general condition description.
    Raise ValueError if the API key is missing or the city is not found.
    """
    if not settings.OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY is not configured in .env")

    params = {
        "q": city,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",  # Celsius, m/s
    }

    log.info(f"Fetching weather for city: {city}")

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BASE_URL}/weather", params=params)

        if response.status_code == 404:
            raise ValueError(f"City '{city}' not found on OpenWeatherMap.")
        if response.status_code == 401:
            raise ValueError("Invalid OPENWEATHER_API_KEY. Check your .env file.")

        response.raise_for_status()
        data = response.json()

    result = {
        "city": data.get("name"),
        "country": data.get("sys", {}).get("country"),
        "condition": data.get("weather", [{}])[0].get("description", "unknown"),
        "temperature_c": data.get("main", {}).get("temp"),
        "feels_like_c": data.get("main", {}).get("feels_like"),
        "humidity_pct": data.get("main", {}).get("humidity"),
        "wind_speed_ms": data.get("wind", {}).get("speed"),
        "wind_direction_deg": data.get("wind", {}).get("deg"),
        "visibility_m": data.get("visibility"),
        "cloud_cover_pct": data.get("clouds", {}).get("all"),
    }

    log.info(f"Weather at {city}: {result['condition']}, {result['temperature_c']}°C")
    return result


async def assess_shipping_risk(city: str) -> dict:
    """
    Higher-level helper used by the routing engine.
    Returns a risk level (LOW / MEDIUM / HIGH) based on wind speed and visibility.
    """
    weather = await get_weather_at_port(city)

    wind_ms = weather.get("wind_speed_ms", 0) or 0
    visibility_m = weather.get("visibility_m", 10000) or 10000

    if wind_ms > 17 or visibility_m < 1000:
        risk = "HIGH"
    elif wind_ms > 10 or visibility_m < 4000:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        **weather,
        "shipping_risk": risk,
        "risk_reason": (
            f"Wind {wind_ms} m/s, Visibility {visibility_m} m"
        ),
    }
