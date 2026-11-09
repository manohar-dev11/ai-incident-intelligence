import hashlib
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.incident import Incident
from app.schemas.log import LogUploadResponse
from app.services.log_parser import analyze_log_content


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
        raise HTTPException(status_code=400, detail="Filename is required")

    extension = Path(file.filename).suffix.lower()

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
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

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

            fingerprint = hashlib.sha256(
                log["message"].encode("utf-8")
            ).hexdigest()

            # Avoid duplicates within the same uploaded file.
            if fingerprint in seen_in_upload:
                duplicate_count += 1
                continue

            seen_in_upload.add(fingerprint)

            # Check existing incidents in the database.
            existing_incident = (
                db.query(Incident)
                .filter(Incident.fingerprint == fingerprint)
                .first()
            )

            if existing_incident:
                duplicate_count += 1
                continue

            incident = Incident(
                title=f"{log['severity'].upper()}: {log['message']}"[:200],
                description=(
                    f"Automatically detected from uploaded log file: "
                    f"{Path(file.filename).name}\n"
                    f"Line number: {log['line_number']}\n"
                    f"Original log: {log['message']}"
                ),
                severity=log["severity"],
                status="open",
                source=f"log_upload:{Path(file.filename).name}"[:100],
                fingerprint=fingerprint
            )

            db.add(incident)
            created_incidents.append(incident)

        db.commit()

        for incident in created_incidents:
            db.refresh(incident)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to process uploaded log file"
        )

    return {
        "filename": Path(file.filename).name,
        "total_lines": len(content.splitlines()),
        "detected_count": len(detected_logs),
        "created_count": len(created_incidents),
        "duplicate_count": duplicate_count,
        "created_incidents": created_incidents
    }