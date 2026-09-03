# FlareSkill Skill Specification v0

A **skill** is a reusable package of instructions and supporting resources for AI coding agents.

## Package layout

```text
skill-name/
├── SKILL.md          # required
├── metadata.yaml     # optional (frontmatter wins on conflict)
├── README.md         # recommended
├── examples/         # optional
├── references/       # optional
├── templates/        # optional
└── tests/            # optional
```

## SKILL.md

`SKILL.md` must start with YAML frontmatter, then a Markdown body.

```markdown
---
name: senior-spring-boot-engineer
version: 1.0.0
description: Production-grade Spring Boot engineering skill. Use when building or reviewing Spring Boot services.
author: flareskill-community
license: MIT
tags:
  - java
  - spring-boot
  - backend
category: backend
---

# Senior Spring Boot Engineer

You are a senior Spring Boot engineer...
```

## Required metadata

| Field | Rules |
| ----- | ----- |
| `name` | 1–64 chars, lowercase letters, numbers, hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) |
| `version` | Semantic version `MAJOR.MINOR.PATCH` |
| `description` | 1–1024 chars; what the skill does and when to use it |
| `author` | Non-empty string |
| `license` | Non-empty SPDX-style identifier (e.g. `MIT`) |
| `tags` | Non-empty list of strings |
| `category` | One of the categories below |

## Optional metadata

`homepage`, `repository`, `documentation`, `icon`, `maintainers`, `keywords`, `dependencies`, `agents`, `compatibility`

### Dependencies

Declare other skills this package needs:

```yaml
dependencies:
  - security-engineer@1.x
  - code-reviewer@^1.0.0
```

Supported ranges: exact (`1.2.0`), major (`1.x`), caret (`^1.2.0`), tilde (`~1.2.0`), or `*`. `flareskill install` resolves transitive dependencies, detects cycles, and installs dependencies first. Use `--no-deps` to skip.

### Agents

`agents` lists compatible adapters: `cursor`, `claude`, `codex`, `generic`.

If both frontmatter and `metadata.yaml` are present, **frontmatter wins** on conflicting keys.

## Categories

`backend`, `frontend`, `mobile`, `devops`, `cloud`, `security`, `database`, `qa`, `architecture`, `ai`, `data`, `product`, `design`, `documentation`, `marketing`, `business`, `engineering`

## Machine-readable schema

JSON Schema: [`schemas/skill.schema.json`](../schemas/skill.schema.json)

Validate locally:

```bash
npx flareskill validate ./path-to-skill
```

## Cursor / Claude / Codex compatibility

Adapters install the same `SKILL.md` package into agent-specific roots:

| Agent | Project path | Global path |
| ----- | ------------ | ----------- |
| Cursor | `.cursor/skills/<name>/` | `~/.cursor/skills/<name>/` |
| Claude Code | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` |
| Codex | `.agents/skills/<name>/` | `~/.codex/skills/<name>/` |
| Generic | `.flareskill/skills/<name>/` | `~/.flareskill/skills/<name>/` |

Auto-detect order: Cursor → Claude → Codex → generic.

## Safety

Skill packages must not contain absolute paths, `..` segments, blocked binary extensions, or files over 1MB. Install never writes outside the chosen skills root. Validation also flags empty bodies, invalid dependency refs, unknown agents, and suspicious instruction phrases.
