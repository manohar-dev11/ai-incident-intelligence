
import argparse
import json
from pathlib import Path

from app.services.root_cause_analyzer import analyze_root_cause


PROJECT_ROOT = Path(__file__).resolve().parents[3]

DATASETS = {
    "development": PROJECT_ROOT / "data" / "evaluation" / "incident_cases.json",
    "challenge": PROJECT_ROOT / "data" / "evaluation" / "challenge_cases.json",
}


def load_dataset(dataset_name: str):
    """Load the selected evaluation dataset."""

    dataset_path = DATASETS[dataset_name]

    with open(dataset_path, "r", encoding="utf-8") as file:
        return json.load(file)


def evaluate_rule_engine(dataset_name: str = "development"):
    """Evaluate rule-based incident classification."""

    cases = load_dataset(dataset_name)

    total = len(cases)
    correct = 0
    failed_cases = []

    print("\nAI INCIDENT INTELLIGENCE PLATFORM")
    print("=" * 55)
    print(f"Dataset: {dataset_name.upper()}")
    print("Rule-Based Classification Evaluation")
    print("=" * 55)

    for case in cases:
        result = analyze_root_cause(
            title=case["title"],
            description=case["description"],
        )

        expected = case["expected_category"]
        predicted = result["category"]

        is_correct = predicted == expected

        if is_correct:
            correct += 1
            status = "PASS"
        else:
            status = "FAIL"
            failed_cases.append({
                "id": case["id"],
                "expected": expected,
                "predicted": predicted,
            })

        print(
            f"{case['id']} | {status} | "
            f"Expected: {expected} | "
            f"Predicted: {predicted}"
        )

    accuracy = (correct / total * 100) if total else 0

    print("\n" + "=" * 55)
    print("EVALUATION SUMMARY")
    print("=" * 55)

    print(f"Dataset     : {dataset_name}")
    print(f"Total Cases : {total}")
    print(f"Correct     : {correct}")
    print(f"Incorrect   : {total - correct}")
    print(f"Accuracy    : {accuracy:.2f}%")

    if failed_cases:
        print("\nMisclassified Incidents:")

        for case in failed_cases:
            print(
                f"- {case['id']}: "
                f"Expected {case['expected']}, "
                f"Got {case['predicted']}"
            )

    return accuracy


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Evaluate incident classification accuracy."
    )

    parser.add_argument(
        "--dataset",
        choices=["development", "challenge"],
        default="development",
        help="Dataset to evaluate",
    )

    args = parser.parse_args()

    evaluate_rule_engine(args.dataset)
