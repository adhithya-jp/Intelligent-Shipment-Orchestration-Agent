"""
Integration: AviationStack API
Purpose: Fetch active cargo flight routes, flight status, and airline coverage.
API Docs: https://aviationstack.com/documentation
Free Tier: 100 requests/month (HTTP only on free plan)
Sign up: https://aviationstack.com/signup/free
NOTE: Free plan uses HTTP (not HTTPS). Use HTTPS only on paid plans.
"""
import httpx
from app.core.config import settings
from app.core.logger import log

# Free plan: HTTP only. Upgrade to paid for HTTPS.
BASE_URL = "http://api.aviationstack.com/v1"


async def get_flights_by_route(dep_iata: str, arr_iata: str) -> list[dict]:
    """
    Fetch active flights between two airports by IATA codes.
    Example: get_flights_by_route("DXB", "RTM")
    Returns a list of flight objects with carrier, status, and schedule info.
    """
    if not settings.AVIATIONSTACK_API_KEY:
        raise ValueError("AVIATIONSTACK_API_KEY is not configured in .env")

    params = {
        "access_key": settings.AVIATIONSTACK_API_KEY,
        "dep_iata": dep_iata.upper(),
        "arr_iata": arr_iata.upper(),
        "limit": 10,
    }

    log.info(f"Fetching flights: {dep_iata} → {arr_iata}")

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(f"{BASE_URL}/flights", params=params)

        if response.status_code == 401:
            raise ValueError("Invalid AVIATIONSTACK_API_KEY. Check your .env file.")

        response.raise_for_status()
        data = response.json()

    if "error" in data:
        raise ValueError(f"AviationStack error: {data['error'].get('info', 'Unknown error')}")

    flights = data.get("data", [])
    log.info(f"Found {len(flights)} flights for {dep_iata} → {arr_iata}")

    return [
        {
            "flight_iata": f.get("flight", {}).get("iata"),
            "airline": f.get("airline", {}).get("name"),
            "status": f.get("flight_status"),
            "departure_airport": f.get("departure", {}).get("airport"),
            "departure_scheduled": f.get("departure", {}).get("scheduled"),
            "departure_delay_min": f.get("departure", {}).get("delay"),
            "arrival_airport": f.get("arrival", {}).get("airport"),
            "arrival_scheduled": f.get("arrival", {}).get("scheduled"),
            "arrival_estimated": f.get("arrival", {}).get("estimated"),
        }
        for f in flights
    ]


async def get_flight_status(flight_iata: str) -> dict:
    """
    Get the current status of a specific flight by its IATA number.
    Example: get_flight_status("EK501")
    """
    if not settings.AVIATIONSTACK_API_KEY:
        raise ValueError("AVIATIONSTACK_API_KEY is not configured in .env")

    params = {
        "access_key": settings.AVIATIONSTACK_API_KEY,
        "flight_iata": flight_iata.upper(),
    }

    log.info(f"Fetching status for flight: {flight_iata}")

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(f"{BASE_URL}/flights", params=params)
        response.raise_for_status()
        data = response.json()

    if "error" in data:
        raise ValueError(f"AviationStack error: {data['error'].get('info', 'Unknown error')}")

    results = data.get("data", [])
    if not results:
        raise ValueError(f"No data found for flight {flight_iata}")

    f = results[0]
    return {
        "flight_iata": f.get("flight", {}).get("iata"),
        "airline": f.get("airline", {}).get("name"),
        "status": f.get("flight_status"),
        "departure_scheduled": f.get("departure", {}).get("scheduled"),
        "departure_actual": f.get("departure", {}).get("actual"),
        "arrival_scheduled": f.get("arrival", {}).get("scheduled"),
        "arrival_estimated": f.get("arrival", {}).get("estimated"),
        "delay_minutes": f.get("departure", {}).get("delay"),
    }
