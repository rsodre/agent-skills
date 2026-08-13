# Personal Agent Skills Library

A personal, agent-agnostic repository of reusable AI coding assistant skills. Built to provide consistent software engineering standards, architectural design principles, and automated review workflows across all your projects.

Compatible with **Claude** (Claude Code, Anthropic API), **Antigravity** (Google Antigravity SDK / Gemini), **Codex** (OpenAI Codex, Copilot), and any agent supporting the open Agent Skills specification (`SKILL.md` with YAML frontmatter).

---

## 📚 Available Skills

| Skill | Description | Last Updated | Size |
|---|---|---|---|
| [`software-design-principles`](software-design-principles/SKILL.md) | Canonical reference for 27 core software design principles, Foundation heuristics, trade-off calibration tables, and failure modes. | 2026-08-13 | 5.9 KB (`SKILL.md`) / 12 KB (Total) |
| [`software-design-review`](software-design-review/SKILL.md) | Automated multi-persona code review orchestrator (`premise`, `structural`, `code-smells`, `efficiency`, `defensive`, `completion`). | 2026-08-13 | 5.5 KB (`SKILL.md`) / 44 KB (Total) |

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

---

## 🤖 Agent Instructions & Workflows

Complete operational instructions for AI agents creating, installing, using, and updating skills are located in **[`AGENTS.md`](AGENTS.md)**:

- **[Creating New Skills](AGENTS.md#-workflow-creating-new-skills)**: Directory layout, `SKILL.md` specification, TypeScript guidelines, progressive disclosure rules, and mandatory README metadata maintenance.
- **[Installing Skills in Projects](AGENTS.md#-workflow-installing-skills-in-projects)**: Installation paths for Claude (`.claude/skills/`), Antigravity (`.agents/skills/` or `skills.json`), and Codex (`.skills/`).
- **[Using Skills in Projects](AGENTS.md#-workflow-using-skills-in-projects)**: Automatic trigger matching, explicit invocations, and subagent review delegation.
- **[Updating & Syncing Skills](AGENTS.md#-workflow-updating--syncing-skills)**: Keeping README metadata updated, symlinking, git submodules, and automated sync scripts across projects.

---

## 📄 License
MIT License. Feel free to customize and expand for your personal agent workflows.
