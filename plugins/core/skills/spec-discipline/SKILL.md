---
name: spec-discipline
description: >
  How a project's agent-facing documentation is run so it stays true: one job per doc, facts flowing
  DECISIONS → SPECS → IMPL with the copy deleted in the same edit, a glossary that defines nothing,
  facts not history, decide-and-document in one turn, and ✅/☑️ phase ticking. Use when writing or
  reorganising CLAUDE.md / AGENTS.md / specs / READMEs, when a decision is made, when a doc has
  outgrown its file, when porting a spec between repos, or when two docs disagree.
---

# Spec Discipline

Docs an agent reads are load-bearing: a stale one is worse than a missing one, because it is obeyed.
These rules are what keep a set of them true as the project moves.

## Specs are binding, not advisory

- **A spec is read before the code it governs is written**, and it wins over habit, over a
  neighbouring project, and over what the agent would otherwise do.
- **Name which spec owns which task** in one table at the top of `CLAUDE.md`: *read this before
  doing that*. Enough to know which doc a task belongs to, and no more.
- **If a rule and the local code disagree, stop and ask which is wrong.** Silently following either
  one is how a spec becomes fiction.

## One job per doc

Give every doc a single audience and a single kind of content, and say so in its first lines.

| doc | holds | never holds |
| --- | --- | --- |
| `CLAUDE.md` | orientation: what this is, the doc index, working rules, guardrails | specification, rationale, history |
| `<AREA>_SPECS.md` | the settled specification — **facts only** | open questions, negotiation, implementation detail |
| `<AREA>_DECISIONS.md` | what is still **open**, what was **rejected and why** | anything settled |
| `<AREA>_IMPL.md` | the thing **as built**: constraints an API imposes that its own docs don't, approaches tried and abandoned **with their numbers** | the contract (that's SPECS), a usage manual |
| `GLOSSARY.md` | one line per word: the gloss, the identifier carrying it, the section that owns it, **and what it does not mean** | facts of its own — it defines nothing, so it cannot drift into a second spec |
| `README.md` | structure, requirements, commands, operations — **for humans** | walkthroughs, rationale, reading guides |
| `PLAN.md` | phases, gates, what is settled *elsewhere* via `→ SPECS` pointers | restated specification |

- **An `IMPL` doc needs a "what does not belong here" section.** It is the only thing that stops it
  becoming a manual for code that is already its own reference.
- **A second agent's file is a pointer file.** `AGENTS.md` (or any other tool's entry point) names
  the authority for each topic and duplicates none of it.

## Facts flow one way, and leave no copy behind

```
DECISIONS  ──answered──▶  SPECS  ──built──▶  IMPL
    │                       │                  │
 deleted                deleted            stays put
```

- **An answered question moves into the owning spec as a plain fact and is deleted from the
  decisions record — in the same edit.** Moving without deleting is exactly what makes two docs
  disagree three months later, so the deletion is part of the change, not a tidy-up afterwards.
- **An implementation detail that lands in an `IMPL` doc is deleted from the spec**, which keeps only
  the contract.
- **Say it once.** A fact lives in exactly one place; every other mention is a reference to that
  section. A project pattern is documented once, not repeated across docs.
- **Don't restate one doc in another.** Reference the section.

## Docs state facts, not history

- **No changelogs, no negotiation records, no "B instead of A because you asked".** A decision
  becomes a plain statement of fact, and the deliberation behind it is deleted unless it explains the
  architecture. Add an "Alternatives" section only when asked.
- **The one exception is measurement.** Record a rejected option's numbers beside the chosen one,
  **with the hardware and the versions**, so a settled experiment is never re-run. Give those a
  single home.
- **If a fact wouldn't stop a future mistake, leave it out. If the code already says it, leave it
  out.** Don't add an entry per edit.
- **Architecture only** — structure, contracts and decisions, not the implementation detail of code
  that already exists.
- **Be brief and direct.** No hedging, no restating, no padding.

## A decision changes the docs in the same turn it is made

Not at the end of the phase, not once the code lands: **a decision that exists only in a
conversation is lost.**

- The resulting fact goes to the doc that owns it, the question it answers is deleted from the
  decisions record, and **anything now contradicted is corrected rather than left to drift** —
  including `CLAUDE.md` itself when a doc is added, a contract renamed or a guardrail changed.
- **Coin a word, add its glossary row in the same turn.**
- **Specs ↔ code lockstep is mandatory.** A code change that touches specified behaviour updates the
  spec in the same change, and a spec change is propagated into the code. One without the other is
  an incomplete change.

## Ask, don't decide

**Any design or architectural decision is the user's** — present options with a recommendation
rather than picking one, stop and ask when two instructions contradict, and never adopt a default to
keep moving. Blocking open questions stop the phase. Full rules: `agent-workflow` → Ask on any
important decision.

What belongs here is the other half: **the answer is written down in the same turn it is given** —
into the doc that owns it, with the question deleted from the decisions record and anything now
contradicted corrected.

## Phases

- **Tick a finished phase with `✅`** on its heading.
- **`☑️` is a phase that landed with something outstanding**, and the outstanding part gets its own
  sub-heading naming what it is and what blocks it. The phase list then shows at a glance what is
  whole and what is not, instead of burying a caveat in a paragraph. It becomes `✅` when the
  sub-step is done *and* its heading is deleted.
- **Where a phase has a companion artefact** — a published architecture page, a diagram, a
  dashboard — republish it **in the same turn as the tick**, to the same URL, redrawing what changed
  rather than appending. It holds no facts of its own; the specs win any disagreement.

## Keep the index small

- **`CLAUDE.md` is a high-level index, not a manual.** A section that grows past a short list has
  outgrown it: extract it into its own doc and leave a one-line pointer.
- The same applies inside `specs/` — a spec that has become two audiences is two docs.

## Porting a spec between repos

- **Name the upstream file and keep the port in sync.**
- **Mark every deliberate difference `[diverges]`, and never "fix" one back.** Say what diverges and
  why, in the port.
- **State what does *not* come across.** Taking a repo's coding style does not mean taking its stack,
  its dependencies or its domain — spell that out at the top, or the next agent will carry one over.
- **A downgrade, exemption or waiver in the upstream config is that repo's debt, not permission.** A
  clean repo re-tightens it.

## Guardrails

Keep a short list of the **invariants the architecture depends on**, stated so that breaking one
reads as drift rather than a shortcut. See `software-design-principles` → Guardrails for how to
write them.
