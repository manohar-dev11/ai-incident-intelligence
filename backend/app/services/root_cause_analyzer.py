
import re
from typing import TypedDict


class RootCauseResult(TypedDict):
    category: str
    probable_cause: str
    confidence: str
    recommendations: list[str]
    matched_patterns: list[str]


RULES = [
    {
        "category": "Database",
        "patterns": [
            r"database.*(unavailable|down|failed)",
            r"connection.*refused",
            r"database.*timeout",
            r"\bsql\b.*\b(?:failed|error)\b",
            r"\bdeadlock\b",
        ],
        "cause": "Database connectivity or availability issue.",
        "recommendations": [
            "Check database service health.",
            "Verify database connection settings.",
            "Inspect database server logs.",
        ],
    },
    {
        "category": "Memory",
        "patterns": [
            r"out of memory",
            r"memory usage",
            r"memory.*high",
            r"oom",
        ],
        "cause": "Possible memory exhaustion or excessive memory usage.",
        "recommendations": [
            "Check application memory consumption.",
            "Inspect processes with high memory usage.",
            "Investigate memory leaks.",
        ],
    },
    {
        "category": "Network",
        "patterns": [
            r"connection timeout",
            r"network.*unreachable",
            r"host.*unreachable",
            r"connection reset",
            r"\bdns\b.*\b(?:resolution|failure|failed)\b",
            r"\bpacket\s+loss\b",
        ],
        "cause": "Possible network connectivity or latency issue.",
        "recommendations": [
            "Check network connectivity.",
            "Verify firewall and routing configuration.",
            "Inspect network latency and packet loss.",
        ],
    },
    {
        "category": "Authentication",
        "patterns": [
            r"unauthorized",
            r"authentication failed",
            r"invalid token",
            r"access denied",
            r"\b(?:authentication\s+)?token\s+expired\b",
        ],
        "cause": "Possible authentication or authorization failure.",
        "recommendations": [
            "Verify authentication credentials.",
            "Check token expiration.",
            "Review access permissions.",
        ],
    },


    {
        "category": "Application",
        "patterns": [
            r"\bapplication\b.*\bcrash(?:ed)?\b",
            r"\bunhandled\b.*\bexception\b",
            r"\bnullreference\b.*\bexception\b",
        ],
        "cause": (
            "Possible application error, crash, "
            "or unhandled exception."
        ),
        "recommendations": [
            "Inspect application error logs and stack traces.",
            "Identify the failing function or component.",
            "Review recent code and deployment changes.",
        ],
    },

]


def analyze_root_cause(
    title: str,
    description: str,
) -> RootCauseResult:

    text = f"{title} {description}".lower()

    for rule in RULES:
        matched = [
            pattern
            for pattern in rule["patterns"]
            if re.search(pattern, text, re.IGNORECASE)
        ]

        if matched:
            return {
                "category": rule["category"],
                "probable_cause": rule["cause"],
                "confidence": "rule_match",
                "recommendations": rule["recommendations"],
                "matched_patterns": matched,
            }

    return {
        "category": "Unknown",
        "probable_cause": (
            "Insufficient information to identify a likely cause."
        ),
        "confidence": "insufficient_evidence",
        "recommendations": [
            "Review the full application logs.",
            "Check recent deployments and configuration changes.",
            "Collect additional diagnostic information.",
        ],
        "matched_patterns": [],
    }
