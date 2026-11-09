
from pydantic import BaseModel


class IncidentAnalytics(BaseModel):
    total_incidents: int
    open_incidents: int
    investigating_incidents: int
    resolved_incidents: int
    critical_incidents: int
    high_incidents: int
    medium_incidents: int
    low_incidents: int
