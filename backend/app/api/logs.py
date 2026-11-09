
import hashlib
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from typing import Literal

from app.database.connection import get_db
from app.models.incident import Incident
from app.models.log_entry import LogEntry
from app.schemas.log import LogUploadResponse
from app.services.log_parser import analyze_log_content
from app.schemas.log_entry import LogEntryListResponse


router = APIRouter(prefix="/logs", tags=["Log Intelligence"])

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".log", ".txt"}


@router.post(
    "/upload",
    response_model=LogUploadResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_log_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    filename = Path(file.filename).name
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only .log and .txt files are supported"
        )

    content_bytes = await file.read(MAX_FILE_SIZE + 1)

    if len(content_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum size is 5 MB."
        )

    if not content_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    try:
        content = content_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must use UTF-8 text encoding"
        )

    detected_logs = analyze_log_content(content)

    created_incidents = []
    duplicate_count = 0
    seen_in_upload = set()

    try:
        for log in detected_logs:

            # Save every detected log entry.
            log_entry = LogEntry(
                filename=filename,
                line_number=log["line_number"],
                severity=log["severity"],
                message=log["message"]
            )

            db.add(log_entry)

            # Generate fingerprint for incident deduplication.
            fingerprint = hashlib.sha256(
                log["message"].encode("utf-8")
            ).hexdigest()

            # Avoid duplicate incidents within the same upload.
            if fingerprint in seen_in_upload:
                duplicate_count += 1
                continue

            seen_in_upload.add(fingerprint)

            # Check whether an incident already exists.
            existing_incident = (
                db.query(Incident)
                .filter(Incident.fingerprint == fingerprint)
                .first()
            )

            if existing_incident:
                duplicate_count += 1
                continue

            # Create a new incident.
            incident = Incident(
                title=f"{log['severity'].upper()}: {log['message']}"[:200],
                description=(
                    f"Automatically detected from uploaded log file: "
                    f"{filename}\n"
                    f"Line number: {log['line_number']}\n"
                    f"Original log: {log['message']}"
                ),
                severity=log["severity"],
                status="open",
                source=f"log_upload:{filename}"[:100],
                fingerprint=fingerprint
            )

            db.add(incident)
            created_incidents.append(incident)

        # Save log entries and incidents together.
        db.commit()

        for incident in created_incidents:
            db.refresh(incident)

    except Exception as exc:
        db.rollback()
        print("LOG UPLOAD ERROR:", repr(exc))

        raise HTTPException(
            status_code=500,
            detail="Failed to process uploaded log file"
        )

    return {
        "filename": filename,
        "total_lines": len(content.splitlines()),
        "detected_count": len(detected_logs),
        "created_count": len(created_incidents),
        "duplicate_count": duplicate_count,
        "created_incidents": created_incidents
    }


@router.get("/entries", response_model=LogEntryListResponse)
def get_log_entries(
    severity: Literal["low", "medium", "high", "critical"] | None = None,
    search: str | None = None,
    filename: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["created_at", "line_number", "severity", "filename", "id"] = "created_at",
    order: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db),
):
    query = db.query(LogEntry)

    if severity:
        query = query.filter(LogEntry.severity == severity)

    if search:
        query = query.filter(LogEntry.message.ilike(f"%{search}%"))

    if filename:
        query = query.filter(LogEntry.filename.ilike(f"%{filename}%"))

    total = query.count()

    sort_column = getattr(LogEntry, sort_by)

    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    logs = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": logs,
    }
