"""
Integration: TomTom Traffic Flow API
Purpose: Fetch real-time road traffic congestion data near port/hub locations.
         Used to estimate ground transport delays from warehouses to ports.
API Docs: https://developer.tomtom.com/traffic-api/documentation/traffic-flow/flow-segment-data
Free Tier: 2,500 free transactions/day
Sign up: https://developer.tomtom.com/user/register
"""
import httpx
from app.core.config import settings
from app.core.logger import log

BASE_URL = "https://api.tomtom.com/traffic/services/4"


async def get_traffic_flow(latitude: float, longitude: float, zoom: int = 10) -> dict:
    """
    Fetch real-time traffic flow data at a given coordinate (e.g., near a port gate).
    zoom: 0 (world) to 22 (street-level). 10 is city level — good for port areas.
    Returns current speed, free-flow speed, and a congestion ratio.
    """
    if not settings.TOMTOM_API_KEY:
        raise ValueError("TOMTOM_API_KEY is not configured in .env")

    log.info(f"Fetching TomTom traffic at ({latitude}, {longitude})")

    point = f"{latitude},{longitude}"
    url = f"{BASE_URL}/flowSegmentData/absolute/{zoom}/json"

    params = {
        "key": settings.TOMTOM_API_KEY,
        "point": point,
        "unit": "KMPH",
        "openLr": "false",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)

        if response.status_code == 403:
            raise ValueError("Invalid TOMTOM_API_KEY. Check your .env file.")
        if response.status_code == 400:
            raise ValueError(f"Bad request to TomTom API — check coordinates: ({latitude}, {longitude})")

        response.raise_for_status()
        data = response.json()

    flow = data.get("flowSegmentData", {})

    current_speed_kmph = flow.get("currentSpeed")
    free_flow_speed_kmph = flow.get("freeFlowSpeed")
    confidence = flow.get("confidence")

    # Congestion ratio: 1.0 = free flow, 0.0 = completely jammed
    congestion_ratio = (
        round(current_speed_kmph / free_flow_speed_kmph, 3)
        if free_flow_speed_kmph and free_flow_speed_kmph > 0
        else None
    )

    if congestion_ratio is None:
        congestion_level = "UNKNOWN"
    elif congestion_ratio >= 0.85:
        congestion_level = "FREE"
    elif congestion_ratio >= 0.6:
        congestion_level = "MODERATE"
    elif congestion_ratio >= 0.4:
        congestion_level = "HEAVY"
    else:
        congestion_level = "SEVERE"

    result = {
        "latitude": latitude,
        "longitude": longitude,
        "current_speed_kmph": current_speed_kmph,
        "free_flow_speed_kmph": free_flow_speed_kmph,
        "congestion_ratio": congestion_ratio,
        "congestion_level": congestion_level,
        "confidence": confidence,
    }

    log.info(f"Traffic at ({latitude},{longitude}): {congestion_level} ({current_speed_kmph} km/h vs {free_flow_speed_kmph} km/h free flow)")
    return result


async def get_traffic_near_port(lat: float, lon: float) -> dict:
    """
    Convenience wrapper: the routing engine calls this with port coordinates
    to check ground access congestion before recommending a port relay.
    """
    return await get_traffic_flow(latitude=lat, longitude=lon, zoom=12)
