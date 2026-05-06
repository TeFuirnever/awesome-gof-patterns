<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Archive Playbook

This document defines what happens if the v0 evaluation fails its Go gate
or the project is otherwise wound down. Triggering it is a normal and
honorable outcome — falsification is the point of v0.

## Triggers

Any of:
- Eval gate fails: C-B difference does not reach Bonferroni-corrected
  significance + 15% effect size on ≥ 2 of 3 metrics
- Loading budget exceeds 8K tokens (fails gaming check)
- Independent reproducer's results disagree with primary run
- BDFL decides to wind down for any other documented reason (RFC required)

## Steps

### 1. Freeze contributions
- Pin a CHANGELOG entry: "Project archived on YYYY-MM-DD per ARCHIVE_PLAYBOOK"
- Add a notice banner to the top of `README.md` explaining the archive,
  linking the negative-result writeup, and recommending forks if relevant
- Close all open PRs with a polite explanation; preserve commit trees so
  contributors can rebase elsewhere
- Lock issues but keep them readable

### 2. Preserve attribution
- All merged contributors remain in `git log` and `MAINTAINERS.md` emeritus
- NOTICE remains intact — downstream forks must continue to honor CC BY-SA
- Final tag: `v0-final-archived`

### 3. Make negative result citable
- Write a public negative-result blog post / preprint linking the eval
  results in `evals/results/`
- Mint a Zenodo DOI for the final repo state so the negative result can be
  cited
- Cross-link from README

### 4. Hand-off
- If a fork wishes to continue: list it in README under "Active forks"
- Transfer relevant `good-first-issue` ideas to forks if they ask
- Do not transfer the GitHub repo ownership — keep the archived state visible

### 5. Mechanical archive
- Set GitHub repository to `archived` (read-only)
- Disable issue creation but keep historic issues visible
- Do not delete

## Anti-patterns (what NOT to do)

- Do not silently delete the repo — that destroys the negative-result record
- Do not retroactively change LICENSE-CONTENT (CC BY-SA forbids it anyway)
- Do not pivot scope without a fresh RFC and re-running the eval gate
- Do not let "almost passed" eval results become a Go decision

## Why falsification matters

Most LLM-tooling projects ship without rigorous eval. If the v0 eval fails,
publishing that fact is more useful to the field than yet another untested
skill. Archive cleanly. Cite the negative result. Move on.
