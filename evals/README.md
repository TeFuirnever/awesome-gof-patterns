# Evaluation Scripts

This directory contains all scripts and configurations for running the preregistered evaluation of awesome-gof-patterns.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run power analysis (should pass with pilot study parameters):
```bash
npm run power-analysis
```

3. Run evaluation on N cases:
```bash
npm run run-eval -- --n=50
```

4. Compute confidence intervals:
```bash
npm run bootstrap-ci
```

5. Compute annotation reliability (if annotations exist):
```bash
npm run ground-truth-kappa
```

## Scripts

### `bootstrap-ci.mjs`
Computes bootstrap confidence intervals for the treatment effect (C - B) on Top-1 accuracy using McNemar's test.

```bash
npm run bootstrap-ci -- --results-dir evals/results --output evals/results/bootstrap-ci.json --reps=10000
```

### `ground-truth-kappa.mjs`
Computes Cohen's κ between annotators for ground truth reliability assessment.

```bash
npm run ground-truth-kappa -- --annotations-dir evals/cases/annotations --output evals/results/reliability.json
```

### `run-eval.mjs`
Runs the full evaluation protocol on N cases.

```bash
npm run run-eval -- --cases-dir evals/cases --n=50 --output evals/results/raw-results.json
```

### `power-analysis.mjs`
Validates that the preregistered sample size (N=50) is appropriate for the pilot study.

```bash
npm run power-analysis -- --p1=0.50 --p2=0.65 --alpha=0.05 --power=0.80 --discordant=0.40
```

## Directory Structure

```
evals/
├── cases/              # Test cases with ground truth
├── results/            # Generated results
├── scripts/            # Evaluation scripts
├── PROTOCOL.md         # Preregistered evaluation protocol
└── package.json        # Dependencies
```

## Expected Output

- `raw-results.json`: Raw outcomes for all cases and arms
- `bootstrap-ci.json`: Bootstrap confidence intervals and p-values
- `reliability.json`: Annotation reliability statistics (if applicable)

## Pilot Study Parameters

The evaluation is configured as a pilot study with:
- N = 50 cases (insufficient for confirmatory study with Bonferroni)
- Single primary metric: Top-1 accuracy
- α = 0.05 (no Bonferroni correction)
- Pre-commitment to N≈200 confirmatory follow-up if pilot trends positive

## Go/No-Go Criteria

1. **C-B point estimate effect size ≥ 15% AND direction correct**
   (Single primary metric: M1 Top-1 accuracy, α = 0.05)
2. Loading budget ≤ 8K tokens
3. Independent reproducer obtains consistent results