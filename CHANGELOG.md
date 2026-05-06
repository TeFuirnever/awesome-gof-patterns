<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Project renamed from `pattern-rx` to `awesome-gof-patterns`. "Rx" was
  ambiguous with Reactive Extensions in programming context. The new name
  explicitly references GoF (Gang of Four) design patterns.

### Added
- v0 RFC adopted after two rounds of adversarial review
- `pattern-diagnose` skill: Strategy pattern only (single pattern at v0)
- Anthropic Agent Skills spec-compliant `SKILL.md` and directory structure
- Preregistered eval protocol (`evals/PROTOCOL.md`): N=50, 3-arm controlled,
  Cohen's κ ≥ 0.7 ground truth, Bonferroni-corrected significance gates
- REUSE 3.3 compliance and per-file SPDX headers
- DCO contribution model (no CLA)
- Governance scaffolding: GOVERNANCE.md, MAINTAINERS.md, ARCHIVE_PLAYBOOK.md
- Anti-plagiarism guard: `scripts/similarity-check.mjs` with 15% n-gram threshold

### Decided (v0 RFC)
- Content license: CC BY-SA 4.0 (Wikipedia upstream contamination handled)
- Code license: MIT
- v0 scope: 1 pattern (Strategy), 2 languages (TypeScript, Python)
- Progressive loading deferred to v1

## [0.0.1] — TBD
- Initial v0 release pending eval Go decision
