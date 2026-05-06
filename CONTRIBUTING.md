<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Contributing to awesome-gof-patterns

Thank you for your interest in contributing! This project follows a
falsification-first approach — contributions that strengthen or challenge the
evaluation are as valued as feature work.

## Developer Certificate of Origin (DCO)

This project uses the [DCO](https://developercertificate.org/) instead of a CLA.
Every commit must include a `Signed-off-by:` line:

```
Signed-off-by: Your Name <email@example.com>
```

Use `git commit -s` to add it automatically. CI enforces this via dcoBot.

## What can I contribute at v0?

See the `good-first-issue` label for starter tasks. Currently:

1. Add a Strategy anti-example (TypeScript or Python)
2. Translate NOTICE to English (already done inline; verify completeness)
3. Add an `anti_pattern` entry to `strategy.md` from real-world experience
4. Add an eval case to `evals/cases/` (must include ground truth annotation)
5. Improve SKILL.md `description` trigger keywords (run eval to verify no regression)

## Workflow

1. Fork and clone
2. Create a branch: `git checkout -b feat/your-topic`
3. Make changes following Conventional Commits: `feat:`, `fix:`, `docs:`, etc.
4. Ensure `reuse lint` passes (SPDX headers on new files)
5. Sign off every commit: `git commit -s`
6. Open a PR using the template (`.github/PULL_REQUEST_TEMPLATE.md`)

## Code files

- License: MIT (see `LICENSE-CODE`)
- Add `// SPDX-License-Identifier: MIT` as the first line

## Content files (knowledge cards, prose)

- License: CC BY-SA 4.0 (see `LICENSE-CONTENT`)
- Add `<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->` in the header
- Sources must be documented in frontmatter `sources:` field
- Run `node scripts/similarity-check.mjs <file>` — must pass < 15% threshold

## Eval contributions

Adding eval cases requires:
1. Source code from a public GitHub repo (stars > 100, active)
2. Ground truth annotation following `evals/PROTOCOL.md` labeling guide
3. Complexity tier classification (low / medium / high)
4. Your annotation will be cross-checked by a second annotator before merge

## Reviewer/校对者 profile

We especially welcome contributors with:
- Production refactoring experience with GoF patterns
- Statistical evaluation or ML experiment design background
- OSS governance or compliance expertise

## Code of Conduct

This project follows the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md).
Report concerns to the maintainer listed in MAINTAINERS.md.

## Office Hours

Monthly — see GitHub Discussions for schedule.
