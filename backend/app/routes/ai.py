from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.ai_service import parse_natural_language_routing

router = APIRouter(prefix="/api/ai", tags=["AI Orchestration"])

class RoutingPromptRequest(BaseModel):
    prompt: str

@router.post("/parse-routing")
async def extract_routing_data(request: RoutingPromptRequest):
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    try:
        extracted_data = await parse_natural_language_routing(request.prompt)
        return {"status": "success", "data": extracted_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
