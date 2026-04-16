"""
Integration: U.S. Energy Information Administration (EIA) API
Purpose: Fetch live fuel prices (diesel, kerosene/jet fuel) for transport cost estimation.
API Docs: https://www.eia.gov/opendata/
Free Tier: Completely free, requires registration for an API key.
Sign up: https://www.eia.gov/opendata/register.php

Series IDs used:
  - Diesel (US avg):   PET.EMD_EPD2D_PTE_NUS_DPG.W
  - Kerosene (jet fuel, US avg): PET.EER_EPJK_PF4_RGC_DPG.W
"""
import httpx
from app.core.config import settings
from app.core.logger import log

BASE_URL = "https://api.eia.gov/v2"

FUEL_SERIES = {
    "diesel": "PET.EMD_EPD2D_PTE_NUS_DPG.W",
    "jet_fuel": "PET.EER_EPJK_PF4_RGC_DPG.W",
}


async def get_fuel_price(fuel_type: str = "diesel") -> dict:
    """
    Fetch the latest weekly average US price for a given fuel type.
    Supported fuel_type values: 'diesel', 'jet_fuel'
    Returns price in USD per gallon plus the date of the data point.
    """
    if not settings.EIA_API_KEY:
        raise ValueError("EIA_API_KEY is not configured in .env")

    fuel_type = fuel_type.lower()
    if fuel_type not in FUEL_SERIES:
        raise ValueError(f"Unsupported fuel type '{fuel_type}'. Choose from: {list(FUEL_SERIES.keys())}")

    series_id = FUEL_SERIES[fuel_type]

    log.info(f"Fetching EIA fuel price for: {fuel_type}")

    params = {
        "api_key": settings.EIA_API_KEY,
        "frequency": "weekly",
        "data[0]": "value",
        "sort[0][column]": "period",
        "sort[0][direction]": "desc",
        "length": 1,
    }

    # EIA v2 endpoint uses the series path
    url = f"{BASE_URL}/seriesid/{series_id}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)

        if response.status_code == 403:
            raise ValueError("Invalid EIA_API_KEY. Check your .env file.")

        response.raise_for_status()
        data = response.json()

    try:
        latest = data["response"]["data"][0]
        price_usd_per_gallon = float(latest["value"])
        period = latest["period"]
    except (KeyError, IndexError, TypeError) as e:
        raise ValueError(f"Unexpected EIA response format: {e}")

    # Convert to per-litre for international use
    price_usd_per_litre = round(price_usd_per_gallon / 3.78541, 4)

    result = {
        "fuel_type": fuel_type,
        "price_usd_per_gallon": price_usd_per_gallon,
        "price_usd_per_litre": price_usd_per_litre,
        "period": period,
        "source": "EIA.gov",
    }

    log.info(f"Fuel price ({fuel_type}): ${price_usd_per_gallon}/gal as of {period}")
    return result


async def estimate_fuel_cost(distance_km: float, fuel_type: str = "diesel", consumption_l_per_100km: float = 35.0) -> dict:
    """
    Estimate total fuel cost for a given route distance.
    Defaults assume a heavy cargo truck (35L/100km diesel consumption).
    Returns total cost in USD alongside the live fuel price used.
    """
    fuel_data = await get_fuel_price(fuel_type)
    price_per_litre = fuel_data["price_usd_per_litre"]
    total_litres = (distance_km / 100) * consumption_l_per_100km
    total_cost_usd = round(total_litres * price_per_litre, 2)

    return {
        "distance_km": distance_km,
        "fuel_type": fuel_type,
        "consumption_l_per_100km": consumption_l_per_100km,
        "total_litres": round(total_litres, 2),
        "price_usd_per_litre": price_per_litre,
        "total_fuel_cost_usd": total_cost_usd,
        "fuel_price_period": fuel_data["period"],
    }
