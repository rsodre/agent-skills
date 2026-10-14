# Workspace Customization for AI Agents

This repository serves as a central library for agent skills and an operational reference for creating, installing, using, and updating skills across projects.

## Repository Layout

This repo is a **Claude Code plugin marketplace** (`rsodre-skills`). Skills are grouped into five
plugins so a project installs only what its stack needs:

```text
agent-skills/
├── .claude-plugin/marketplace.json   # marketplace manifest — lists the plugins below
└── plugins/
    ├── all/                          # meta-plugin: depends on the five below, no skills of its own
    │   └── .claude-plugin/plugin.json
    ├── core/                         # stack-agnostic engineering discipline
    │   ├── .claude-plugin/plugin.json
    │   └── skills/{software-design-principles,software-design-review,spec-discipline,agent-workflow}/
    ├── web/                          # TypeScript web stack
    │   ├── .claude-plugin/plugin.json
    │   └── skills/{coding-style,nextjs,colour-palette,lucide-icons,ts-monorepo}/
    ├── web3/
    │   ├── .claude-plugin/plugin.json
    │   └── skills/web3-chain-layer/
    └── ios/                          # Swift (SwiftUI + UIKit) Apple-platform apps
        ├── .claude-plugin/plugin.json
        └── skills/{iphone-duo,iphone-duo-resizability,iphone-duo-bars,iphone-duo-fold-layouts,
                    iphone-duo-hinge-scenes,iphone-duo-camera,iphone-duo-design,iphone-duo-testing-launch,
                    ios-xcode-cli,ios-release-playbook}/
    └── appstore/                     # App Store Connect via the asc CLI — curated upstream, see UPSTREAM.md
        ├── .claude-plugin/plugin.json
        ├── UPSTREAM.md, LICENSE
        └── skills/asc-*/             # 12 skills copied unchanged from rorkai/app-store-connect-cli-skills
```

Every `plugins/<group>/skills/` directory is also a plain Agent Skills directory, so non-Claude
agents can symlink or copy it directly (see [Installing Skills in Projects](#-workflow-installing-skills-in-projects)).

---

## Available Skills

### `core` — stack-agnostic

- [`software-design-principles`](plugins/core/skills/software-design-principles/SKILL.md): Canonical reference for 27 software design principles, Foundation heuristics, calibration tables, agent failure modes, and TypeScript worked examples.
- [`software-design-review`](plugins/core/skills/software-design-review/SKILL.md): Orchestrates multi-persona code reviews against software design principles using specialized subagents (`premise`, `structural`, `code-smells`, `efficiency`, `defensive`, `completion`).
- [`spec-discipline`](plugins/core/skills/spec-discipline/SKILL.md): How agent-facing docs stay true — one job per doc, `DECISIONS → SPECS → IMPL` with the copy deleted in the same edit, facts not history, ✅/☑️ phase ticking.
- [`agent-workflow`](plugins/core/skills/agent-workflow/SKILL.md): Running agents in a shared repo — ask the user on important decisions (always with a recommendation), agent-only ports, `_inbox/`, git rules (the user commits unless authorised; check for uncommitted work before starting), slash commands, the end-of-task gate.

### `web` — TypeScript web stack

- [`coding-style`](plugins/web/skills/coding-style/SKILL.md): Formatting (Biome), TypeScript, React, Tailwind 4 + cva `variant`/`size` APIs, TanStack Query data access, the icons library (lucide behind one registry), zustand stores, and Storybook — with `biome.jsonc`, icons and Storybook references.
- [`nextjs`](plugins/web/skills/nextjs/SKILL.md): Next.js App Router structure + the data-flow standard (query routes + react-query, server actions + `useActionMutation`, service layer, sonner toasts), with copy-ready reference hooks.
- [`colour-palette`](plugins/web/skills/colour-palette/SKILL.md): Guides color and palette selection, OKLCH tonal scales, WCAG accessibility contrast, and UI design system themes.
- [`lucide-icons`](plugins/web/skills/lucide-icons/SKILL.md): Authoring and reviewing custom icons in the lucide style — the 24-unit grid, the 1px safe zone, corner radii, the 2px gap, lucide's own dots, points, rings and arrow heads measured from the set, the `createLucideIcon` authoring pattern, and a render script that draws a glyph on the grid and at native sizes beside `circle` and `square` and reports rule breaks.
- [`ts-monorepo`](plugins/web/skills/ts-monorepo/SKILL.md): pnpm workspace, catalog dependencies, publishable-package layout, build order, and Vitest conventions.

### `web3` — dapp chain layer

- [`web3-chain-layer`](plugins/web3/skills/web3-chain-layer/SKILL.md): Dapp chain layer, with EVM (wagmi + viem) and Starknet (Starknet Start + starknet.js v10 + Cartridge + Torii) specifics in separate references.

### `ios` — Swift apps for Apple platforms (iPhone Duo)

- [`iphone-duo`](plugins/ios/skills/iphone-duo/SKILL.md): Hub — device anatomy, poses, size classes per display, where bars go, SDK 26/27/27.1 behaviour, the readiness workflow, API availability, and a map routing each task to the skills below.
- [`iphone-duo-resizability`](plugins/ios/skills/iphone-duo-resizability/SKILL.md): Removing `UIScreen.main`, orientation, idiom and device-size layout; scene lifecycle; re-reading size; asymmetric safe areas; full-bleed media; `UIRequiresFullScreen` — with `scripts/audit-resizability.sh`.
- [`iphone-duo-bars`](plugins/ios/skills/iphone-duo-bars/SKILL.md): Vertical toolbars/tab bars — opt-in, container rules, item order, icon+title, `axisBehavior`, badges, compression, overflow, priorities, disabling.
- [`iphone-duo-fold-layouts`](plugins/ios/skills/iphone-duo-fold-layouts/SKILL.md): Reserved regions (fold, cameras), displacement patterns per pose, `ArrangementView` / `UIArrangementViewController`, split views and grids around the fold.
- [`iphone-duo-hinge-scenes`](plugins/ios/skills/iphone-duo-hinge-scenes/SKILL.md): Hinge API, Split View multitasking and pinned PiP, multiple windows, scene accessories.
- [`iphone-duo-camera`](plugins/ios/skills/iphone-duo-camera/SKILL.md): Virtual front camera, direction coordinator, mirroring by direction, rotation, preview polish, `CameraCaptureAccessory` on the outer display.
- [`iphone-duo-design`](plugins/ios/skills/iphone-duo-design/SKILL.md): Design principles, layout patterns, toolbar/sheet/game design, accessibility, a spec template and a pose-by-pose review checklist.
- [`ios-xcode-cli`](plugins/ios/skills/ios-xcode-cli/SKILL.md): The agent's command-line loop — project shape (thin app, synced folders, local packages), `swift test` / `xcodebuild` incl. one test and `.xcresult`, own named simulators, the Duo simulator, `simctl` / `devicectl`, API-key signing, parallel sessions, in-app smoke harness.
- [`ios-release-playbook`](plugins/ios/skills/ios-release-playbook/SKILL.md): The order and ownership of an App Store release with asc — person-only steps marked, metadata as code, TestFlight with tag identity, promote-never-rebuild, validate, submit, release — routing each step to the `appstore` skills.
- [`iphone-duo-testing-launch`](plugins/ios/skills/iphone-duo-testing-launch/SKILL.md): Xcode 27.1 setup and the App Resizability skill, Device Hub, iPhone Mirroring fixes, the device test plan, App Store screenshots/badge/featuring.


### `appstore` — App Store Connect via the asc CLI (curated)

Twelve `asc-*` skills copied unchanged from
[rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills) (MIT)
at a pinned commit. Never edit them in place; re-copy to update. Provenance, what was left out, and
the sync procedure: [`plugins/appstore/UPSTREAM.md`](plugins/appstore/UPSTREAM.md).

---

## 🌐 Curated Third-Party Skills (Ready to Install)

The following external skills are curated for optional use across projects. When the user asks to install any of these skills:

1. Clone the skill into the plugin it belongs to — `plugins/<plugin>/skills/<skill-name>/` — or, for a
   one-off, straight into the target project's skills directory.
2. Verify that `SKILL.md` contains valid YAML frontmatter (`name`, `description`).
3. Move the skill from the Curated Third-Party list to `Available Skills` in [`README.md`](README.md)
   and in this file, under its plugin's heading, with its **Date Updated** and **Size in KB**.
4. Bump the owning plugin's `version` in `plugins/<plugin>/.claude-plugin/plugin.json`.

| Skill | Repository | Description | Status |
|---|---|---|---|
| `threejs-tsl-webgpu` | [dgreenheck/webgpu-claude-skill](https://github.com/dgreenheck/webgpu-claude-skill) | Three.js + WebGPU graphics & compute pipeline generation, TSL shader authoring, and browser graphics integration. | Ready on demand |
| `legal-skills` | [gfodor/legal-skills](https://github.com/gfodor/legal-skills) | Software contract review, terms of service, privacy compliance (GDPR/CCPA), IP licensing, and open-source compliance. | Ready on demand |

---

## 🛠 Workflow: Creating New Skills

When tasked with creating a new skill, follow these exact requirements:

### 1. Choose a Plugin, then Create the Directory

Pick the plugin the skill belongs to — `core` (stack-agnostic), `web` (TypeScript web stack),
`web3` (dapp chain layer), `ios` (Swift apps for Apple platforms), or `appstore` (curated asc skills only). If it fits none, create a new plugin (see step 4). Then create the skill
folder under that plugin's `skills/`:

```text
plugins/<plugin>/skills/<skill-name>/
├── SKILL.md            # Main entry point (YAML frontmatter + instructions)
├── scripts/            # Helper scripts executed by agents (optional)
├── examples/           # Reference code implementations (optional)
├── references/         # Extended documentation loaded on-demand (optional)
└── resources/          # Templates or static assets (optional)
```

### 2. `SKILL.md` Specification
The `SKILL.md` file MUST begin with valid YAML frontmatter containing `name` and `description` fields:

```markdown
---
name: skill-name
description: >
  Clear 2-3 sentence summary of what this skill does and when it should trigger.
  Include relevant framework keywords, context, file patterns, or user intent triggers.
---

# Skill Title

## Overview
Short explanation of the skill's purpose and scope.

## Instructions
Step-by-step actionable instructions for the agent.

## TypeScript Examples
Provide complete, idiomatic TypeScript examples demonstrating proper code patterns and error handling.
```

### 3. Authoring Guidelines
- **TypeScript First**: All code snippets, type definitions, and boundary handling MUST use TypeScript — except in the `ios` plugin, whose skills use Swift (SwiftUI and UIKit side by side).
- **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. Place detailed docs in `references/` and link to them.
- **Single Source of Truth**: Never duplicate instructions across skills. Reference canonical skills directly (e.g. `[software-design-principles](../software-design-principles/SKILL.md)`).
- **Agent Agnostic**: Avoid system-specific assumptions; use standard Markdown and standard shell commands.
- **Keep README Metadata Updated**: Whenever creating or updating a skill, agents MUST update the skill's entry in [`README.md`](README.md) with its **Date Updated** (`YYYY-MM-DD`) and **Size** (in KB).
- **Register New Skills**: A new skill must also be added to the `Available Skills` list in this file, under its plugin's heading. No manifest edit is needed for a new *skill* — Claude Code discovers everything under `plugins/<plugin>/skills/`.

### 4. Adding a New Plugin

Only when a skill fits none of the existing groups:

1. Create `plugins/<plugin>/.claude-plugin/plugin.json` with `name`, `description`, `version`, `author`, `homepage`, `license` — copy an existing one.
2. Add a matching entry to the `plugins` array in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) with `source: "./plugins/<plugin>"`.
3. Add `"<plugin>@rsodre-skills"` to the `dependencies` array in `plugins/all/.claude-plugin/plugin.json` so the meta-plugin still covers the whole library.
4. `claude plugin validate .` and `claude plugin validate plugins/<plugin>` to check both manifests.
5. Document the plugin in the Repository Layout tree and the `Available Skills` headings here and in [`README.md`](README.md).

---

## 🚀 Workflow: Installing Skills in Projects

### Claude Code — the plugin marketplace (recommended)

This is the default path. It needs no symlinks, works on any machine or fresh clone, leaves nothing
in the target repo, and has a real update command.

**Once per machine:**

```bash
/plugin marketplace add rsodre/agent-skills
```

**Per project** (run inside the project, or once globally for every project):

```bash
/plugin install core@rsodre-skills      # every project
/plugin install web@rsodre-skills       # TypeScript / React / Next.js projects
/plugin install web3@rsodre-skills      # dapps
/plugin install ios@rsodre-skills       # Swift / iOS apps (iPhone Duo)
/plugin install appstore@rsodre-skills  # App Store Connect via the asc CLI
```

Install only what the project's stack needs — skill descriptions all load at session start, and an
agent in a Rust repo should not be weighing whether `nextjs` applies.

To install everything in one command, use the `all` meta-plugin — it carries no skills of its own,
just a `dependencies` list, so the five real plugins are pulled in with it:

```bash
/plugin install all@rsodre-skills
```

Note `rsodre-skills` is the **marketplace** name, not a plugin — `/plugin install rsodre-skills`
does not work. Uninstalling `all` leaves its dependencies behind; `claude plugin prune` clears them.

**Developing against the working tree**: to test uncommitted skill edits, add the local checkout as
the marketplace instead — `/plugin marketplace add ~/Dev/agents/agent-skills` — then switch back to
the GitHub source when done.

### Other agents — symlink or copy

The marketplace layer is Claude-specific; the skill folders underneath are plain Agent Skills.

#### Antigravity (Google AGY SDK / Gemini)
- **Project-level**: symlink the plugin's skills into `.agents/skills/`:
  ```bash
  mkdir -p .agents/skills
  ln -s ~/Dev/agents/agent-skills/plugins/core/skills/* .agents/skills/
  ln -s ~/Dev/agents/agent-skills/plugins/web/skills/* .agents/skills/
  ```
- **Global-level**: register the library paths in `~/.gemini/config/skills.json`:
  ```json
  {
    "entries": [
      { "path": "/Users/roger/Dev/agents/agent-skills/plugins/core/skills" },
      { "path": "/Users/roger/Dev/agents/agent-skills/plugins/web/skills" }
    ]
  }
  ```

#### Codex / Copilot / Open Agent Specs
- **Project-level**: copy or symlink the plugin's `skills/*` into `.skills/` or the project root.

#### Claude Code without the marketplace
Symlinking into `.claude/skills/` still works and is fine for a one-off, but prefer the marketplace
— a symlink binds the project to this machine's checkout path.

---

## 💻 Workflow: Using Skills in Projects

### 1. Automatic Activation
Agents evaluate user requests against skill `description` fields in YAML frontmatter and activate relevant skills automatically.

### 2. Explicit Invocation
Users or agents can invoke skills directly by name in prompts:
- *"Run `software-design-review` on `src/api`."*
- *"Evaluate code against `software-design-principles`."*

### 3. Subagent Delegation
For multi-persona review skills (e.g. `software-design-review`), dispatch specialized subagents in parallel with their corresponding prompt from `reviewers/<concern>.md` and aggregate findings into a triaged table.

---

## 🔄 Workflow: Updating & Syncing Skills

**Authoring loop**: edit skills in this repo → commit → push. Consuming projects are never edited.

**Consuming projects** pull updates with:

```bash
/plugin marketplace update rsodre-skills
```

Other paths, when the marketplace is not in use:
- **Symlinks**: changes in `agent-skills` reflect immediately; nothing to run.
- **Git submodules**: `git submodule update --remote --merge` in the consuming project.
- **Copy/sync**: `rsync -av --exclude='.git' ~/Dev/agents/agent-skills/plugins/<plugin>/skills/ <target-project>/.agents/skills/`

**Versioning**: consumers track `main` by default. To make them lag behind deliberately, cut a
release tag and pin it on the plugin entry in
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json):

```bash
claude plugin tag plugins/<plugin>   # creates <plugin>--v<version>, checking manifest agreement
```

Then set `"source": { "source": "git", "url": "https://github.com/rsodre/agent-skills.git", "ref": "<plugin>--v1.2.0" }`
on that entry.

**Validating a change** before pushing:

```bash
claude plugin validate .                     # marketplace manifest
claude plugin validate plugins/<plugin>      # plugin manifest + its skills
```

**On every skill edit**: bump the skill's **Date Updated** (`YYYY-MM-DD`) and **Size** (in KB) in
[`README.md`](README.md), and bump the `version` in the owning plugin's `plugin.json`.
