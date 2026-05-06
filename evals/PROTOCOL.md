<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Evaluation Protocol (Preregistered)

> **Preregistration date**: 2026-05-06
> **Status**: LOCKED — changes after this date require a public RFC + re-run

This document defines the experiment design for evaluating whether the
`pattern-diagnose` skill provides measurable benefit beyond mere context
injection.

---

## 1. Research question

Does the `pattern-diagnose` skill (Strategy knowledge card at v0) improve
an LLM's ability to diagnose design pattern applicability compared to
(a) a bare model and (b) the model with an equal-length irrelevant context?

## 2. Study design: Three-arm controlled trial

| Arm | Condition | Purpose |
|-----|-----------|---------|
| A | Bare Claude (system prompt only) | Baseline |
| B | Claude + token-matched placebo context | Controls for context length confound |
| C | Claude + `pattern-diagnose` skill | Experimental |

### Controls
- Same model ID across all arms
- Temperature = 0
- Same random seed per case across arms
- Same prompt template (only the injected context differs)
- B arm uses unrelated text (e.g., cooking recipes) padded/truncated to match
  C arm token count ± 5%

## 3. Sample

### Size
- **N = 50 cases** (PILOT STUDY)
- Justification: power analysis reveals N=50 insufficient for confirmatory study
  with Bonferroni correction. Positioning as pilot to estimate effect size.
- Decision rule: if point estimate ≥15% and direction correct, pre-commit to
  N≈200 confirmatory follow-up (α=0.05, power≥0.8 for primary metric only)
- Run `evals/scripts/power-analysis.mjs` to verify before execution

### Source
- Public GitHub repositories (stars > 100, last commit < 12 months)
- Third-party selector (not skill author) filters candidates
- Stratified by complexity: ~17 low / ~17 medium / ~16 high

### Composition (preregistered ratio)
- 40 cases: Strategy pattern IS the appropriate recommendation
- 10 cases: Strategy is NOT appropriate (anti-examples / no-pattern-needed)

### Debiasing
- Selector has no access to skill code
- Author excluded from selection and labeling

## 4. Ground truth annotation

### Annotators
- 2 independent annotators per case
- Neither annotator may be the skill author
- Annotators do not see skill code before labeling
- Annotation guide provided (see `evals/cases/ANNOTATION_GUIDE.md`)

### Labels per case
1. Correct pattern recommendation (or "none needed")
2. Applicable anti-patterns (set; may be empty)
3. Expected refactoring steps validity (binary per step)

### Reliability
- Compute Cohen's κ between two annotators
- **κ < 0.7 → discard round, retrain, re-annotate**
- Disagreements resolved by third-party adjudicator
- Report κ in final results

## 5. Metrics

All metrics are binary/countable — no subjective Likert scales.

### M1: Top-1 accuracy
- Does the model's first-choice pattern recommendation match ground truth?
- "No pattern needed" is a valid correct answer
- Equivalence handling: if wording differs but semantics match, use
  LLM-as-judge protocol (Section 7)

### M2: Anti-pattern warning recall
- Denominator: gold-standard anti-pattern set for each case
- Numerator: anti-patterns correctly surfaced by the model
- Score per case: |correct warnings| / |total gold warnings|
- Cases with empty gold set are excluded from this metric

### M3: Refactoring step executability
- An executor agent (separate from judging) applies the recommended steps
  to the source code
- Existing tests must pass after refactoring
- Binary per case: 1 = tests pass, 0 = tests fail or steps cannot be applied
- **No human judgment** — purely mechanical

## 6. Statistical analysis

### Primary comparisons (Pilot Study revision)
- **C vs B** (skill content effect): the primary hypothesis test (SINGLE metric)
- **B vs A** (context length effect): the control comparison (exploratory)
- C vs A reported for reference but NOT used in Go/No-Go decisions

### Tests
- McNemar's test (paired binary outcomes on same cases)
- Bootstrap 95% CI (B = 10,000 resamples) for effect size
- **α = 0.05 for single primary metric (NO Bonferroni correction)**

### Self-consistency check
- Each arm runs 5 independent times (temperature = 0 still; nondeterminism
  from sampling order if any)
- Majority vote per case is the final answer
- Report consistency rate (% cases with unanimous 5/5 agreement)

## 7. LLM-as-judge protocol (M1 equivalence only)

When model output uses different words but same meaning as ground truth:
- Judge model: GPT-4o (cross-model to avoid self-preference)
- Position debiasing: run A/B order and B/A order, average
- Calibration: ≥ 20 manually-labeled calibration examples
- Calibration κ with human ≥ 0.7 to deploy; otherwise fall back to
  strict string matching

## 8. Loading budget constraint

- Hard cap: skill injection ≤ 8,000 tokens (measured by `tiktoken cl100k`)
- If SKILL.md + references/strategy.md exceeds cap → automatic FAIL
- Prevents gaming via dumping excessive context

## 9. Go/No-Go gate (preregistered)

### Go criteria (Pilot Study revision)
1. **C-B point estimate effect size ≥ 15% AND direction correct**
   (Single primary metric: M1 Top-1 accuracy, α = 0.05)
2. Loading budget ≤ 8K tokens
3. Independent reproducer (different person, same protocol, same cases)
   obtains consistent results (same Go/No-Go conclusion)
   
### Pre-commitment
- If Go criteria met: pre-commit to N≈200 confirmatory follow-up
- Confirmatory design: α=0.05, target power≥0.8 for M1 only

### No-Go
- Archive per `ARCHIVE_PLAYBOOK.md`
- Publish negative-result blog + Zenodo DOI
- "Almost passed" does NOT count as Go

## 10. Reproduction protocol

- A second eval executor (not the author) must independently run the full
  protocol on the same 50 cases
- They use the same scripts (`evals/scripts/run-eval.mjs`)
- Results are committed to `evals/results/reproduction/`
- If primary and reproduction disagree on Go/No-Go → No-Go by default

## 11. Reporting

Final report includes:
- Raw results per case (arm × metric) in `evals/results/`
- Aggregate tables: means, CIs, p-values
- Cohen's κ for ground truth reliability
- Self-consistency rates
- Loading budget measurement
- Reproduction comparison
- Pre/post comparison to this preregistered protocol (any deviations noted)

## 12. Amendments

After preregistration lock, changes require:
1. Public RFC issue explaining rationale
2. ≥ 14-day comment window
3. Approval by BDFL + at least one non-author
4. Protocol re-version (PROTOCOL-v2.md alongside this document)
5. If sample or metrics change: full re-run required

### Note for Pilot Study
This protocol is amended for pilot study purposes (N=50, single metric).
The confirmatory follow-up (if triggered) will use PROTOCOL-v2.md with
full power analysis and multi-metric design.

## 13. v1 Batch Addendum

> **Status**: DRAFT — pending v1 content completion
> **Amends**: Sections 1, 3, 4 for batch evaluation of Observer + Factory Method + Adapter
> **Does NOT modify**: Go/No-Go criteria (Section 9), statistical methods (Section 6)

### 13.1 Research question (v1 extension)

Does the `pattern-diagnose` skill (Strategy + Observer + Factory Method + Adapter
at v1) improve an LLM's ability to diagnose design pattern applicability across
multiple patterns compared to (a) a bare model and (b) the model with an
equal-length irrelevant context?

### 13.2 Sample composition (v1 batch)

- **N = 50 cases** (pilot, same as v0)
- Stratified across 4 patterns:

  | Pattern | Cases (fit) | Cases (anti) |
  |---------|-------------|--------------|
  | Strategy | 10 | 3 |
  | Observer | 10 | 3 |
  | Factory Method | 10 | 2 |
  | Adapter | 10 | 2 |

  Total: 40 fit + 10 anti = 50

### 13.3 Ground truth expansion

- Same 2-annotator protocol, same Cohen's κ ≥ 0.7 threshold
- Each annotator labels case with: correct pattern name (or "none"),
  applicable anti-patterns, refactoring step validity
- Cross-pattern confusion cases (e.g., Strategy vs State) are explicitly
  included to test discriminative accuracy

### 13.4 Loading budget (v1)

- SKILL.md hub (no inline pattern content): ~2-3K tokens
- One reference file loaded on demand: ~1.5-2K tokens
- Total per-diagnosis load: hub + 1 reference ≈ 4-5K tokens
- Hard cap remains ≤8K tokens (measured as hub + single reference)

### 13.5 No-Go batch handling

If batch eval yields No-Go:
1. Identify which pattern(s) failed (per-pattern M1 breakdown)
2. If a single pattern drags down the batch, split it out and re-run
   remaining patterns as a sub-batch
3. Failed individual pattern follows `ARCHIVE_PLAYBOOK.md`
4. If all patterns fail, full archive per Section 9 No-Go
