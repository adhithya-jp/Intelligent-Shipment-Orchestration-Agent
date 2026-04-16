"""
Integration: OpenRouteService (ORS) API
Purpose: Geocode locations, calculate driving/truck distances, and get ETAs.
API Docs: https://openrouteservice.org/dev/#/api-docs
Free Tier: 2,000 requests/day, 40 req/min
Sign up: https://openrouteservice.org/dev/#/login
Chosen over Google Maps: Free tier is more generous; truck routing is supported.
"""
import httpx
from app.core.config import settings
from app.core.logger import log

BASE_URL = "https://api.openrouteservice.org"


async def geocode_location(location_name: str) -> dict:
    """
    Convert a city/port name to geographic coordinates (lat, lon).
    Returns the best match from ORS Pelias geocoder.
    """
    if not settings.ORS_API_KEY:
        raise ValueError("ORS_API_KEY is not configured in .env")

    log.info(f"Geocoding location: {location_name}")

    params = {
        "api_key": settings.ORS_API_KEY,
        "text": location_name,
        "size": 1,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BASE_URL}/geocode/search", params=params)

        if response.status_code == 403:
            raise ValueError("Invalid ORS_API_KEY. Check your .env file.")

        response.raise_for_status()
        data = response.json()

    features = data.get("features", [])
    if not features:
        raise ValueError(f"Location '{location_name}' could not be geocoded.")

    best = features[0]
    coords = best["geometry"]["coordinates"]  # [lon, lat]
    props = best["properties"]

    return {
        "name": props.get("name"),
        "label": props.get("label"),
        "latitude": coords[1],
        "longitude": coords[0],
        "country": props.get("country"),
        "region": props.get("region"),
    }


async def get_route_distance(origin: str, destination: str, mode: str = "driving-hgv") -> dict:
    """
    Calculate road distance and duration between two locations by name.
    mode options: 'driving-car', 'driving-hgv' (heavy goods vehicle/truck)
    Returns distance in km and estimated duration in hours.
    """
    if not settings.ORS_API_KEY:
        raise ValueError("ORS_API_KEY is not configured in .env")

    # Step 1: Geocode both locations
    origin_geo = await geocode_location(origin)
    dest_geo = await geocode_location(destination)

    origin_coords = [origin_geo["longitude"], origin_geo["latitude"]]
    dest_coords = [dest_geo["longitude"], dest_geo["latitude"]]

    log.info(f"Calculating route: {origin} → {destination} via {mode}")

    headers = {
        "Authorization": settings.ORS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "coordinates": [origin_coords, dest_coords],
        "units": "km",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{BASE_URL}/v2/directions/{mode}",
            headers=headers,
            json=payload,
        )

        if response.status_code == 403:
            raise ValueError("Invalid ORS_API_KEY or insufficient permissions.")

        response.raise_for_status()
        data = response.json()

    try:
        summary = data["routes"][0]["summary"]
        distance_km = round(summary["distance"], 2)
        duration_sec = summary["duration"]
        duration_hours = round(duration_sec / 3600, 2)
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected ORS response format: {e}")

    result = {
        "origin": origin,
        "destination": destination,
        "mode": mode,
        "distance_km": distance_km,
        "duration_hours": duration_hours,
        "origin_coords": origin_geo,
        "destination_coords": dest_geo,
    }

    log.info(f"Route {origin} → {destination}: {distance_km} km, {duration_hours} hrs")
    return result
