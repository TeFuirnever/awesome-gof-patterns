<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Governance

## Decision model: BDFL (v0)

At v0, this project operates under a Benevolent Dictator For Life model.
The BDFL — listed in `MAINTAINERS.md` — has final say on:

- License changes
- Eval protocol modifications (post-preregistration changes require public RFC)
- Breaking changes to the SKILL.md trigger contract
- Adding or removing maintainers
- Archive decisions per `ARCHIVE_PLAYBOOK.md`

Every other decision (knowledge card content, eval cases, examples, docs)
follows lazy consensus: PR open ≥ 72 hours with no objection from a
maintainer = approved.

## Promotion path

The project intentionally has a low bar to grow contributor capacity, since
v0 has bus factor = 1.

| Level | Criteria | Rights |
|-------|----------|--------|
| Contributor | 1+ merged PR | Comment, open PRs |
| Triager | 5+ merged PRs over ≥ 30 days | Label issues, request changes on PRs |
| Maintainer | 10+ merged PRs OR triager for ≥ 90 days, BDFL invitation | Merge PRs, request reviews |
| BDFL | n/a (succession only) | All of the above + governance decisions |

A triager or maintainer who is inactive for 6 months is moved to "emeritus"
status with thanks. They may return to active status anytime.

## RFC process

Substantive changes — eval protocol, license, scope expansion — require an
RFC issue with:
- Problem statement
- Proposed change
- Alternatives considered
- ≥ 14 day comment window

Non-substantive changes do not need an RFC.

## Conflict resolution

1. Discuss in the PR or issue
2. If unresolved, escalate to a maintainer
3. If unresolved, BDFL decides
4. CoC violations follow `CODE_OF_CONDUCT.md` enforcement

## Succession

If the BDFL becomes unavailable for 90+ days without notice, the longest-tenured
active maintainer becomes acting BDFL until either the original BDFL returns
or the maintainer team votes (simple majority) on a permanent successor.
