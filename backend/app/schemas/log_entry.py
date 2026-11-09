
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


LogSeverity = Literal["low", "medium", "high", "critical"]


class LogEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    line_number: int
    severity: LogSeverity
    message: str
    created_at: datetime


class LogEntryListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    logs: list[LogEntryResponse]
