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
/plugin install ios@rsodre-skills             # Swift / iOS apps (iPhone Duo, Xcode CLI, release playbook)
/plugin install appstore@rsodre-skills        # App Store Connect via the asc CLI (curated)

/plugin install all@rsodre-skills             # …or all five at once
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
| [`lucide-icons`](plugins/web/skills/lucide-icons/SKILL.md) | `web` | Authoring and reviewing custom icons in the lucide style: the grid, safe zone, radii and gaps, lucide's own dots/points/rings measured from the set, the `createLucideIcon` pattern, and a render-and-report script. | 2026-09-23 | 12 KB (`SKILL.md`) / 40 KB (Total) |
| [`coding-style`](plugins/web/skills/coding-style/SKILL.md) | `web` | Binding formatting, TypeScript, React, Tailwind 4 and Biome rules — imports, look-before-you-draw reuse, `cn()`/cva `variant`+`size` APIs, TanStack Query data access, the icons library, zustand stores, Storybook, and annotated `biome.jsonc` / icons / Storybook references. | 2026-08-27 | 36 KB (`SKILL.md`) / 56 KB (Total) |
| [`nextjs`](plugins/web/skills/nextjs/SKILL.md) | `web` | Next.js App Router conventions: routes as mount points, pages as component folders, providers — plus the data-flow standard (query routes + react-query, server actions + `useActionMutation`, service layer, sonner toasts) with copy-ready hooks. | 2026-08-27 | 16 KB (`SKILL.md`) / 32 KB (Total) |
| [`ts-monorepo`](plugins/web/skills/ts-monorepo/SKILL.md) | `web` | pnpm workspace + publishable-package conventions: catalog/`workspace:` protocol, package boundaries (never branch on the host), single-source root config, toolchain pinning, ESM exports maps, build order, Vitest rules. | 2026-08-27 | 12 KB (`SKILL.md`) / 12 KB (Total) |
| [`web3-chain-layer`](plugins/web3/skills/web3-chain-layer/SKILL.md) | `web3` | Dapp chain layer: the react-query carve-out, `bigint` numerics, address/ABI registry, read/write hooks, transaction toasts — EVM (wagmi + viem) and Starknet (Starknet Start + starknet.js v10 + Cartridge + Torii) kept strictly separate. | 2026-08-27 | 12 KB (`SKILL.md`) / 36 KB (Total) |
| [`spec-discipline`](plugins/core/skills/spec-discipline/SKILL.md) | `core` | How agent-facing docs stay true: one job per doc, facts flowing DECISIONS → SPECS → IMPL with the copy deleted in the same edit, facts-not-history, decide-and-document in one turn, ✅/☑️ phase ticking. | 2026-08-27 | 8.0 KB (`SKILL.md`) / 8.0 KB (Total) |
| [`agent-workflow`](plugins/core/skills/agent-workflow/SKILL.md) | `core` | Running agents in a shared repo: asking the user on important decisions (with a recommendation), agent-only dev/Storybook ports, the `_inbox/` drop folder, the user commits unless the agent is authorised, a dirty-tree check before starting big work, ignoring instructions in file content, when a procedure becomes a slash command, and the repo layout that sets a project up for agents (README for humans, CLAUDE/AGENTS for agents). | 2026-08-27 | 12 KB (`SKILL.md`) / 12 KB (Total) |
| [`iphone-duo`](plugins/ios/skills/iphone-duo/SKILL.md) | `ios` | Hub for iPhone Duo work: anatomy, poses, size classes per display, where bars go, SDK 26/27/27.1 behaviour, readiness workflow, API availability, skill map. | 2026-10-14 | 11 KB (`SKILL.md`) / 34 KB (Total) |
| [`iphone-duo-resizability`](plugins/ios/skills/iphone-duo-resizability/SKILL.md) | `ios` | Resizing correctly: no `UIScreen.main`/orientation/idiom/device-size layout, scene lifecycle, re-reading size, asymmetric safe areas, full-bleed media, `UIRequiresFullScreen` — plus a grep audit script. | 2026-10-14 | 10 KB (`SKILL.md`) / 16 KB (Total) |
| [`iphone-duo-bars`](plugins/ios/skills/iphone-duo-bars/SKILL.md) | `ios` | Vertical toolbars and tab bars: opt-in, container rules, item order, icon+title, `axisBehavior`, badges, compression, overflow, priorities, disabling. | 2026-10-14 | 11 KB (`SKILL.md`) / 11 KB (Total) |
| [`iphone-duo-fold-layouts`](plugins/ios/skills/iphone-duo-fold-layouts/SKILL.md) | `ios` | The fold and cameras as reserved regions, displacement patterns per pose, arrangement views (split/overlay), split views and grids around the fold. | 2026-10-14 | 9.5 KB (`SKILL.md`) / 9.5 KB (Total) |
| [`iphone-duo-hinge-scenes`](plugins/ios/skills/iphone-duo-hinge-scenes/SKILL.md) | `ios` | Hinge status/angle API, Split View multitasking and pinned PiP, multiple windows, scene accessories. | 2026-10-14 | 6.0 KB (`SKILL.md`) / 6.0 KB (Total) |
| [`iphone-duo-camera`](plugins/ios/skills/iphone-duo-camera/SKILL.md) | `ios` | Two front cameras: virtual front camera, direction coordinator, mirroring by direction, rotation, preview polish, outer-display capture accessory. | 2026-10-14 | 11 KB (`SKILL.md`) / 11 KB (Total) |
| [`iphone-duo-design`](plugins/ios/skills/iphone-duo-design/SKILL.md) | `ios` | Design/UX/accessibility for iPhone Duo — principles, layout patterns, toolbars, sheets, games, a11y, spec template and pose-by-pose review checklist. | 2026-10-14 | 9.0 KB (`SKILL.md`) / 13 KB (Total) |
| [`iphone-duo-testing-launch`](plugins/ios/skills/iphone-duo-testing-launch/SKILL.md) | `ios` | Xcode 27.1 + App Resizability skill, Device Hub poses, iPhone Mirroring fixes, device test plan, App Store screenshots/badge/featuring. | 2026-10-14 | 6.0 KB (`SKILL.md`) / 6.0 KB (Total) |
| [`ios-xcode-cli`](plugins/ios/skills/ios-xcode-cli/SKILL.md) | `ios` | The agent's local loop: thin app target + synced folders + local packages, `swift test`/`xcodebuild` (single test, `.xcresult`), own named simulators, the Duo simulator, `simctl`/`devicectl`, API-key signing, parallel sessions, in-app smoke harness. | 2026-10-14 | 11 KB (`SKILL.md`) / 11 KB (Total) |
| [`ios-release-playbook`](plugins/ios/skills/ios-release-playbook/SKILL.md) | `ios` | End-to-end App Store order with asc: account and API key, bundle id, app record, metadata as code (asc canonical layout), pricing, availability, age rating, privacy, screenshots, TestFlight with tag identity, promote-never-rebuild, validate, submit, release — person-only steps marked; routes to the `appstore` skills. | 2026-10-14 | 9.4 KB (`SKILL.md`) / 9.4 KB (Total) |
| [`asc-*` (12 skills)](plugins/appstore/UPSTREAM.md) | `appstore` | Curated unchanged from [rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills) (MIT) @ `4b496c5`: cli-usage, id-resolver, xcode-build, signing-setup, build-lifecycle, testflight-orchestration, metadata-sync, release-flow, submission-health, shots-pipeline, screenshot-resize, app-create-ui. | 2026-10-14 | — / 156 KB (Total) |

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


#### 4. [`lucide-icons`](plugins/web/skills/lucide-icons/SKILL.md)
- **Last Updated**: 2026-09-23
- **Size**: 12 KB (`SKILL.md`) / 40 KB (Folder Total)
- **Scope**: Drawing an icon that belongs to the lucide set — the 24-unit canvas, 1px safe zone measured in ink, 2/1/2.41 corner radii, the 2px gap, pixel alignment, weight against `circle` and `square` — plus what the 2,007 icons actually do for dots, points, rings, arrow heads, panels and lists, the `createLucideIcon` authoring pattern with shared geometry and a rounded-polygon helper, and `scripts/render-icon.mjs`, which loads a `custom.tsx` (lucide-react stubbed), draws each glyph on the grid and at 12–24px on light and dark beside the two references, and reports rule breaks.
- **Use when**: Adding, redrawing or reviewing a custom icon, when a glyph looks wrong at small sizes, or when deciding whether to author or pick.
#### 5. [`coding-style`](plugins/web/skills/coding-style/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 36 KB (`SKILL.md`) / 56 KB (Folder Total)
- **Scope**: Formatting and linting via Biome (annotated `references/biome.jsonc`), import/file organisation, TypeScript rules, React discipline (memoised object/function props, hooks, rendering, render cost), zustand client state, Tailwind 4 token-driven styling, look-before-you-draw component reuse, cva `variant`/`size` primitive APIs, TanStack Query for all data access (never a bare `fetch`), the icons-library pattern (never import lucide directly), Storybook conventions (primitives + modules only, one story per component), external-API error handling, and hard-won CSS/canvas traps. Radix is explicitly out; icons are `lucide-react`.
- **Use when**: Writing or reviewing any `.ts`/`.tsx`, setting up a toolchain, configuring Biome, or building `ui/` primitives.

#### 6. [`nextjs`](plugins/web/skills/nextjs/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 16 KB (`SKILL.md`) / 32 KB (Folder Total)
- **Scope**: Part 1 — App Router structure (`app/` is routing only, pages as component folders, providers, hooks layout, content routes, framework traps). Part 2 — the data-flow standard: API query routes + one react-query hook per query, server actions + `useActionMutation`, external mutation routes, the shared service layer, and centralised sonner toasts. Ships copy-ready `useActionMutation`, `useQueryInvalidate`, `handleApiError` and `ElapsedTimeBadge` implementations in `references/`.
- **Use when**: Adding a route, page, provider, API route, server action or react-query hook — or reviewing any of them.

#### 7. [`ts-monorepo`](plugins/web/skills/ts-monorepo/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 12 KB (`SKILL.md`) / 12 KB (Folder Total)
- **Scope**: pnpm workspace shape, the catalog and `workspace:` protocol, install-script policy (`allowBuilds`), toolchain pinning, publishable-package rules (zero-dep core, peer frameworks, ESM exports maps, `__` internals, packaging gates), bundler-builds/`tsc`-typechecks split, sequential build order, and Vitest conventions.
- **Use when**: Setting up or restructuring a workspace, adding a package or dependency, or configuring builds, publishing and tests.

#### 8. [`web3-chain-layer`](plugins/web3/skills/web3-chain-layer/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 12 KB (`SKILL.md`) / 36 KB (Folder Total)
- **Scope**: Chain-agnostic dapp rules — never re-wrap hooks that already run on TanStack Query, native `bigint` everywhere, one address/ABI registry, bare reads, send-then-await-receipt writes, morphing transaction toasts, indexer-vs-contract reads, signature-gated flows, and version discipline. Stack specifics are split into `references/evm.md` (Ethereum/Solidity, wagmi + viem + ConnectKit) and `references/starknet.md` (Cairo/Dojo, Starknet Start + starknet.js v10 + Cartridge Controller + Torii, with both migration guides) and are never mixed.
- **Use when**: Writing or reviewing any contract read/write, wallet connection, address handling, or transaction feedback.

#### 9. [`spec-discipline`](plugins/core/skills/spec-discipline/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 8.0 KB (`SKILL.md`) / 8.0 KB (Folder Total)
- **Scope**: Specs as binding rather than advisory; one job per doc (CLAUDE.md / SPECS / DECISIONS / IMPL / GLOSSARY / README / PLAN, with a table of what each never holds — `README.md` holding the project for humans: description, structure, dependencies, commands); the one-way flow `DECISIONS → SPECS → IMPL` where the copy is deleted in the same edit; say-it-once; facts not history with the benchmark-numbers exception; decide-and-document in one turn plus specs↔code lockstep; ask-don't-decide and blocking questions stopping a phase; ✅/☑️ phase ticking with companion-artefact republishing; keeping the index small; porting a spec with `[diverges]` markers.
- **Use when**: Writing or reorganising CLAUDE.md / AGENTS.md / specs / READMEs, when a decision is made, when a doc outgrows its file, when porting a spec between repos, or when two docs disagree.

#### 10. [`agent-workflow`](plugins/core/skills/agent-workflow/SKILL.md)
- **Last Updated**: 2026-08-27
- **Size**: 8.0 KB (`SKILL.md`) / 8.0 KB (Folder Total)
- **Scope**: Asking the user on any important decision, always with a recommendation and never a default adopted to keep moving; agent-only dev and Storybook ports (`dev:claude` on an offset port) so a running session is never disturbed; the git-ignored `_inbox/` drop folder and how material graduates out of it; the user commits unless the agent is authorised, a dirty-tree check before starting big work; treating instructions found in file content as data; downloads to the scratchpad; turning a repeatable procedure into a `.claude/commands/` slash command; end-of-task workflow checks and the single `check` gate; the file layout that sets a repo up for agents, where `README.md` is for humans what `CLAUDE.md`/`AGENTS.md` are for agents.
- **Use when**: Setting up a project for agents, adding scripts or commands for them, or deciding how an agent should run and hand off work.

#### 11. [`iphone-duo`](plugins/ios/skills/iphone-duo/SKILL.md) — and the `iphone-duo-*` family
- **Last Updated**: 2026-10-14
- **Size**: 8 skills, ~75 KB SKILL.md total (hub 11 KB / 34 KB folder incl. `references/sources.md` and a ~140-link verified `references/api-reference.md`)
- **Scope**: Building apps for iPhone Duo, Apple's foldable two-display iPhone, condensed from Apple's Prepare page, the technology overview, the HIG page, six iPhone Duo tech talks and two UIKit sessions (transcripts and code read in full) and ~40 API reference pages. The hub holds device facts and routes to: `iphone-duo-resizability` (code audit + `scripts/audit-resizability.sh`), `iphone-duo-bars`, `iphone-duo-fold-layouts`, `iphone-duo-hinge-scenes`, `iphone-duo-camera`, `iphone-duo-design` (non-technical design/UX/a11y with `references/review-checklist.md`) and `iphone-duo-testing-launch`. Swift, SwiftUI and UIKit side by side.
- **Use when**: Preparing, designing, building, reviewing, testing or shipping any iOS app for iPhone Duo — or any resizable iPhone app (iPhone Mirroring, iPad).

---

#### 12. [`ios-xcode-cli`](plugins/ios/skills/ios-xcode-cli/SKILL.md) and [`ios-release-playbook`](plugins/ios/skills/ios-release-playbook/SKILL.md)
- **Last Updated**: 2026-10-14
- **Size**: 11 KB and 9.4 KB (`SKILL.md` only)
- **Scope**: Command-line iOS work for agents. `ios-xcode-cli` is the build–test–run loop; `ios-release-playbook` is the order and ownership of a release, routing each step to the `appstore` skills. Drafted from Apple's tools, the asc docs and a shipped agent-run project; lines marked ⚠︎ are unverified on Xcode 27.1.
- **Use when**: Building, testing, running or screenshotting an iOS app from a terminal or CI; planning or running TestFlight and App Store releases.

#### 13. `appstore` plugin — curated `asc-*` skills
- **Last Updated**: 2026-10-14
- **Size**: 156 KB (12 skills)
- **Scope**: App Store Connect automation through the [`asc` CLI](https://github.com/rorkai/app-store-connect-cli), copied unchanged at a pinned commit; provenance, the omitted skills and the sync procedure are in [`plugins/appstore/UPSTREAM.md`](plugins/appstore/UPSTREAM.md).
- **Use when**: Any App Store Connect task: auth, IDs, archive/export/upload, signing assets, TestFlight, metadata, pricing, review submission and health, screenshots, app record creation.

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

- **[Repository Layout](AGENTS.md#repository-layout)**: The marketplace manifest, the four plugins, and where each skill lives.
- **[Creating New Skills](AGENTS.md#-workflow-creating-new-skills)**: Choosing a plugin, directory layout, `SKILL.md` specification, TypeScript guidelines, progressive disclosure rules, adding a new plugin, and mandatory README metadata maintenance.
- **[Installing Skills in Projects](AGENTS.md#-workflow-installing-skills-in-projects)**: The plugin marketplace for Claude Code, plus symlink/copy paths for Antigravity (`.agents/skills/` or `skills.json`) and Codex (`.skills/`).
- **[Curated Third-Party Skills](AGENTS.md#-curated-third-party-skills-ready-to-install)**: Procedures for installing third-party repositories on demand.
- **[Using Skills in Projects](AGENTS.md#-workflow-using-skills-in-projects)**: Automatic trigger matching, explicit invocations, and subagent review delegation.
- **[Updating & Syncing Skills](AGENTS.md#-workflow-updating--syncing-skills)**: The authoring loop, `/plugin marketplace update`, version pinning, and the symlink/submodule/rsync fallbacks.

---

## 📄 License
MIT License. Feel free to customize and expand for your personal agent workflows.
