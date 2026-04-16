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
    cargo_type: Optional[str] = "General Cargo"


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
            cargo_type=request.cargo_type or "General Cargo",
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
            cargo_type=request.cargo_type or "General Cargo",
        )

        # Step 2: Send to GPT-4o for analysis
        analysis = await analyze_route(intelligence)

        # Step 3: Save to active_routes collection in MongoDB
        route_id = None
        try:
            from app.core.database import get_db
            from datetime import datetime, timezone
            import uuid
            
            db = get_db()
            route_id = str(uuid.uuid4())
            route_doc = {
                "id": route_id,
                "origin": request.origin,
                "destination": request.destination,
                "cargo_type": request.cargo_type,
                "weight_kg": request.weight_kg,
                "sla_days": request.sla_days,
                "budget": request.budget,
                "status": "Optimization Complete",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "analysis_summary": analysis.get("executive_summary", "No summary available"),
                "recommended_mode": analysis.get("recommended_mode", "UNKNOWN"),
                "estimated_cost_usd": analysis.get("estimated_cost_usd", 0),
                "full_analysis": analysis
            }
            db.active_routes.insert_one(route_doc)
        except Exception as db_err:
            print(f"Failed to save route to DB: {db_err}")

        return {
            "status": "success",
            "data": {
                "intelligence": intelligence,   # Per-API raw results
                "analysis": analysis,           # GPT-4o structured analysis
                "route_id": route_id            # Reference to saved DB item or None
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

