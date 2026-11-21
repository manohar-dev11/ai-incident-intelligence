
import io
import json
import unittest

from unittest.mock import patch
from urllib.error import URLError

from app.services.ai_root_cause import analyze_with_ai

class TestAIRootCause(unittest.TestCase):

    def test_successful_ai_analysis(self):
        """Valid Ollama response should return AI analysis."""

        ai_result = {
            "category": "Database",
            "probable_cause": "Database connection failure",
            "recommendations": [
                "Check database health",
                "Verify database credentials",
                "Inspect database logs",
            ],
        }

        mock_response = {
            "response": json.dumps(ai_result)
        }

        response_bytes = io.BytesIO(
            json.dumps(mock_response).encode("utf-8")
        )

        with patch(
            "app.services.ai_root_cause.urlopen",
            return_value=response_bytes,
        ):
            result = analyze_with_ai(
                "Database connection timeout",
                "Connection failed after 30 seconds",
            )

        self.assertEqual(
            result["confidence"],
            "ai_generated_unverified",
        )

        self.assertEqual(result["category"], "Database")
        self.assertEqual(len(result["recommendations"]), 3)

    def test_ollama_connection_failure(self):
        """When Ollama is unavailable, rules must work."""

        with patch(
            "app.services.ai_root_cause.urlopen",
            side_effect=URLError("Connection refused"),
        ):
            result = analyze_with_ai(
                "Database server unavailable",
                "Database connection failed",
            )

        self.assertEqual(result["category"], "Database")
        self.assertEqual(result["confidence"], "rule_match")

    def test_invalid_ai_response(self):
        """Invalid Ollama output should trigger fallback."""

        invalid_result = {
            "response": json.dumps({
                "category": "Database",
                "probable_cause": "Connection issue",
                "recommendations": [],
            })
        }

        response_bytes = io.BytesIO(
            json.dumps(invalid_result).encode("utf-8")
        )

        with patch(
            "app.services.ai_root_cause.urlopen",
            return_value=response_bytes,
        ):
            result = analyze_with_ai(
                "Database server unavailable",
                "Database connection failed",
            )

        self.assertEqual(result["confidence"], "rule_match")
        self.assertEqual(result["category"], "Database")

    
    def test_ai_category_conflict(self):
        """Conflicting AI category must trigger rule fallback."""

        ai_result = {
            "category": "Network",
            "probable_cause": "Possible network packet loss.",
            "recommendations": [
                "Check network latency.",
                "Inspect network routes.",
                "Verify firewall settings.",
            ],
        }

        mock_response = {
            "response": json.dumps(ai_result)
        }

        response_bytes = io.BytesIO(
            json.dumps(mock_response).encode("utf-8")
        )

        with patch(
            "app.services.ai_root_cause.urlopen",
            return_value=response_bytes,
        ):
            with self.assertLogs(
                "app.services.ai_root_cause",
                level="WARNING",
            ) as logs:
                result = analyze_with_ai(
                    "Database connection timeout",
                    "Connection failed after 30 seconds",
                )

        self.assertEqual(result["category"], "Database")
        self.assertEqual(result["confidence"], "rule_match")
        self.assertTrue(
            any("conflicts with rule category" in log for log in logs.output)
        )


if __name__ == "__main__":
    unittest.main()