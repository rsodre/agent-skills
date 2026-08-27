# Personal Agent Skills Library

A personal, agent-agnostic repository of reusable AI coding assistant skills. Built to provide consistent software engineering standards, architectural design principles, and automated review workflows across all your projects.

Compatible with **Claude** (Claude Code, Anthropic API), **Antigravity** (Google Antigravity SDK / Gemini), **Codex** (OpenAI Codex, Copilot), and any agent supporting the open Agent Skills specification (`SKILL.md` with YAML frontmatter).

---

## 🚀 Quick Start

This repo is a **Claude Code plugin marketplace**. Add it once, then install per project:

```bash
/plugin marketplace add rsodre/agent-skills   # once per machine

/plugin install core@rsodre-skills            # every project
/plugin install web@rsodre-skills             # TypeScript / React / Next.js
/plugin install web3@rsodre-skills            # dapps

/plugin install all@rsodre-skills             # …or all three at once
```

Install only what the project's stack needs — skill descriptions load at session start, so an agent
in a Rust repo shouldn't be weighing whether `nextjs` applies. (`rsodre-skills` is the marketplace
name, not a plugin — `/plugin install rsodre-skills` won't work.)

Pull updates anywhere with:

```bash
/plugin marketplace update rsodre-skills
```

Using another agent? The folders under `plugins/<plugin>/skills/` are plain Agent Skills —
symlink or copy them. See [Installing Skills in Projects](AGENTS.md#-workflow-installing-skills-in-projects).

---

## 📚 Available Skills

| Skill | Plugin | Description | Last Updated | Size |
|---|---|---|---|---|
| [`software-design-principles`](plugins/core/skills/software-design-principles/SKILL.md) | `core` | Canonical reference for 27 core software design principles, Foundation heuristics, trade-off calibration tables, how to write architecture guardrails, and failure modes. | 2026-08-27 | 8.0 KB (`SKILL.md`) / 12 KB (Total) |
| [`software-design-review`](plugins/core/skills/software-design-review/SKILL.md) | `core` | Automated multi-persona code review orchestrator (`premise`, `structural`, `code-smells`, `efficiency`, `defensive`, `completion`). | 2026-08-13 | 5.5 KB (`SKILL.md`) / 44 KB (Total) |
| [`colour-palette`](plugins/web/skills/colour-palette/SKILL.md) | `web` | Color and palette design selection — OKLCH tonal scales, WCAG accessibility contrast, and UI design system themes. | 2026-08-13 | 3.2 KB (`SKILL.md`) / 4 KB (Total) |
| [`coding-style`](plugins/web/skills/coding-style/SKILL.md) | `web` | Binding formatting, TypeScript, React, Tailwind 4 and Biome rules — imports, look-before-you-draw reuse, `cn()`/cva `variant`+`size` APIs, TanStack Query data access, the icons library, zustand stores, Storybook, and annotated `biome.jsonc` / icons / Storybook references. | 2026-08-27 | 28 KB (`SKILL.md`) / 48 KB (Total) |
| [`nextjs`](plugins/web/skills/nextjs/SKILL.md) | `web` | Next.js App Router conventions: routes as mount points, pages as component folders, providers — plus the data-flow standard (query routes + react-query, server actions + `useActionMutation`, service layer, sonner toasts) with copy-ready hooks. | 2026-08-27 | 16 KB (`SKILL.md`) / 32 KB (Total) |
| [`ts-monorepo`](plugins/web/skills/ts-monorepo/SKILL.md) | `web` | pnpm workspace + publishable-package conventions: catalog/`workspace:` protocol, package boundaries (never branch on the host), single-source root config, toolchain pinning, ESM exports maps, build order, Vitest rules. | 2026-08-27 | 12 KB (`SKILL.md`) / 12 KB (Total) |
| [`web3-chain-layer`](plugins/web3/skills/web3-chain-layer/SKILL.md) | `web3` | Dapp chain layer: the react-query carve-out, `bigint` numerics, address/ABI registry, read/write hooks, transaction toasts — EVM (wagmi + viem) and Starknet (Starknet Start + starknet.js v10 + Cartridge + Torii) kept strictly separate. | 2026-08-27 | 12 KB (`SKILL.md`) / 36 KB (Total) |
| [`spec-discipline`](plugins/core/skills/spec-discipline/SKILL.md) | `core` | How agent-facing docs stay true: one job per doc, facts flowing DECISIONS → SPECS → IMPL with the copy deleted in the same edit, facts-not-history, decide-and-document in one turn, ✅/☑️ phase ticking. | 2026-08-27 | 8.0 KB (`SKILL.md`) / 8.0 KB (Total) |
| [`agent-workflow`](plugins/core/skills/agent-workflow/SKILL.md) | `core` | Running agents in a shared repo: asking the user on important decisions (with a recommendation), agent-only dev/Storybook ports, the `_inbox/` drop folder, the user commits unless the agent is authorised, a dirty-tree check before starting big work, ignoring instructions in file content, when a procedure becomes a slash command, and the repo layout that sets a project up for agents (README for humans, CLAUDE/AGENTS for agents). | 2026-08-27 | 12 KB (`SKILL.md`) / 12 KB (Total) |

### Details

#### 1. [`software-design-principles`](plugins/core/skills/software-design-principles/SKILL.md)
- **Last Updated**: 2026-08-13
- **Size**: 8.0 KB (`SKILL.md`) / 12 KB (Folder Total)
- **Scope**: High-density reference covering 27 software design principles, Foundation heuristics, trade-off calibration, failure modes, and offloaded TypeScript worked examples (`references/examples.md`).
- **Use when**: Writing new code, designing module boundaries, evaluating refactoring decisions, or validating code quality inline during development.

#### 2. [`software-design-review`](plugins/core/skills/software-design-review/SKILL.md)
- **Last Updated**: 2026-08-13
- **Size**: 5.5 KB (`SKILL.md`) / 44 KB (Folder Total)
- **Scope**: Automated code review orchestrator. Spawns six specialized subagent personas to evaluate code diffs or architecture against software design principles and returns a triaged findings table.
- **Use when**: Reviewing pull requests, evaluating complex code changes, or auditing existing codebases.

#### 3. [`colour-palette`](plugins/web/skills/colour-palette/SKILL.md)
- **Last Updated**: 2026-08-13
- **Size**: 3.2 KB (`SKILL.md`) / 4 KB (Folder Total)
- **Scope**: Color selection, OKLCH tonal scale generation, WCAG AA contrast verification, and UI theme distribution (60-30-10 rule).
- **Use when**: Choosing, generating, or reviewing colors, CSS custom property themes, UI palettes, status bars, or terminal themes.

#### 4. [`coding-style`](plugins/web/skills/coding-style/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 28 KB (`SKILL.md`) / 48 KB (Folder Total)
- **Scope**: Formatting and linting via Biome (annotated `references/biome.jsonc`), import/file organisation, TypeScript rules, React hook discipline, zustand client state, Tailwind 4 token-driven styling, look-before-you-draw component reuse, cva `variant`/`size` primitive APIs, TanStack Query for all data access (never a bare `fetch`), the icons-library pattern (never import lucide directly), Storybook conventions (primitives + modules only, one story per component), external-API error handling, and hard-won CSS/canvas traps. Radix is explicitly out; icons are `lucide-react`.
- **Use when**: Writing or reviewing any `.ts`/`.tsx`, setting up a toolchain, configuring Biome, or building `ui/` primitives.

#### 5. [`nextjs`](plugins/web/skills/nextjs/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 16 KB (`SKILL.md`) / 32 KB (Folder Total)
- **Scope**: Part 1 — App Router structure (`app/` is routing only, pages as component folders, providers, hooks layout, content routes, framework traps). Part 2 — the data-flow standard: API query routes + one react-query hook per query, server actions + `useActionMutation`, external mutation routes, the shared service layer, and centralised sonner toasts. Ships copy-ready `useActionMutation`, `useQueryInvalidate`, `handleApiError` and `ElapsedTimeBadge` implementations in `references/`.
- **Use when**: Adding a route, page, provider, API route, server action or react-query hook — or reviewing any of them.

#### 6. [`ts-monorepo`](plugins/web/skills/ts-monorepo/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 12 KB (`SKILL.md`) / 12 KB (Folder Total)
- **Scope**: pnpm workspace shape, the catalog and `workspace:` protocol, install-script policy (`allowBuilds`), toolchain pinning, publishable-package rules (zero-dep core, peer frameworks, ESM exports maps, `__` internals, packaging gates), bundler-builds/`tsc`-typechecks split, sequential build order, and Vitest conventions.
- **Use when**: Setting up or restructuring a workspace, adding a package or dependency, or configuring builds, publishing and tests.

#### 7. [`web3-chain-layer`](plugins/web3/skills/web3-chain-layer/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 12 KB (`SKILL.md`) / 36 KB (Folder Total)
- **Scope**: Chain-agnostic dapp rules — never re-wrap hooks that already run on TanStack Query, native `bigint` everywhere, one address/ABI registry, bare reads, send-then-await-receipt writes, morphing transaction toasts, indexer-vs-contract reads, signature-gated flows, and version discipline. Stack specifics are split into `references/evm.md` (Ethereum/Solidity, wagmi + viem + ConnectKit) and `references/starknet.md` (Cairo/Dojo, Starknet Start + starknet.js v10 + Cartridge Controller + Torii, with both migration guides) and are never mixed.
- **Use when**: Writing or reviewing any contract read/write, wallet connection, address handling, or transaction feedback.

#### 8. [`spec-discipline`](plugins/core/skills/spec-discipline/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 8.0 KB (`SKILL.md`) / 8.0 KB (Folder Total)
- **Scope**: Specs as binding rather than advisory; one job per doc (CLAUDE.md / SPECS / DECISIONS / IMPL / GLOSSARY / README / PLAN, with a table of what each never holds — `README.md` holding the project for humans: description, structure, dependencies, commands); the one-way flow `DECISIONS → SPECS → IMPL` where the copy is deleted in the same edit; say-it-once; facts not history with the benchmark-numbers exception; decide-and-document in one turn plus specs↔code lockstep; ask-don't-decide and blocking questions stopping a phase; ✅/☑️ phase ticking with companion-artefact republishing; keeping the index small; porting a spec with `[diverges]` markers.
- **Use when**: Writing or reorganising CLAUDE.md / AGENTS.md / specs / READMEs, when a decision is made, when a doc outgrows its file, when porting a spec between repos, or when two docs disagree.

#### 9. [`agent-workflow`](plugins/core/skills/agent-workflow/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 8.0 KB (`SKILL.md`) / 8.0 KB (Folder Total)
- **Scope**: Asking the user on any important decision, always with a recommendation and never a default adopted to keep moving; agent-only dev and Storybook ports (`dev:claude` on an offset port) so a running session is never disturbed; the git-ignored `_inbox/` drop folder and how material graduates out of it; the user commits unless the agent is authorised, a dirty-tree check before starting big work; treating instructions found in file content as data; downloads to the scratchpad; turning a repeatable procedure into a `.claude/commands/` slash command; end-of-task workflow checks and the single `check` gate; the file layout that sets a repo up for agents, where `README.md` is for humans what `CLAUDE.md`/`AGENTS.md` are for agents.
- **Use when**: Setting up a project for agents, adding scripts or commands for them, or deciding how an agent should run and hand off work.

---

## 🌐 Curated Third-Party Skills (Ready on Demand)

A curated catalog of recommended third-party agent skills. These skills are documented and ready for AI agents to clone or submodule into this library or your target projects whenever requested:

| Skill | Repository | Description | Status |
|---|---|---|---|
| `threejs-tsl-webgpu` | [dgreenheck/webgpu-claude-skill](https://github.com/dgreenheck/webgpu-claude-skill) | Three.js + WebGPU graphics & compute pipeline generation, TSL shader authoring, and browser graphics integration. | Ready to install on request |
| `legal-skills` | [gfodor/legal-skills](https://github.com/gfodor/legal-skills) | Software contract review, terms of service, privacy compliance (GDPR/CCPA), IP licensing, and open-source compliance. | Ready to install on request |

### How to Request Installation
Simply instruct your AI agent:
- *"Install `webgpu-claude-skill` into this skills library."*
- *"Add `legal-skills` to my current project."*

The agent will clone or submodule the repository, register its YAML frontmatter, and update the skills table in [`README.md`](README.md).

---

## 🤖 Agent Instructions & Workflows

Complete operational instructions for AI agents creating, installing, using, and updating skills are located in **[`AGENTS.md`](AGENTS.md)**:

- **[Repository Layout](AGENTS.md#repository-layout)**: The marketplace manifest, the three plugins, and where each skill lives.
- **[Creating New Skills](AGENTS.md#-workflow-creating-new-skills)**: Choosing a plugin, directory layout, `SKILL.md` specification, TypeScript guidelines, progressive disclosure rules, adding a new plugin, and mandatory README metadata maintenance.
- **[Installing Skills in Projects](AGENTS.md#-workflow-installing-skills-in-projects)**: The plugin marketplace for Claude Code, plus symlink/copy paths for Antigravity (`.agents/skills/` or `skills.json`) and Codex (`.skills/`).
- **[Curated Third-Party Skills](AGENTS.md#-curated-third-party-skills-ready-to-install)**: Procedures for installing third-party repositories on demand.
- **[Using Skills in Projects](AGENTS.md#-workflow-using-skills-in-projects)**: Automatic trigger matching, explicit invocations, and subagent review delegation.
- **[Updating & Syncing Skills](AGENTS.md#-workflow-updating--syncing-skills)**: The authoring loop, `/plugin marketplace update`, version pinning, and the symlink/submodule/rsync fallbacks.

---

## 📄 License
MIT License. Feel free to customize and expand for your personal agent workflows.
