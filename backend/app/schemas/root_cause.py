
from pydantic import BaseModel


class RootCauseResponse(BaseModel):
    incident_id: int
    incident_title: str
    category: str
    probable_cause: str
    confidence: str
    recommendations: list[str]
    matched_patterns: list[str]
