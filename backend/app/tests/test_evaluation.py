
import unittest
from contextlib import redirect_stdout
from io import StringIO
from unittest.mock import patch

from app.evaluation.evaluate import (
    evaluate_rule_engine,
    load_dataset,
)


VALID_CATEGORIES = {
    "Database",
    "Memory",
    "Network",
    "Authentication",
    "Application",
    "Unknown",
}


class TestEvaluation(unittest.TestCase):

    def test_datasets_are_valid(self):
        """Both datasets must contain valid labeled cases."""

        for dataset_name in ("development", "challenge"):
            with self.subTest(dataset=dataset_name):
                cases = load_dataset(dataset_name)

                self.assertGreater(len(cases), 0)

                ids = set()

                for case in cases:
                    self.assertIn("id", case)
                    self.assertIn("title", case)
                    self.assertIn("description", case)
                    self.assertIn("expected_category", case)

                    self.assertTrue(case["title"].strip())
                    self.assertTrue(case["description"].strip())

                    self.assertIn(
                        case["expected_category"],
                        VALID_CATEGORIES,
                    )

                    self.assertNotIn(case["id"], ids)
                    ids.add(case["id"])

    def test_accuracy_calculation(self):
        """One correct prediction out of two equals 50%."""

        sample_cases = [
            {
                "id": "TEST-001",
                "title": "Database unavailable",
                "description": "Database connection failed",
                "expected_category": "Database",
            },
            {
                "id": "TEST-002",
                "title": "DNS failure",
                "description": "Hostname resolution failed",
                "expected_category": "Network",
            },
        ]

        predictions = [
            {"category": "Database"},
            {"category": "Unknown"},
        ]

        with patch(
            "app.evaluation.evaluate.load_dataset",
            return_value=sample_cases,
        ):
            with patch(
                "app.evaluation.evaluate.analyze_root_cause",
                side_effect=predictions,
            ):
                with redirect_stdout(StringIO()):
                    accuracy = evaluate_rule_engine("development")

        self.assertEqual(accuracy, 50.0)


if __name__ == "__main__":
    unittest.main()
