<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# awesome-gof-patterns

> A diagnostic skill for design pattern applicability. Read-only. v0.

`awesome-gof-patterns` (GoF = Gang of Four) is an Anthropic Agent Skill that
diagnoses whether a piece of code would benefit from a specific GoF design
pattern. It produces a **Diagnostic Report** (smell evidence, candidate
pattern, trade-offs, minimal refactor steps, verification plan) — it does not
modify code.

## Status: v0 RFC — pre-evaluation

This is a **falsification-first** project. Before investing in v1, we run a
preregistered eval (see `evals/PROTOCOL.md`) to test whether the skill
provides measurable benefit over a token-matched placebo. If the eval fails
the Go gate, the project is archived per `ARCHIVE_PLAYBOOK.md`.

v0 ships **one pattern only** (Strategy). Eight more patterns are in the
parking lot pending v0 results.

## What's inside

| Path | Purpose |
|------|---------|
| `pattern-diagnose/SKILL.md` | The skill itself — Anthropic spec compliant |
| `pattern-diagnose/references/strategy.md` | Knowledge card (CC BY-SA 4.0) |
| `pattern-diagnose/assets/examples/` | Before/after refactoring examples |
| `evals/PROTOCOL.md` | Preregistered evaluation protocol |
| `evals/cases/` | 50 ground-truth-labeled real-world cases |
| `scripts/similarity-check.mjs` | Anti-plagiarism guard against GoF text |

## Licensing

- **Code** (`*.mjs`, `*.ts`, `*.py`, CI config): MIT — see `LICENSE-CODE`
- **Content** (knowledge cards, prose): CC BY-SA 4.0 — see `LICENSE-CONTENT`
- Per-file `SPDX-License-Identifier:` headers via REUSE 3.3
- Run `reuse lint` to verify

## Contributing

See `CONTRIBUTING.md`. Sign-off required (DCO, not CLA). Five
`good-first-issue`s are open at v0 — see GitHub issues.

## Governance

`GOVERNANCE.md` documents decision-making. `MAINTAINERS.md` lists current
maintainers and discloses bus factor. `ARCHIVE_PLAYBOOK.md` describes the
No-Go path.

## Activation

This skill activates via Anthropic Agent Skills `description`-based
semantic matching. Trigger phrases:

- "which design pattern fits this code"
- "diagnose this for refactoring patterns"
- "/dp" or "/pattern-diagnose" (alias keywords inside `description`)

## Boundary vs other skills

- `code-reviewer` — general quality. Defer to it for "is this clean?"
- `refactor-cleaner` — dead code removal. This skill is pattern-fit only.
