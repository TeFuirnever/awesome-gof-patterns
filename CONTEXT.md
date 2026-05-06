# Domain Glossary

> Domain vocabulary for the awesome-gof-patterns project.
> Skills and agents should use these terms consistently.

## Core Concepts

- **Knowledge Card** — A markdown file (`references/{pattern}.md`) with YAML frontmatter defining a GoF pattern's diagnostic data: smells, anti-patterns, refactor steps, and modern language relevance.
- **Smell** — A code symptom that signals a specific pattern might apply. Identified by `id` and described by a `pattern` (what to look for) and optional `indicator_examples`.
- **Anti-pattern** — A contraindication against applying a pattern. Each has an `id`, a `rule` (when not to apply), and a `why` (the cost of misapplying).
- **Diagnostic Report** — The skill's output: smell summary, candidate pattern with confidence, trade-offs, minimal refactor steps, and verification plan. Read-only — never modifies code.
- **Smell Catalog** — A structured JSON file (`references/smell-catalog.json`) mapping every pattern to its smell IDs and anti-pattern IDs. Auto-generated from knowledge cards by `build-smell-catalog.mjs`.

## Project Structure

- **Batch** — A group of patterns sharing one eval cycle. v1 batch: Observer + Factory Method + Adapter. Each batch must pass eval before the next begins.
- **Loading Budget** — Token count constraint on the skill's initial load. Hard cap: 8K tokens. Progressive loading keeps the hub small and loads detail files on demand.
- **Progressive Loading** — SKILL.md acts as a hub (triggers + smell catalog reference). Pattern details loaded from `references/{pattern}.md` only when needed.

## Evaluation

- **Preregistered Protocol** — The eval design locked before data collection. Changes require public RFC + 14-day comment window.
- **Go/No-Go Gate** — C-B effect size ≥15% on M1 (Top-1 accuracy). If No-Go, project archives per ARCHIVE_PLAYBOOK.md.
- **3-Arm Trial** — Bare model / token-matched placebo / skill-enhanced. Controls for context length confound.
- **Cohen's κ** — Inter-annotator agreement threshold (≥0.7) for ground truth reliability.

## Content

- **Modern Degradation** — A section in each knowledge card noting where the pattern's class-form is unnecessary in modern languages (functions replace classes, implicit interfaces replace explicit ones).
- **Anti-plagiarism Guard** — 15% n-gram Jaccard similarity threshold against a corpus of known GoF passages. Enforced by `scripts/similarity-check.mjs`.
