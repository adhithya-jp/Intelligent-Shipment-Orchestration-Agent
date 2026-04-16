"""
Service: Route Analysis Engine
Takes all fetched intelligence data and sends it to GPT-4o for expert analysis.
Returns a structured logistics analysis with recommendations, risks, and cost estimates.
"""
import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.logger import log

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def _build_context_block(intelligence: dict) -> str:
    """
    Flatten the raw intelligence results into a clean, readable context block
    for GPT. Only includes data from APIs that successfully returned (status=ok).
    """
    results = intelligence.get("results", {})
    lines = []

    def get_data(key: str) -> dict | None:
        r = results.get(key)
        return r.get("data") if r and r.get("status") == "ok" else None

    origin = intelligence.get("origin", "Unknown")
    destination = intelligence.get("destination", "Unknown")
    cargo_type = intelligence.get("cargo_type", "Unknown")
    weight_kg = intelligence.get("weight_kg", 0)
    sla_days = intelligence.get("sla_days", 0)
    budget_usd = intelligence.get("budget_usd", 0)

    lines.append(f"=== SHIPMENT REQUEST ===")
    lines.append(f"Origin: {origin}")
    lines.append(f"Destination: {destination}")
    lines.append(f"Cargo Type: {cargo_type}")
    lines.append(f"Cargo Weight: {weight_kg} kg")
    lines.append(f"SLA Deadline: {sla_days} days")
    lines.append(f"Budget: ${budget_usd} USD")

    # Weather
    wx_origin = get_data("weather_origin")
    if wx_origin:
        lines.append(f"\n=== WEATHER AT ORIGIN ({origin}) ===")
        lines.append(f"Condition: {wx_origin.get('condition')}")
        lines.append(f"Temperature: {wx_origin.get('temperature_c')}°C")
        lines.append(f"Wind Speed: {wx_origin.get('wind_speed_ms')} m/s")
        lines.append(f"Visibility: {wx_origin.get('visibility_m')} m")
        lines.append(f"Shipping Risk: {wx_origin.get('shipping_risk')} — {wx_origin.get('risk_reason')}")

    wx_dest = get_data("weather_destination")
    if wx_dest:
        lines.append(f"\n=== WEATHER AT DESTINATION ({destination}) ===")
        lines.append(f"Condition: {wx_dest.get('condition')}")
        lines.append(f"Temperature: {wx_dest.get('temperature_c')}°C")
        lines.append(f"Wind Speed: {wx_dest.get('wind_speed_ms')} m/s")
        lines.append(f"Visibility: {wx_dest.get('visibility_m')} m")
        lines.append(f"Shipping Risk: {wx_dest.get('shipping_risk')} — {wx_dest.get('risk_reason')}")

    # Route distance
    route = get_data("route_distance")
    if route:
        lines.append(f"\n=== ROUTE DISTANCE (Ground Transport) ===")
        lines.append(f"Distance: {route.get('distance_km')} km")
        lines.append(f"Estimated Duration: {route.get('duration_hours')} hours")
        lines.append(f"Transport Mode: {route.get('mode')}")

    # Fuel prices
    diesel = get_data("fuel_price_diesel")
    if diesel:
        lines.append(f"\n=== FUEL PRICES ===")
        lines.append(f"Diesel: ${diesel.get('price_usd_per_gallon')}/gal (${diesel.get('price_usd_per_litre')}/litre) as of {diesel.get('period')}")

    jet = get_data("fuel_price_jet")
    if jet:
        lines.append(f"Jet Fuel: ${jet.get('price_usd_per_gallon')}/gal (${jet.get('price_usd_per_litre')}/litre) as of {jet.get('period')}")

    # Currency
    currency = get_data("currency")
    if currency and currency.get("rate"):
        lines.append(f"\n=== CURRENCY ===")
        lines.append(f"Budget Conversion: {currency.get('original_amount')} {currency.get('currency')} = ${currency.get('usd_amount')} USD (rate: {currency.get('rate')})")

    # Port congestion
    port_origin = get_data("port_origin")
    if port_origin:
        lines.append(f"\n=== PORT CONGESTION AT ORIGIN ===")
        lines.append(f"Port: {port_origin.get('port_name')} ({port_origin.get('locode')})")
        lines.append(f"Status: {port_origin.get('congestion_status')}")
        lines.append(f"Vessel Calls (latest week): {port_origin.get('vessel_calls')}")
        lines.append(f"4-Week Average: {port_origin.get('vessel_calls_4wk_avg')}")
        lines.append(f"vs Average: {port_origin.get('vs_4wk_avg_pct')}%")

    port_dest = get_data("port_destination")
    if port_dest:
        lines.append(f"\n=== PORT CONGESTION AT DESTINATION ===")
        lines.append(f"Port: {port_dest.get('port_name')} ({port_dest.get('locode')})")
        lines.append(f"Status: {port_dest.get('congestion_status')}")
        lines.append(f"Vessel Calls (latest week): {port_dest.get('vessel_calls')}")
        lines.append(f"4-Week Average: {port_dest.get('vessel_calls_4wk_avg')}")
        lines.append(f"vs Average: {port_dest.get('vs_4wk_avg_pct')}%")

    # Traffic
    traffic_origin = get_data("traffic_origin")
    if traffic_origin:
        lines.append(f"\n=== ROAD TRAFFIC AT ORIGIN ===")
        lines.append(f"Congestion Level: {traffic_origin.get('congestion_level')}")
        lines.append(f"Current Speed: {traffic_origin.get('current_speed_kmph')} km/h (Free Flow: {traffic_origin.get('free_flow_speed_kmph')} km/h)")

    traffic_dest = get_data("traffic_destination")
    if traffic_dest:
        lines.append(f"\n=== ROAD TRAFFIC AT DESTINATION ===")
        lines.append(f"Congestion Level: {traffic_dest.get('congestion_level')}")
        lines.append(f"Current Speed: {traffic_dest.get('current_speed_kmph')} km/h (Free Flow: {traffic_dest.get('free_flow_speed_kmph')} km/h)")

    # Flights
    flights = get_data("available_flights")
    if flights:
        lines.append(f"\n=== ACTIVE AIRFREIGHT ROUTES ===")
        for f in flights[:5]: # Take top 5 flights to keep prompt size manageable
            lines.append(f"Flight {f.get('flight_iata')} via {f.get('airline')} | Stat: {f.get('status')} | Dep: {f.get('departure_scheduled')} -> Arr: {f.get('arrival_scheduled')}")

    # Failed APIs note
    failed = [k for k, v in results.items() if v.get("status") == "error"]
    if failed:
        lines.append(f"\n=== NOTE ===")
        lines.append(f"The following data sources were unavailable: {', '.join(failed)}. Base your analysis on what is available.")

    return "\n".join(lines)


SYSTEM_PROMPT = """
You are OrchestratorAI — an expert AI logistics analyst for the Intelligent Shipment Orchestration system.
Your job is to analyze real-time logistics intelligence data and produce a concise, actionable shipment analysis.

You will receive live data from weather APIs, traffic sensors, port systems, fuel markets, flight schedules (AviationStack), and routing engines.
You must utilize the EXACT data provided (flight IATA numbers, scheduled departure times, port congestion ratios, weather thresholds, etc.) inside your executive summary and recommendations. Do not be vague.

Using this data, produce your analysis in the following exact JSON structure:

{
  "executive_summary": "2-3 sentence overview of the route feasibility and key findings.",
  "recommended_mode": "SEA | AIR | GROUND | MULTIMODAL",
  "mode_rationale": "Why this mode is recommended given the data.",
  "estimated_cost_usd": <number>,
  "cost_breakdown": {
    "fuel": <number>,
    "handling": <number>,
    "contingency": <number>
  },
  "estimated_transit_days": <number>,
  "sla_feasibility": "ON_TRACK | AT_RISK | BREACHED",
  "sla_reasoning": "Explanation of SLA status.",
  "carbon_footprint_kg_co2": <number>,
  "route_waypoints": [
    {
       "node": "City or Port Name",
       "transport_mode": "AIR | SEA | GROUND | TRANSSHIPMENT",
       "estimated_delay_hours": <number>,
       "status_note": "Brief action or context here"
    }
  ],
  "risk_assessment": {
    "overall": "LOW | MEDIUM | HIGH | CRITICAL",
    "weather_risk": "LOW | MEDIUM | HIGH",
    "port_risk": "LOW | MEDIUM | HIGH",
    "traffic_risk": "LOW | MEDIUM | HIGH",
    "fuel_volatility": "LOW | MEDIUM | HIGH",
    "customs_compliance": "LOW | MEDIUM | HIGH"
  },
  "recommendations": [
    "Highly detailed operational directive citing exact flight paths, wait times, or weather thresholds.",
    "Highly detailed operational directive...",
    "Highly detailed operational directive...",
    "Highly detailed operational directive..."
  ],
  "alerts": [
    "Any critical alerts or blockers — leave as empty array [] if none"
  ],
  "data_confidence": "HIGH | MEDIUM | LOW",
  "confidence_reason": "How many data sources were available and any gaps."
}

Output ONLY raw JSON. No markdown. No explanation outside the JSON.
"""


async def analyze_route(intelligence: dict) -> dict:
    """
    Send all fetched intelligence data to GPT-4o and return structured analysis.
    
    Args:
        intelligence: The full output from fetch_route_intelligence()
    
    Returns:
        Parsed JSON analysis from GPT-4o.
    """
    context = _build_context_block(intelligence)

    log.info(
        f"Sending intelligence to GPT-4o for analysis: "
        f"{intelligence.get('origin')} → {intelligence.get('destination')}"
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,  # Low temp for consistent, factual analysis
        )

        raw = response.choices[0].message.content
        analysis = json.loads(raw)

        log.info(
            f"GPT-4o analysis complete — Risk: {analysis.get('risk_assessment', {}).get('overall')}, "
            f"Recommended Mode: {analysis.get('recommended_mode')}, "
            f"SLA: {analysis.get('sla_feasibility')}"
        )

        return analysis

    except json.JSONDecodeError as e:
        log.error(f"GPT returned invalid JSON: {e}")
        raise ValueError("GPT returned malformed JSON. Try again.")
    except Exception as e:
        log.error(f"GPT-4o analysis failed: {str(e)}", exc_info=True)
        raise ValueError(f"Analysis failed: {str(e)}")
