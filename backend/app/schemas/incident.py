from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Severity = Literal["low", "medium", "high", "critical"]
IncidentStatus = Literal["open", "investigating", "resolved"]

class IncidentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    severity: Severity = "medium"
    status: IncidentStatus = "open"
    source: str = Field(default="manual", max_length=100)

class IncidentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=5)
    severity: Severity | None = None
    status: IncidentStatus | None = None
    source: str | None = Field(default=None, max_length=100)

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    severity: Severity
    status: IncidentStatus
    source: str
    created_at: datetime