
# Incident Classification Evaluation

## Overview

This document records the initial performance of the
AI Incident Intelligence Platform's rule-based classifier.

## Evaluation Results

| Metric | Development | Challenge |
|---|---:|---:|
| Total cases | 12 | 12 |
| Correct | 12 | 2 |
| Incorrect | 0 | 10 |
| Accuracy | 100% | 16.67% |

## Findings

The rule-based classifier performs well on incidents
containing patterns explicitly covered by its rules.

However, it struggles with unfamiliar terminology.

All 10 incorrect challenge predictions were classified
as Unknown.

## Limitations

- Both datasets contain synthetic examples.
- The development dataset influenced rule improvements.
- The challenge dataset is small.
- Results do not establish real-world accuracy.
- These measurements evaluate the rule engine, not the LLM.

## Running Evaluations

From the backend directory:

```powershell
python -m app.evaluation.evaluate --dataset development
python -m app.evaluation.evaluate --dataset challenge
```

## Next Improvements

1. Expand the labeled evaluation datasets.
2. Evaluate AI-only classification separately.
3. Compare AI, rules, and combined classification.
4. Improve classification of unfamiliar error messages.
5. Measure accuracy on fresh test cases.
