---
name: software-design-review
description: >
  Reviews code against established software design principles using a team of reviewer subagent personas, returning triaged findings without making direct edits.
  Use when evaluating code diffs, pull requests, or complex software architectures for clarity, maintainability, performance, and failure modes.
---

# Software Design Review

Evaluates code or software designs against software design principles and produces a triaged list of findings with `file:line` references (without making edits).

For quick, light inline reference during active design or implementation, use `software-design-principles` directly.

## How this skill works

Orchestrates a multi-concern review using six reviewer subagents, each examining the surface through a distinct lens. The calling agent aggregates and triages their findings.

## Reference

All principles, calibration guidelines, and worked TypeScript examples are maintained in the canonical principles skill:
- Refer to [`software-design-principles`](../software-design-principles/SKILL.md) for the 27 design principles, Foundation, calibration table, and TypeScript examples.

## When to skip orchestration

For trivial evaluations — single-line fixes, mechanical refactors, ≤2 files, ≤50 changed lines, or no architectural surface — read [`software-design-principles`](../software-design-principles/SKILL.md) directly and apply inline. The dispatch overhead is not worth it for minor tweaks.

For complex code or larger changes, run Phases 1–3 below.

## Phase 1: Identify the evaluation surface

Determine what is being evaluated:
- **Existing code**: Specific files, directories, or modules in the workspace.
- **A diff**: `git diff HEAD`, or an uncommitted change set.
- **A proposed change**: A code snippet or architectural plan provided in context.

If the user has not specified a surface, default to recent uncommitted work (`git diff HEAD`). If there are no uncommitted changes, review the files modified or discussed in the current conversation. Confirm scope with the user if the evaluation surface spans multiple thousand lines or many files.

## Phase 2: Dispatch reviewers in parallel

Dispatch six parallel reviewer subagents in a single turn. Provide each subagent:
1. The full evaluation surface (file paths, diff content, or proposed code).
2. The corresponding reviewer prompt file from `reviewers/<concern>.md`.
3. Reference pointer to [`software-design-principles`](../software-design-principles/SKILL.md).

### Reviewer Subagent Roster

| Concern | Prompt File | Scope |
|---|---|---|
| Premise & verification | [reviewers/premise.md](reviewers/premise.md) | Unverified guards or abstractions, redundant validation at internal boundaries, principle citation tunnel vision |
| Structural design | [reviewers/structural.md](reviewers/structural.md) | Dependency direction (domain ↔ I/O), module boundaries, knowledge duplication, persistence leaks, misplaced seams |
| Code-level smells | [reviewers/code-smells.md](reviewers/code-smells.md) | Speculative abstraction, mixed abstraction levels, redundant state, magic constants, parameter shape, local reuse |
| Efficiency & costs | [reviewers/efficiency.md](reviewers/efficiency.md) | Requirement-driven performance, repeated work, chatty remote/storage boundaries, async serialisation, memory leaks |
| Defensive coding & hacks | [reviewers/defensive.md](reviewers/defensive.md) | Swallowed errors, broad `catch`, `setTimeout`/sleep as sync hacks, retries on deterministic code |
| Verification & completion | [reviewers/completion.md](reviewers/completion.md) | Missing tests, stubs (`TODO`/`FIXME`/`throw new Error("Not implemented")`/`null as any`), hallucinated APIs, unverified completion claims |

Each reviewer returns findings in a standardized Markdown table:

| file:line | concern | finding | calibration anchor | proposed fix |

If a reviewer finds no issues, it responds with: `No findings.`

## Phase 3: Aggregate and triage

When all subagents complete:

1. **Aggregate** findings into a single unified list.
2. **De-duplicate**: Combine findings targeting the same issue. Note subagent convergence as a confidence signal (4+ reviewers agreeing indicates strong evidence).
3. **Resolve cross-concern tensions** using the calibration table in [`software-design-principles`](../software-design-principles/SKILL.md).
4. **Self-check**:
   - For guards/validations: Was the full call path traced?
   - For abstractions: Are there at least two real callers?
   - For code reuse: Did the reviewer identify the existing canonical module/utility?
   - For performance: Is there a real boundary, repeated cost, or explicit performance requirement?
5. **Collect positive observations**: Group correct-by-design patterns identified by reviewers in a `## Positive observations` section.
6. **Triage by priority**:
   - **High**: Real bug, unhandled edge case, user-visible failure, or broken load-bearing invariant.
   - **Medium**: Clear design smell, defensible refactor candidate.
   - **Low**: Minor nit, optional readability tweak.
7. **Present results**: Clear summary ordered by priority, confidence signals, positive observations, and skipped items.

If the surface is clean, report: `No design findings. Code is clean.`

## The Point

> Make the system honest about what it is, ignorant of what it doesn't need to know, easy to verify, and cheap to change. Pay attention to the parts likely to change; hide them behind stable interfaces; let the rest be simple. Verify by observing, not by believing.
