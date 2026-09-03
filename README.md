# FlareSkill

[![npm version](https://img.shields.io/npm/v/flareskill.svg)](https://www.npmjs.com/package/flareskill)
[![CI](https://github.com/nad33mahm3d/flareskill/actions/workflows/ci.yml/badge.svg)](https://github.com/nad33mahm3d/flareskill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**FlareSkill is an open-source registry and CLI for discovering, installing, sharing, and managing reusable AI agent skills.**

## Quick start

```bash
npx flareskill install senior-react-engineer --agent cursor
```

![FlareSkill install demo](docs/assets/demo.gif)

- One standard format
- One CLI
- Multiple AI agents
- Versioned skills
- Open source
- Community driven

## Install a skill

```bash
npx flareskill install senior-spring-boot-engineer
npx flareskill install senior-react-engineer --agent cursor
npx flareskill install kubernetes-engineer --global
```

Project installs go to `.cursor/skills/` when Cursor is detected, otherwise `.flareskill/skills/`. Global installs use `~/.cursor/skills/` or `~/.flareskill/skills/`.

## CLI

```bash
npx flareskill validate ./my-skill
npx flareskill create my-new-skill
npx flareskill install <name>[@version]
npx flareskill uninstall <name>
npx flareskill list
npx flareskill info <name>
```

## Skill format

Every skill is a directory with `SKILL.md` (YAML frontmatter + instructions). See [docs/specification.md](docs/specification.md) and [docs/creating-skills.md](docs/creating-skills.md).

## Official skills (v0.1)

| Skill | Category |
| ----- | -------- |
| `senior-spring-boot-engineer` | backend |
| `senior-nodejs-engineer` | backend |
| `senior-python-engineer` | backend |
| `senior-react-engineer` | frontend |
| `senior-nextjs-engineer` | frontend |
| `kubernetes-engineer` | devops |
| `docker-engineer` | devops |
| `system-architect` | architecture |
| `security-engineer` | security |
| `qa-engineer` | qa |

## Development

```bash
npm install
npm test
npm run build
node apps/cli/dist/index.js --help
npm run validate:skills
```

Monorepo: `apps/cli`, `packages/*`, `skills/*`, Git-based `registry/index.json`.

## License

MIT. Individual skills declare their own license in `SKILL.md`.
