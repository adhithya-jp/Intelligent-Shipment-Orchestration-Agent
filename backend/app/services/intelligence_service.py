"""
Service: Route Intelligence Aggregator
Fires all 7 external integrations in parallel for a given routing request.
Each integration result is individually caught so one failure doesn't block the rest.
"""
import asyncio
from app.core.logger import log
from app.integrations import (
    weather_api,
    currency_api,
    flights_api,
    fuel_api,
    maps_api,
    ports_api,
    traffic_api,
)

# Port gateway coordinates for traffic checks (lat, lon)
PORT_COORDINATES = {
    "dubai": (25.2697, 55.3095),
    "rotterdam": (51.9225, 4.4792),
    "singapore": (1.2648, 103.8229),
    "shanghai": (31.3720, 121.4747),
    "hamburg": (53.5511, 9.9937),
    "los angeles": (33.7395, -118.2619),
    "antwerp": (51.2194, 4.4025),
    "mumbai": (18.9500, 72.8258),
    "new york": (40.6501, -74.0253),
}

# Port LOCODE lookup for portwatch
PORT_LOCODE_LOOKUP = {
    "dubai": "AEDXB",
    "rotterdam": "NLRTM",
    "singapore": "SGSIN",
    "shanghai": "CNSHA",
    "hamburg": "DEHAM",
    "los angeles": "USLAX",
    "antwerp": "BEANR",
    "mumbai": "INMUN",
    "new york": "USNYC",
}


def _find_port_key(location: str) -> str | None:
    """Find the closest matching port key from a free-text location."""
    location_lower = location.lower()
    for key in PORT_COORDINATES:
        if key in location_lower:
            return key
    return None


async def _safe(label: str, coro) -> dict:
    """
    Run a coroutine safely. Returns a result envelope with status=ok or status=error.
    This prevents one failing API from taking down the entire gather.
    """
    try:
        data = await coro
        return {"api": label, "status": "ok", "data": data}
    except Exception as e:
        log.warning(f"Intelligence [{label}] failed: {str(e)}")
        return {"api": label, "status": "error", "error": str(e), "data": None}


async def fetch_route_intelligence(
    origin: str,
    destination: str,
    weight_kg: float,
    sla_days: int,
    budget_usd: float,
    currency: str = "USD",
    cargo_type: str = "General Cargo",
) -> dict:
    """
    Main orchestrator: fires all integrations in parallel.
    Returns a dict of results keyed by API name, each with status + data.
    """
    log.info(f"Starting route intelligence fetch: {origin} → {destination}")

    origin_port_key = _find_port_key(origin)
    dest_port_key = _find_port_key(destination)

    # Build all coroutines
    tasks = [
        _safe("weather_origin",   weather_api.assess_shipping_risk(origin)),
        _safe("weather_destination", weather_api.assess_shipping_risk(destination)),
        _safe("route_distance",    maps_api.get_route_distance(origin, destination)),
        _safe("fuel_price_diesel", fuel_api.get_fuel_price("diesel")),
        _safe("fuel_price_jet",    fuel_api.get_fuel_price("jet_fuel")),
    ]

    # Only add currency task if not already USD
    async def _usd_passthrough():
        return {"message": "Budget already in USD", "usd_amount": budget_usd}

    if currency.upper() != "USD":
        tasks.append(_safe("currency", currency_api.convert_to_usd(budget_usd, currency)))
    else:
        tasks.append(_safe("currency", _usd_passthrough()))

    # Port-specific tasks — only if we recognise the port
    if origin_port_key:
        origin_locode = PORT_LOCODE_LOOKUP.get(origin_port_key)
        if origin_locode:
            tasks.append(_safe("port_origin", ports_api.check_port_congestion(origin_locode)))
        lat, lon = PORT_COORDINATES[origin_port_key]
        tasks.append(_safe("traffic_origin", traffic_api.get_traffic_near_port(lat, lon)))

    if dest_port_key:
        dest_locode = PORT_LOCODE_LOOKUP.get(dest_port_key)
        if dest_locode:
            tasks.append(_safe("port_destination", ports_api.check_port_congestion(dest_locode)))
        lat, lon = PORT_COORDINATES[dest_port_key]
        tasks.append(_safe("traffic_destination", traffic_api.get_traffic_near_port(lat, lon)))

    # Fire everything in parallel
    results_list = await asyncio.gather(*tasks)

    # Key by api name for easy frontend consumption
    results = {r["api"]: r for r in results_list}

    # ── Passive Caching for Dashboard ───────────────────────────────────────
    try:
        from app.core.database import get_db
        import time
        db = get_db()
        cache_count = 0
        for r in results_list:
            if r["status"] == "ok" and r["data"]:
                db.live_intelligence.update_one(
                    {"api_key": r["api"]},
                    {"$set": {
                        "data": r["data"],
                        "timestamp": time.time(),
                        "location_ref": origin if "origin" in r["api"] else destination
                    }},
                    upsert=True
                )
                cache_count += 1
        if cache_count > 0:
            log.info(f"Cached {cache_count} API results natively for Dashboard sync.")
    except Exception as e:
        log.warning(f"Failed to cache intelligence results: {str(e)}")

    # Summary counts
    ok_count = sum(1 for r in results_list if r["status"] == "ok")
    err_count = len(results_list) - ok_count

    log.info(f"Intelligence fetch complete: {ok_count} ok, {err_count} failed")

    return {
        "origin": origin,
        "destination": destination,
        "cargo_type": cargo_type,
        "weight_kg": weight_kg,
        "sla_days": sla_days,
        "budget_usd": budget_usd,
        "apis_queried": len(results_list),
        "apis_ok": ok_count,
        "apis_failed": err_count,
        "results": results,
    }

