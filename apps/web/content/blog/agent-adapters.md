---
title: Cursor, Claude Code, and Codex adapters
date: 2026-09-04
description: Where FlareSkill copies SKILL.md for each agent, and how --agent changes the destination.
---

The same skill file works across agents. FlareSkill copies it into the folder each product already reads.

## Destinations

- **Cursor:** `.cursor/skills/` in the project, or `~/.cursor` for `--global`
- **Claude Code:** `.claude/skills/` or `~/.claude`
- **Codex:** `.agents/skills/` or `~/.codex/skills/`
- **Generic:** `.flareskill/skills/` or `~/.flareskill`

## Pick an adapter

```
npx flareskill install senior-react-engineer --agent cursor
npx flareskill install senior-nextjs-engineer --agent claude
npx flareskill install docker-engineer --agent codex
```

If you omit `--agent`, FlareSkill looks at the repo and chooses a sensible default. Pass `--agent` in CI or docs so the destination is explicit.

## One format

Skills are directories with `SKILL.md`. Adapters do not rewrite the prompt for each product. They place the same package where the agent loads instructions, so a React skill you trust in Cursor is the same text Claude Code and Codex receive.
