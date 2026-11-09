
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.incidents import router as incidents_router
from app.api.logs import router as logs_router
from app.api.analytics import router as analytics_router

from app.database.connection import Base, engine
from app.models.incident import Incident
from app.models.log_entry import LogEntry

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Incident Intelligence Platform",
    description="An intelligent platform for application incident detection and analysis.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register API routers
app.include_router(incidents_router)
app.include_router(logs_router)
app.include_router(analytics_router)


@app.get("/")
def home():
    return {
        "message": "AI Incident Intelligence Platform is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Incident Intelligence Platform"
    }
