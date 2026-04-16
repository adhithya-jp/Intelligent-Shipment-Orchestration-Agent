from fastapi import APIRouter
from app.core.database import get_db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard-summary")
def get_dashboard_summary():
    """
    Fetch the latest cached API results from the 'live_intelligence' collection.
    This populates the dashboard with data synced from previous routing attempts.
    """
    try:
        db = get_db()
        cursor = db.live_intelligence.find({}, {"_id": 0}).limit(100)
        cached_data = list(cursor)
        summary = {item["api_key"]: item["data"] for item in cached_data}
    except Exception as e:
        print(f"Warning: DB not connected, returning empty analytics cache. {str(e)}")
        summary = {}
    
    # If no data yet, return empty but structured response
    return {
        "status": "success",
        "live_cache": summary,
        "count": len(summary)
    }
