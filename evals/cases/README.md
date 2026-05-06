<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Eval Cases Directory

50 ground truth cases for the v1 batch evaluation of `pattern-diagnose`.

## Structure

```
evals/cases/
├── manifest.json                          # Aggregate summary
├── ANNOTATION_GUIDE.md                    # Labeling instructions for annotators
├── README.md                              # This file
├── strategy-fit-001/case.json             # Strategy fit case
├── strategy-fit-002/case.json
├── ...
├── strategy-anti-001/case.json            # Strategy anti case
├── ...
├── observer-fit-001/case.json
├── ...
├── factory-method-fit-001/case.json
├── ...
└── adapter-anti-002/case.json
```

## Case Format

Each `case.json`:
```json
{
  "id": "strategy-fit-001",
  "pattern": "Strategy",
  "category": "fit",
  "complexity": "low|medium|high",
  "language": "TypeScript|Python|Go",
  "source_code": "...",
  "ground_truth": {
    "pattern": "Strategy",
    "anti_patterns": [],
    "refactoring_steps_valid": true
  },
  "expected_smells": ["long-conditional-on-type"]
}
```

Anti cases include an additional `anti_reason` field explaining why the pattern should NOT be applied.

## Case Inventory

| Pattern | Fit | Anti | Total |
|---------|-----|------|-------|
| Strategy | 10 | 3 | 13 |
| Observer | 10 | 3 | 13 |
| Factory Method | 10 | 2 | 12 |
| Adapter | 10 | 2 | 12 |
| **Total** | **40** | **10** | **50** |

## Running the Eval

```bash
# Validate case structure
node evals/scripts/generate-ground-truth.mjs  # regenerates from script

# Run evaluation (requires Anthropic API key)
node evals/scripts/run-eval.mjs --n=50

# Compute bootstrap CI (after run-eval produces real results)
node evals/scripts/bootstrap-ci.mjs

# Compute annotator reliability (after annotations exist)
node evals/scripts/ground-truth-kappa.mjs
```

## Annotation

See `ANNOTATION_GUIDE.md` for labeling instructions. Ground truth annotations go in `evals/cases/annotations/` as JSON files named by annotator ID.
