from fastapi import APIRouter
from app.core.database import get_db

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])

@router.get("/active")
def get_active_routes():
    """
    Fetch all active configured routes from the database.
    """
    try:
        db = get_db()
        # Sort by created_at descending (newest first)
        cursor = db.active_routes.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
        routes = list(cursor)
    except Exception as e:
        print(f"Warning: DB not connected, returning empty active routes list. {str(e)}")
        routes = []
    
    return {
        "status": "success",
        "data": routes,
        "count": len(routes)
    }
