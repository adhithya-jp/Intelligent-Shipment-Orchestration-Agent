from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import mongo_singleton

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    mongo_singleton.connect(uri=settings.MONGO_URI, db_name=settings.DB_NAME)
    yield
    # Shutdown: Close MongoDB connection
    mongo_singleton.disconnect()

# TODO: Import your routers here as they are built
# from app.routes import auth, shipment, user, analytics, health

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for AI-powered logistics routing, cost calculation, and shipment tracking.",
    version="1.0.0",
    lifespan=lifespan
)


# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to restrict origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder for routing inclusions
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(shipment.router, prefix="/api/shipments", tags=["Shipments"])
# app.include_router(user.router, prefix="/api/users", tags=["Users"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/api/health", tags=["Health"])
def health_check():
    """System health check endpoint."""
    return {"status": "ok", "message": "Shipment Orchestrator Backend is running peacefully."}

