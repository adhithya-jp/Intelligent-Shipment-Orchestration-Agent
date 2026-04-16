from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import parse_natural_language_routing
from app.services.intelligence_service import fetch_route_intelligence
from app.services.analysis_service import analyze_route

router = APIRouter(prefix="/api/ai", tags=["AI Orchestration"])


# ── Parse natural language ──────────────────────────────────────────────────

class RoutingPromptRequest(BaseModel):
    prompt: str


@router.post("/parse-routing")
async def extract_routing_data(request: RoutingPromptRequest):
    """Parse a natural language shipment description into structured fields."""
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    try:
        extracted_data = await parse_natural_language_routing(request.prompt)
        return {"status": "success", "data": extracted_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Fetch route intelligence (all integrations in parallel) ─────────────────

class RouteIntelligenceRequest(BaseModel):
    origin: str
    destination: str
    weight_kg: float = 0.0
    sla_days: int = 0
    budget: float = 0.0
    currency: Optional[str] = "USD"


@router.post("/fetch-intelligence")
async def fetch_intelligence(request: RouteIntelligenceRequest):
    """
    Fire all external integrations (weather, maps, fuel, flights, traffic,
    ports, currency) in parallel for the given routing parameters.
    Returns per-API status + data so the frontend can show a confirmation panel.
    """
    if not request.origin.strip() or not request.destination.strip():
        raise HTTPException(
            status_code=400,
            detail="Both origin and destination are required."
        )

    try:
        result = await fetch_route_intelligence(
            origin=request.origin,
            destination=request.destination,
            weight_kg=request.weight_kg,
            sla_days=request.sla_days,
            budget_usd=request.budget,
            currency=request.currency or "USD",
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Analyze route (intelligence → GPT-4o) ───────────────────────────────────

@router.post("/analyze-route")
async def analyze_route_endpoint(request: RouteIntelligenceRequest):
    """
    Full pipeline in one call:
      1. Fetch all external intelligence (weather, maps, fuel, ports, traffic, currency)
      2. Compile into a structured prompt
      3. Send to GPT-4o for expert logistics analysis
      4. Return the structured analysis JSON

    Returns:
      - intelligence: raw per-API results (for the confirmation panel)
      - analysis: GPT-4o's structured analysis report
    """
    if not request.origin.strip() or not request.destination.strip():
        raise HTTPException(
            status_code=400,
            detail="Both origin and destination are required."
        )

    try:
        # Step 1: Fetch all intelligence in parallel
        intelligence = await fetch_route_intelligence(
            origin=request.origin,
            destination=request.destination,
            weight_kg=request.weight_kg,
            sla_days=request.sla_days,
            budget_usd=request.budget,
            currency=request.currency or "USD",
        )

        # Step 2: Send to GPT-4o for analysis
        analysis = await analyze_route(intelligence)

        return {
            "status": "success",
            "data": {
                "intelligence": intelligence,   # Per-API raw results
                "analysis": analysis,           # GPT-4o structured analysis
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

