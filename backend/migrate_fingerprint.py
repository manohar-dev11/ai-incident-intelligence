import hashlib

from sqlalchemy import inspect, text
from app.database.connection import engine, SessionLocal
from app.models.incident import Incident


inspector = inspect(engine)

columns = [
    column["name"]
    for column in inspector.get_columns("incidents")
]

with engine.begin() as connection:

    if "fingerprint" not in columns:
        connection.execute(
            text(
                "ALTER TABLE incidents "
                "ADD COLUMN fingerprint VARCHAR(64)"
            )
        )
        print("Fingerprint column added.")

    # Remove the old index if it exists.
    connection.execute(
        text("DROP INDEX IF EXISTS uq_incidents_fingerprint")
    )


db = SessionLocal()

try:
    old_incidents = (
        db.query(Incident)
        .filter(
            Incident.fingerprint.is_(None),
            Incident.source.like("log_upload:%")
        )
        .order_by(Incident.id.asc())
        .all()
    )

    seen_fingerprints = set()
    updated = 0
    skipped = 0

    for incident in old_incidents:

        original_log = None

        for line in incident.description.splitlines():
            if line.startswith("Original log: "):
                original_log = line.replace(
                    "Original log: ", "", 1
                )
                break

        if not original_log:
            continue

        fingerprint = hashlib.sha256(
            original_log.encode("utf-8")
        ).hexdigest()

        if fingerprint in seen_fingerprints:
            skipped += 1
            continue

        seen_fingerprints.add(fingerprint)
        incident.fingerprint = fingerprint
        updated += 1

    db.commit()

    print(f"Existing incidents updated: {updated}")
    print(f"Duplicate incidents left without fingerprint: {skipped}")

finally:
    db.close()


# Create the unique index after fingerprints are assigned.
with engine.begin() as connection:
    connection.execute(
        text("""
            CREATE UNIQUE INDEX IF NOT EXISTS uq_incidents_fingerprint
            ON incidents (fingerprint)
            WHERE fingerprint IS NOT NULL
        """)
    )

print("Database migration completed successfully.")