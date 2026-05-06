<!-- SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors -->
<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# Annotation Guide for Ground Truth Labeling

## Purpose

This guide helps annotators consistently label eval cases with the correct design pattern recommendation.

## Pattern Catalog (v1)

| Pattern | Category | Key Signal |
|---------|----------|------------|
| **Strategy** | Behavioral | Algorithm selection by type flag at runtime |
| **Observer** | Behavioral | One-to-many state change notification |
| **Factory Method** | Creational | Conditional object creation, deferred to subclass |
| **Adapter** | Structural | Interface translation between incompatible modules |

## Smell IDs per Pattern

### Strategy
- `long-conditional-on-type`: Long if/switch on a type field selecting algorithms
- `parallel-subclass-only-differs-in-one-method`: Subclasses identical except one method
- `manual-callback-table`: Hand-maintained name→function mapping

### Observer
- `manual-listener-list`: Hand-managed callback array with for-loop dispatch
- `polling-for-state-change`: Repeated polling instead of push notification
- `tight-coupling-on-notification`: Direct calls to specific consumer types

### Factory Method
- `new-concrete-in-interface`: `new ConcreteType()` inside abstract/interface code
- `conditional-construction`: if/switch selecting which object to create
- `constructor-knows-too-much`: Constructor handles both creation and usage

### Adapter
- `incompatible-interface-shape`: Same functionality, different method names/signatures
- `glue-code-accumulation': Translation code piled up at integration points
- `defensive-wrapper-at-boundary`: Repeated similar wrappers at system boundaries

## Labeling Instructions

For each case, provide:

### 1. Pattern name

One of: `Strategy`, `Observer`, `FactoryMethod`, `Adapter`, or `"none"`

**Rules:**
- Choose the pattern that best addresses the **primary** smell
- If multiple patterns could apply, pick the one with the strongest evidence
- Use `"none"` only when no pattern fits or the code is already well-structured
- For anti cases (where a pattern might seem to fit but shouldn't be applied), use `"none"`

### 2. Anti-patterns

List applicable anti-pattern IDs from the knowledge cards. Examples:

| Pattern | Anti-pattern ID | When it applies |
|---------|----------------|-----------------|
| Strategy | `only-one-variant` | Only one implementation exists |
| Strategy | `stateless-trivial-algorithm` | A function parameter would suffice |
| Observer | `only-one-listener` | Single consumer, no future listeners planned |
| Observer | `replace-existing-event-system` | Framework already has EventEmitter/RxJS |
| Factory Method | `simple-static-factory-suffices` | No subclass needed, parameterized function works |
| Adapter | `both-sides-are-yours` | Both interfaces belong to your codebase |

### 3. Refactoring steps validity

`true` if the case demonstrates a pattern that SHOULD be applied and refactoring steps from the knowledge card are executable. `false` for anti-examples.

## Example Annotations

### Correct fit case annotation
```json
{
  "pattern": "Strategy",
  "anti_patterns": [],
  "refactoring_steps_valid": true
}
```

### Correct anti case annotation
```json
{
  "pattern": "none",
  "anti_patterns": ["only-one-listener"],
  "refactoring_steps_valid": false
}
```

### Cross-pattern confusion case
If the code looks like Strategy but is actually State pattern (state machine transitions):
```json
{
  "pattern": "none",
  "anti_patterns": ["replace-simple-polymorphism"],
  "refactoring_steps_valid": false
}
```

## Quality Threshold

- Cohen's κ ≥ 0.7 between annotators is required
- Disagreements resolved by third-party adjudicator
- If κ < 0.7, discard round and retrain
