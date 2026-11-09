from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base

class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key = True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False) 
    severity: Mapped[str] = mapped_column(
        String(200),
        default="medium",
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="open",
        nullable=False
    )

    source: Mapped[str] = mapped_column(
        String(100),
        default="manual",
        nullable=False
    )

    fingerprint: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )



