import re
from typing import TypedDict

class ParsedLog(TypedDict):
    line_number: int
    severity: str
    message: str

SEVERITY_PATTERNS = [
    (r"\b(CRITICAL|FATAL|PANIC)\b", "critical"),
    (r"\b(ERROR|EXCEPTION|TRACEBACK)\b", "high"),
    (r"\b(WARN|WARNING)\b", "medium"),
]

def parse_log_line(line: str, line_number: int) -> ParsedLog | None:
    """
    Identify whether a log line represents an incident.

    INFO and DEBUG entries are ignored.
    WARNING, ERROR and CRITICAL entries are detected.
    """

    cleaned_line = line.strip()

    if not cleaned_line:
        return None

    for pattern, severity in SEVERITY_PATTERNS:
        if re.search(pattern, cleaned_line, re.IGNORECASE):
            return {
                "line_number": line_number,
                "severity": severity,
                "message": cleaned_line
            }

    return None

def analyze_log_content(content: str) -> list[ParsedLog]:
    """Analyze all lines in a log file."""

    detected_logs = []

    for line_reader, line in enumerate(content.splitlines(), start=1):
        parsed = parse_log_line(line, line_reader)

        if parsed:
            detected_logs.append(parsed)

    return detected_logs