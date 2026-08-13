---
name: software-design-principles
description: >
  Canonical reference for 27 software design principles, foundation heuristics, calibration table, and failure modes.
  Applies when writing, designing, or refactoring code, or evaluating code for clarity, maintainability, performance, and structure.
---

# Software Design Principles Reference

Canonical reference for software design decisions. For reviewing complex diffs using automated subagent personas, use `software-design-review` instead.

## Foundation
**Understand before changing.** Read code and trace call sites before applying rules. Treat user assertions about code as hypotheses to verify. If a rule and local code disagree, local code wins.

## Principles

### Structure
1. **Depend toward stability.** Volatile code (frameworks, I/O, UI) depends on stable code (domain logic).
2. **Hide what is likely to change** behind module boundaries. Boundaries follow expected change, not data shape.
3. **One reason to change per module.** If two stakeholders independently demand edits, split it.
4. **Things that change together belong together.** Things that change for different reasons belong apart.
5. **Make structure scream the domain**, not the framework.
6. **Don't distribute prematurely.** In-process calls are orders of magnitude cheaper than cross-process.

### Code
7. **Optimize for the reader.** Intent should be obvious without comments.
8. **DRY applies to knowledge**, not similar-looking code. Same rule twice = violation. Same shape, different rules = valid.
9. **YAGNI by default.** Extract abstractions on 3rd occurrence — or 2nd when drift would break a business rule.
10. **Simplest design that works.** Passes tests; expresses intent; no knowledge duplication; fewest parts.
11. **Functions do one thing** at one level of abstraction.
12. **Push state to the edges.** Prefer immutability (`Readonly`), pure functions, and value objects.
13. **Crash on broken invariants.** Throw explicit diagnostic errors at I/O boundaries; reserve `assert` for internal invariants.
14. **Default to no comments.** Comments explain *why*, never *what*.
15. **Talk only to your neighbors.** Avoid reach-through chains (`a.b().c().d()`).

### Verification
16. **Code without tests is unverified.**
17. **Test behavior, not implementation.**
18. **"Done" means observed working**, not believed working or compiling.
19. **Use Humble Object pattern** at boundaries (UI, I/O, time, randomness stay thin; logic is pure).

### Domain
20. **Speak domain language** in variable, function, and type names.
21. **Persistence is a detail.** Domain does not import storage drivers.
22. **Bound your contexts.** Draw explicit boundaries when terms have different meanings across business domains.

### Efficiency & Costs
23. **Treat performance as a requirement** when it materially matters to users or system boundaries.
24. **Prefer algorithmic/structural wins** over local syntax tricks.
25. **Eliminate avoidable repeated work** on hot paths.
26. **Design expensive boundaries to minimize round-trips** (coarse-grained batching).
27. **Exploit independence** (e.g. `Promise.all`) without spreading shared state.

## Calibration — When Principles Conflict

| Tension | Default | Override |
|---|---|---|
| **DRY vs YAGNI** | Duplicate until 3rd occurrence | Same *rule* across sites with high drift risk → extract on 2nd |
| **Simple design vs extensibility** | Simplest that works now | Axis of change is *known* and has moved at least once |
| **Heavy architecture vs straight-through** | Match weight to domain complexity | Domain logic is genuinely complex or integration swap planned |
| **Refactor now vs ship now** | Refactor in-scope code being touched | Out-of-scope refactor → separate pull request |
| **Test-first vs explore-first** | Test-first when behavior is known | Spike to learn → **delete spike** → write tested code |
| **Reduce coupling vs avoid abstraction** | Concrete first; abstract on 2nd caller | Interface protects stability boundary AND 2nd caller in flight |
| **Validate inputs vs trust callers** | Validate at system boundaries; trust internal callers | Internal invariant load-bearing → throw explicit error |
| **Fix root cause vs patch symptom** | Pursue root cause first | Emergency patch *with* explicit user approval |
| **Add error handling vs let it fail** | Crash early on invariant failure; only handle with real recovery | Boundary to untrusted system (network, third-party API) |
| **Backwards compatibility vs clean change** | Clean change when no consumers exist | Real consumers depend on API → preserve or migrate |
| **Pattern vs plain code** | Plain functions | Two active use cases exist that pattern unifies |
| **Premature optimization vs bottleneck neglect** | Don't pay complexity for guessed gains | Optimize when cost model is wrong, work repeats, or path profiled |
| **Clarity vs runtime cost** | Prefer clearest code | Accept complexity only when removing structural/profiled bottleneck |

**Tie-breakers**: Choose option easiest to reverse; keep next change cheap; protect seen axes of change.

## Examples & Failure Modes

- **TypeScript Worked Examples**: See [`references/examples.md`](references/examples.md) for I/O boundary error handling, persistence metadata, extraction thresholds, and async boundary batching.
- **Agent Failure Modes to Watch For**:
  - *Premise*: Citing principles without checking call sites; adding dead guards.
  - *Scope*: Adding unsought parameters, backward-compat shims, or refactoring unrelated code.
  - *Abstraction*: Creating interfaces for single implementations or helpers for single callers.
  - *Defensive*: Swallowing exceptions (`catch {}`), adding `setTimeout` timing hacks to tests.
  - *Completion*: Skipping tests (`it.skip`), leaving runtime stubs (`TODO`, `throw new Error("Not implemented")`, `return null as any`), claiming "done" without observed behavior.
  - *Efficiency*: Adding unprofiled caching, or running independent async tasks sequentially instead of `Promise.all`.
