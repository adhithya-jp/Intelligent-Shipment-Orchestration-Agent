import uuid
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import mongo_singleton
from app.core.logger import log, request_id_ctx_var


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    try:
        mongo_singleton.connect(uri=settings.MONGO_URI, db_name=settings.DB_NAME)
        log.info("Successfully connected to MongoDB")
    except Exception as e:
        log.error(f"Failed to connect to MongoDB, running in degraded mode! Error: {str(e)}")
    
    yield
    
    # Shutdown: Close MongoDB connection
    try:
        mongo_singleton.disconnect()
    except Exception:
        pass

def setup_routers(app: FastAPI):
    # Ignore missing auth routes for now since that's a previous refactor
    # from app.routes import auth, shipment, ai
    from app.routes.ai import router as ai_router
    
    # Example placeholder: app.include_router(auth.router)
    app.include_router(ai_router)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for AI-powered logistics routing, cost calculation, and shipment tracking.",
    version="1.0.0",
    lifespan=lifespan
)

# Initialize loaded routers
setup_routers(app)

@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    """
    Middleware that generates or uses a provided X-Request-ID, 
    attaches it to request state, injects it into contextvars for logging, 
    and returns it in the response header.
    """
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    
    # Set contextvar so standard log.info() automatically picks this up in all async workflows!
    request_id_ctx_var.set(req_id)
    
    # Also attach to request object natively
    request.state.request_id = req_id
    
    response = await call_next(request)
    
    # Expose back to frontend
    response.headers["X-Request-ID"] = req_id
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches all unhandled exceptions, logs them with stack trace,
    and returns a clean 500 internal server error.
    """
    # exc_info=True automatically attaches the stack trace to our JSON payload
    log.error(f"Unhandled exception caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later."}
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

