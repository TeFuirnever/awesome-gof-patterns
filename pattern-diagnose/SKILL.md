<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
---
name: pattern-diagnose
description: |
  Diagnose design pattern applicability in code. Identifies code smells (long
  conditionals on type, parallel subclasses differing in one method, manual
  observer lists, incompatible interface shapes, conditional construction, etc.)
  and recommends GoF refactoring patterns with minimal-step plans and trade-off
  warnings. Use when the user asks "which design pattern fits this code", asks
  about refactoring decisions, describes a code smell that maps to GoF, or
  invokes /dp or /pattern-diagnose.
  Read-only: produces a diagnostic report; does not modify code.
license: MIT
metadata:
  version: 1.0.0
  upstream_target: anthropics/skills
---

# pattern-diagnose

A diagnostic skill for design pattern applicability. v1 supports Strategy,
Observer, Factory Method, and Adapter.

## When to activate

- User explicitly invokes `/dp` or `/pattern-diagnose`
- User asks "which design pattern fits this code"
- User describes a code smell that maps to GoF — long if/elif by type,
  parallel subclasses differing in one method, manual observer list,
  conditional construction, incompatible interface shapes, etc.
- User asks "should I refactor this with [pattern name]"

## When NOT to activate

- "Is this code clean?" → defer to `code-reviewer`
- "Remove dead code" → defer to `refactor-cleaner`
- "Write me a Strategy implementation from scratch" — this skill is for
  diagnosing existing code, not generating greenfield templates

## Boundary vs other skills

| Skill | Concern | Relation |
|-------|---------|----------|
| `code-reviewer` | General quality and bugs | Broader; defer for general review |
| `refactor-cleaner` | Dead code removal | Different concern; complementary |
| `pattern-diagnose` (this) | Pattern-fit only | Narrow and read-only |

## Available patterns (v1)

The smell catalog is in `references/smell-catalog.json` (auto-generated from
knowledge cards by `scripts/build-smell-catalog.mjs`). Each entry maps a pattern
to its smell IDs, anti-pattern IDs, and the reference file to load for details.

| Pattern | Reference | Key smells |
|---------|-----------|------------|
| Strategy | `references/strategy.md` | long-conditional-on-type, parallel-subclass-only-differs-in-one-method, manual-callback-table |
| Observer | `references/observer.md` | manual-listener-list, polling-for-state-change, tight-coupling-on-notification |
| Factory Method | `references/factory-method.md` | new-concrete-in-interface, conditional-construction, constructor-knows-too-much |
| Adapter | `references/adapter.md` | incompatible-interface-shape, glue-code-accumulation, defensive-wrapper-at-boundary |

## Workflow

1. Read the user's code (path or pasted snippet)
2. Read `references/smell-catalog.json` for the full smell-to-pattern mapping
3. Match the code against the catalog's smell patterns to identify candidate pattern(s)
4. Read the relevant reference file(s): `references/{pattern}.md`
4. For each matched pattern, check smell evidence and anti-patterns from the frontmatter
5. If at least one smell matches with concrete file:line evidence, produce a
   Diagnostic Report (template below)
6. If multiple patterns match, rank by evidence strength and present all candidates
7. If no smell matches any known pattern, state "no pattern fit" and recommend
   `code-reviewer` or another suitable skill

## Diagnostic Report template

Use this exact structure:

```markdown
## Diagnostic Report — {file or scope}

### Smell summary
- {smell-id}: {file}:{line-range} — {brief evidence quote}

### Candidate pattern
**{Pattern Name}** (confidence: {low|medium|high})

Rationale: {1-2 sentences citing the matched smell(s)}

### Trade-offs — when NOT to apply
- {anti-pattern from frontmatter `anti_patterns` field, with reasoning}
- ...

### Minimal refactor steps
1. {step from frontmatter `steps` field}
2. ...

### Verification plan
- Tests to add or run: {specific to the user's code}
- Behavior invariants to preserve: {specific to the user's code}
```

## Output discipline

- **Do not modify code** — this skill is read-only
- **Cite evidence** — every smell claim must reference a file:line
- **Acknowledge non-fit** — if the code does not match any known pattern, say
  so plainly rather than forcing a recommendation
- **Stay in scope** — do not diagnose unrelated quality issues; defer them
