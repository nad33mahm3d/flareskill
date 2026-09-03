# FlareSkill

[![npm version](https://img.shields.io/npm/v/flareskill.svg)](https://www.npmjs.com/package/flareskill)
[![CI](https://github.com/nad33mahm3d/flareskill/actions/workflows/ci.yml/badge.svg)](https://github.com/nad33mahm3d/flareskill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**FlareSkill is an open-source registry and CLI for discovering, installing, sharing, and managing reusable AI agent skills.**

## Quick start

```bash
npx flareskill init
npx flareskill search react
npx flareskill install senior-react-engineer --agent cursor
```

![FlareSkill CLI demo](docs/assets/demo.gif)

Regenerate the GIF with [VHS](https://github.com/charmbracelet/vhs): `npm run demo:gif`

- One standard format
- One CLI
- Multiple AI agents (Cursor, Claude Code, Codex, generic)
- Versioned skills + lockfile
- Dependencies, search, and update
- Open source

## Install a skill

```bash
npx flareskill install senior-spring-boot-engineer
npx flareskill install senior-react-engineer --agent cursor
npx flareskill install senior-nextjs-engineer --agent claude
npx flareskill install docker-engineer --agent codex
npx flareskill install kubernetes-engineer --global
```

Project installs go to `.cursor/skills/`, `.claude/skills/`, `.agents/skills/`, or `.flareskill/skills/` depending on `--agent` / auto-detect. Global installs use the matching home directory (`~/.cursor`, `~/.claude`, `~/.codex`, or `~/.flareskill`).

## Search, update, lockfile

```bash
npx flareskill search security
npx flareskill outdated
npx flareskill update
npx flareskill install                 # sync pinned versions from flareskill.lock
npx flareskill install <name> --no-deps
npx flareskill install <name> -q       # quieter output, still prints a summary
```

Project installs write `flareskill.lock` (versions + checksums). Teammates run `npx flareskill install` with no args to reproduce the same set. Lock sync **fails** if a pinned checksum no longer matches the registry (drift). Declared `dependencies` install automatically unless you pass `--no-deps`; already-satisfied versions are skipped.

## CLI

```bash
npx flareskill init
npx flareskill search <query>
npx flareskill validate ./my-skill
npx flareskill create my-new-skill
npx flareskill install <name>[@version]
npx flareskill install                 # sync from flareskill.lock
npx flareskill install <name> --no-deps
npx flareskill install <name> -q
npx flareskill outdated
npx flareskill update [name...]
npx flareskill uninstall <name>
npx flareskill list
npx flareskill info <name>
npx flareskill profile list
npx flareskill profile install frontend
```

## Profiles

Named skill sets for a stack. Official profiles ship in the registry; local ones live in `.flareskill/profiles/`.

```bash
npx flareskill profile list
npx flareskill profile info backend
npx flareskill profile install backend --agent cursor
npx flareskill profile create my-stack --from-installed
```

| Profile | Skills |
| ------- | ------ |
| `backend` | Spring Boot, Node.js, Python, security |
| `frontend` | React, Next.js |
| `devops` | Docker, Kubernetes |
| `platform` | Architect, security, QA |


## Skill format

Every skill is a directory with `SKILL.md` (YAML frontmatter + instructions). See [docs/specification.md](docs/specification.md) and [docs/creating-skills.md](docs/creating-skills.md).

## Official skills

| Skill | Category | Depends on |
| ----- | -------- | ---------- |
| `senior-spring-boot-engineer` | backend | `security-engineer` |
| `senior-nodejs-engineer` | backend | — |
| `senior-python-engineer` | backend | — |
| `senior-react-engineer` | frontend | — |
| `senior-nextjs-engineer` | frontend | `senior-react-engineer` |
| `kubernetes-engineer` | devops | `docker-engineer` |
| `docker-engineer` | devops | — |
| `system-architect` | architecture | `security-engineer` |
| `security-engineer` | security | — |
| `qa-engineer` | qa | — |

## Development

```bash
npm install
npm test
npm run build
node apps/cli/dist/index.js --help
npm run validate:skills
```

Monorepo: `apps/cli`, `apps/web`, `packages/*`, `skills/*`, Git-based `registry/index.json`.

Browse the registry locally: `npm run web` → http://localhost:3000

The public site deploys from `apps/web` to GitHub Pages (`https://nad33mahm3d.github.io/flareskill/`) after Pages is enabled (Settings → Pages → GitHub Actions).


## License

MIT. Individual skills declare their own license in `SKILL.md`.
