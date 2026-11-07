from fastapi import FastAPI

from app.api.incidents import router as incidents_router
from app.database.connection import Base, engine
from app.models.incident import Incident

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title = "AI Incident Intelligence Platform",
    description="An Intelligence platform for aplication incident detection and analysis.",
    version = "1.0.0"
)

app.include_router(incidents_router)

@app.get("/")
def home():
    return {
        "message": "AI Incident Intelligencec Platform is running!!...",
        "status": "success"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Incident Inteliigence Platform"
    }