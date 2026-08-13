# Workspace Customization for AI Agents

This repository serves as a central library for agent skills and an operational reference for creating, installing, using, and updating skills across projects.

## Available Skills

- [`software-design-principles`](software-design-principles/SKILL.md): Canonical reference for 27 software design principles, Foundation heuristics, calibration tables, agent failure modes, and TypeScript worked examples.
- [`software-design-review`](software-design-review/SKILL.md): Orchestrates multi-persona code reviews against software design principles using specialized subagents (`premise`, `structural`, `code-smells`, `efficiency`, `defensive`, `completion`).
- [`colour-palette`](colour-palette/SKILL.md): Guides color and palette selection, OKLCH tonal scales, WCAG accessibility contrast, and UI design system themes.


---

## 🛠 Workflow: Creating New Skills

When tasked with creating a new skill, follow these exact requirements:

### 1. Directory Structure
Create a dedicated folder under the skills root (`skills/<skill-name>/` or root `<skill-name>/` in this repo):

```text
<skill-name>/
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
- **TypeScript First**: All code snippets, type definitions, and boundary handling MUST use TypeScript.
- **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. Place detailed docs in `references/` and link to them.
- **Single Source of Truth**: Never duplicate instructions across skills. Reference canonical skills directly (e.g. `[software-design-principles](../software-design-principles/SKILL.md)`).
- **Agent Agnostic**: Avoid system-specific assumptions; use standard Markdown and standard shell commands.
- **Keep README Metadata Updated**: Whenever creating or updating a skill, agents MUST update the skill's entry in [`README.md`](README.md) with its **Date Updated** (`YYYY-MM-DD`) and **Size** (in KB).

---

## 🚀 Workflow: Installing Skills in Projects

When tasked with installing skills from this library into a target project, choose the appropriate agent path:

### Installation Paths

#### 1. Claude (Claude Code / Anthropic API)
- **Project-level**: Symlink or copy skill directories into `.claude/skills/`:
  ```bash
  mkdir -p .claude/skills
  ln -s ~/Dev/agents/agent-skills/software-design-principles .claude/skills/
  ln -s ~/Dev/agents/agent-skills/software-design-review .claude/skills/
  ```
- **Global-level**: Symlink skills to `~/.claude/skills/`.

#### 2. Antigravity (Google AGY SDK / Gemini)
- **Project-level**: Symlink or copy skill directories into `.agents/skills/`:
  ```bash
  mkdir -p .agents/skills
  ln -s ~/Dev/agents/agent-skills/software-design-principles .agents/skills/
  ln -s ~/Dev/agents/agent-skills/software-design-review .agents/skills/
  ```
- **Global-level**: Register the skills library path in `~/.gemini/config/skills.json`:
  ```json
  {
    "entries": [
      { "path": "/Users/roger/Dev/agents/agent-skills" }
    ]
  }
  ```

#### 3. Codex / Copilot / Open Agent Specs
- **Project-level**: Copy or symlink skills into `.skills/` or project root.

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

When updating skills across projects:
- **Keep README Metadata Updated**: Update the skill's **Date Updated** (`YYYY-MM-DD`) and **Size** (in KB) in [`README.md`](README.md) whenever any file within a skill is edited.
- **Symlinks**: Changes made in `agent-skills` automatically reflect in projects using symlinks.
- **Git Submodules**: Run `git submodule update --remote --merge` in projects using git submodules.
- **Copy/Sync Script**: Run `rsync -av --exclude='.git' ~/Dev/agents/agent-skills/ <target-project>/.agents/skills/`.
