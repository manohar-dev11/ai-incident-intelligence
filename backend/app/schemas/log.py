from pydantic import BaseModel
from app.schemas.incident import IncidentResponse


class LogUploadResponse(BaseModel):
    filename: str
    total_lines: int
    detected_count: int
    created_count: int
    duplicate_count: int
    created_incidents: list[IncidentResponse]