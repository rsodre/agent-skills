# Personal Agent Skills Library

A personal, agent-agnostic repository of reusable AI coding assistant skills. Built to provide consistent software engineering standards, architectural design principles, and automated review workflows across all your projects.

Compatible with **Claude** (Claude Code, Anthropic API), **Antigravity** (Google Antigravity SDK / Gemini), **Codex** (OpenAI Codex, Copilot), and any agent supporting the open Agent Skills specification (`SKILL.md` with YAML frontmatter).

---

## 📚 Available Skills

| Skill | Description | Last Updated | Size |
|---|---|---|---|
| [`software-design-principles`](software-design-principles/SKILL.md) | Canonical reference for 27 core software design principles, Foundation heuristics, trade-off calibration tables, and failure modes. | 2026-08-13 | 5.9 KB (`SKILL.md`) / 12 KB (Total) |
| [`software-design-review`](software-design-review/SKILL.md) | Automated multi-persona code review orchestrator (`premise`, `structural`, `code-smells`, `efficiency`, `defensive`, `completion`). | 2026-08-13 | 5.5 KB (`SKILL.md`) / 44 KB (Total) |
| [`colour-palette`](colour-palette/SKILL.md) | Color and palette design selection — OKLCH tonal scales, WCAG accessibility contrast, and UI design system themes. | 2026-08-13 | 3.2 KB (`SKILL.md`) / 4 KB (Total) |
| [`coding-style`](coding-style/SKILL.md) | Binding formatting, TypeScript, React, Tailwind 4 and Biome rules — imports, `cn()`/cva `variant`+`size` APIs, TanStack Query data access, the icons library, zustand stores, Storybook, and annotated `biome.jsonc` / icons / Storybook references. | 2026-08-27 | 24 KB (`SKILL.md`) / 44 KB (Total) |
| [`nextjs`](nextjs/SKILL.md) | Next.js App Router conventions: routes as mount points, pages as component folders, providers — plus the data-flow standard (query routes + react-query, server actions + `useActionMutation`, service layer, sonner toasts) with copy-ready hooks. | 2026-08-27 | 16 KB (`SKILL.md`) / 32 KB (Total) |
| [`ts-monorepo`](ts-monorepo/SKILL.md) | pnpm workspace + publishable-package conventions: catalog/`workspace:` protocol, single-source root config, toolchain pinning, ESM exports maps, build order, Vitest rules. | 2026-08-27 | 8 KB (`SKILL.md`) / 8 KB (Total) |
| [`web3-chain-layer`](web3-chain-layer/SKILL.md) | Dapp chain layer: the react-query carve-out, `bigint` numerics, address/ABI registry, read/write hooks, transaction toasts — EVM (wagmi + viem) and Starknet (Starknet Start + starknet.js v10 + Cartridge + Torii) kept strictly separate. | 2026-08-27 | 12 KB (`SKILL.md`) / 36 KB (Total) |

### Details

#### 1. [`software-design-principles`](software-design-principles/SKILL.md)
- **Last Updated**: 2026-08-13
- **Size**: 5.9 KB (`SKILL.md`) / 12 KB (Folder Total)
- **Scope**: High-density reference covering 27 software design principles, Foundation heuristics, trade-off calibration, failure modes, and offloaded TypeScript worked examples (`references/examples.md`).
- **Use when**: Writing new code, designing module boundaries, evaluating refactoring decisions, or validating code quality inline during development.

#### 2. [`software-design-review`](software-design-review/SKILL.md)
- **Last Updated**: 2026-08-13
- **Size**: 5.5 KB (`SKILL.md`) / 44 KB (Folder Total)
- **Scope**: Automated code review orchestrator. Spawns six specialized subagent personas to evaluate code diffs or architecture against software design principles and returns a triaged findings table.
- **Use when**: Reviewing pull requests, evaluating complex code changes, or auditing existing codebases.

#### 3. [`colour-palette`](colour-palette/SKILL.md)
- **Last Updated**: 2026-08-13
- **Size**: 3.2 KB (`SKILL.md`) / 4 KB (Folder Total)
- **Scope**: Color selection, OKLCH tonal scale generation, WCAG AA contrast verification, and UI theme distribution (60-30-10 rule).
- **Use when**: Choosing, generating, or reviewing colors, CSS custom property themes, UI palettes, status bars, or terminal themes.

#### 4. [`coding-style`](coding-style/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 24 KB (`SKILL.md`) / 44 KB (Folder Total)
- **Scope**: Formatting and linting via Biome (annotated `references/biome.jsonc`), import/file organisation, TypeScript rules, React hook discipline, zustand client state, Tailwind 4 token-driven styling, cva `variant`/`size` primitive APIs, TanStack Query for all data access (never a bare `fetch`), the icons-library pattern (never import lucide directly), Storybook conventions (primitives + modules only, one story per component), external-API error handling, and hard-won CSS/canvas traps. Radix is explicitly out; icons are `lucide-react`.
- **Use when**: Writing or reviewing any `.ts`/`.tsx`, setting up a toolchain, configuring Biome, or building `ui/` primitives.

#### 5. [`nextjs`](nextjs/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 16 KB (`SKILL.md`) / 32 KB (Folder Total)
- **Scope**: Part 1 — App Router structure (`app/` is routing only, pages as component folders, providers, hooks layout, content routes, framework traps). Part 2 — the data-flow standard: API query routes + one react-query hook per query, server actions + `useActionMutation`, external mutation routes, the shared service layer, and centralised sonner toasts. Ships copy-ready `useActionMutation`, `useQueryInvalidate`, `handleApiError` and `ElapsedTimeBadge` implementations in `references/`.
- **Use when**: Adding a route, page, provider, API route, server action or react-query hook — or reviewing any of them.

#### 6. [`ts-monorepo`](ts-monorepo/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 8 KB (`SKILL.md`) / 8 KB (Folder Total)
- **Scope**: pnpm workspace shape, the catalog and `workspace:` protocol, install-script policy (`allowBuilds`), toolchain pinning, publishable-package rules (zero-dep core, peer frameworks, ESM exports maps, `__` internals, packaging gates), bundler-builds/`tsc`-typechecks split, sequential build order, and Vitest conventions.
- **Use when**: Setting up or restructuring a workspace, adding a package or dependency, or configuring builds, publishing and tests.

#### 7. [`web3-chain-layer`](web3-chain-layer/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 12 KB (`SKILL.md`) / 36 KB (Folder Total)
- **Scope**: Chain-agnostic dapp rules — never re-wrap hooks that already run on TanStack Query, native `bigint` everywhere, one address/ABI registry, bare reads, send-then-await-receipt writes, morphing transaction toasts, indexer-vs-contract reads, signature-gated flows, and version discipline. Stack specifics are split into `references/evm.md` (Ethereum/Solidity, wagmi + viem + ConnectKit) and `references/starknet.md` (Cairo/Dojo, Starknet Start + starknet.js v10 + Cartridge Controller + Torii, with both migration guides) and are never mixed.
- **Use when**: Writing or reviewing any contract read/write, wallet connection, address handling, or transaction feedback.

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

- **[Creating New Skills](AGENTS.md#-workflow-creating-new-skills)**: Directory layout, `SKILL.md` specification, TypeScript guidelines, progressive disclosure rules, and mandatory README metadata maintenance.
- **[Installing Skills in Projects](AGENTS.md#-workflow-installing-skills-in-projects)**: Installation paths for Claude (`.claude/skills/`), Antigravity (`.agents/skills/` or `skills.json`), and Codex (`.skills/`).
- **[Curated Third-Party Skills](AGENTS.md#-curated-third-party-skills-ready-to-install)**: Procedures for installing third-party repositories on demand.
- **[Using Skills in Projects](AGENTS.md#-workflow-using-skills-in-projects)**: Automatic trigger matching, explicit invocations, and subagent review delegation.
- **[Updating & Syncing Skills](AGENTS.md#-workflow-updating--syncing-skills)**: Keeping README metadata updated, symlinking, git submodules, and automated sync scripts across projects.

---

## 📄 License
MIT License. Feel free to customize and expand for your personal agent workflows.
