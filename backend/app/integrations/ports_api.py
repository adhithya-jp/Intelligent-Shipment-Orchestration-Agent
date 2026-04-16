"""
Integration: IMF PortWatch API
Purpose: Fetch port activity metrics, vessel call volumes, and disruption signals
         for major global ports using AIS satellite data.
API Docs: https://portwatch.imf.org/pages/data
Free Tier: Completely free, open-access — no API key required.
Note: PortWatch provides economic/activity data, not per-vessel schedules.
      For live vessel schedules, a commercial provider (e.g., Sinay/SeaRates) is needed.
"""
import httpx
from app.core.logger import log

PORTWATCH_BASE = "https://portwatch.imf.org/server/rest/services/Hosted"

# UN/LOCODE to PortWatch internal port name mapping for common logistics hubs
PORT_LOCODE_MAP = {
    "AEDXB": "Dubai",
    "NLRTM": "Rotterdam",
    "SGSIN": "Singapore",
    "CNSHA": "Shanghai",
    "USLAX": "Los Angeles",
    "DEHAM": "Hamburg",
    "BEANR": "Antwerp",
    "CNHKG": "Hong Kong",
    "JPNGO": "Nagoya",
    "USNYC": "New York",
    "GBFXT": "Felixstowe",
    "INMUN": "Mumbai",
}


async def get_port_activity(port_locode: str) -> dict:
    """
    Fetch vessel call activity metrics for a port by its UN/LOCODE.
    Example: get_port_activity("NLRTM") for Rotterdam.
    Returns weekly vessel call counts and trade volume indices.
    Note: PortWatch data uses a feature service (OGC/REST) interface.
    """
    port_name = PORT_LOCODE_MAP.get(port_locode.upper())
    if not port_name:
        supported = ", ".join(PORT_LOCODE_MAP.keys())
        raise ValueError(
            f"Port LOCODE '{port_locode}' not in supported list. Supported: {supported}"
        )

    log.info(f"Fetching PortWatch activity for: {port_name} ({port_locode})")

    # PortWatch uses an ArcGIS feature service — query by port name
    url = (
        f"{PORTWATCH_BASE}/PortWatch_Port_Statistics_view/FeatureServer/0/query"
    )
    params = {
        "where": f"port_name='{port_name}'",
        "outFields": "*",
        "orderByFields": "date DESC",
        "resultRecordCount": 4,  # Last 4 weeks
        "f": "json",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    features = data.get("features", [])
    if not features:
        raise ValueError(f"No PortWatch data available for '{port_name}'.")

    weekly_records = [f["attributes"] for f in features]
    latest = weekly_records[0]

    result = {
        "port_name": port_name,
        "locode": port_locode.upper(),
        "latest_week": latest.get("date"),
        "vessel_calls": latest.get("vessel_calls"),
        "vessel_calls_4wk_avg": round(
            sum(r.get("vessel_calls", 0) or 0 for r in weekly_records) / len(weekly_records), 1
        ),
        "raw_weekly": weekly_records,
    }

    log.info(f"Port {port_name}: {result['vessel_calls']} vessel calls (latest week)")
    return result


async def list_supported_ports() -> list[dict]:
    """
    Return all ports currently supported by this integration with their LOCODEs.
    """
    return [
        {"locode": locode, "name": name}
        for locode, name in PORT_LOCODE_MAP.items()
    ]


async def check_port_congestion(port_locode: str) -> dict:
    """
    Higher-level helper: compare latest vessel calls to 4-week average
    to infer if a port is congested, normal, or quiet.
    """
    activity = await get_port_activity(port_locode)

    calls = activity.get("vessel_calls") or 0
    avg = activity.get("vessel_calls_4wk_avg") or calls

    if avg == 0:
        status = "UNKNOWN"
    elif calls > avg * 1.15:
        status = "CONGESTED"
    elif calls < avg * 0.85:
        status = "QUIET"
    else:
        status = "NORMAL"

    return {
        **activity,
        "congestion_status": status,
        "vs_4wk_avg_pct": round(((calls - avg) / avg) * 100, 1) if avg else None,
    }
