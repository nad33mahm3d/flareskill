# FlareSkill

**FlareSkill is an open-source registry and CLI for discovering, installing, sharing, and managing reusable AI agent skills.**

```bash
npx flareskill install senior-react-engineer
```

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

## Publish the CLI (maintainers)

Publishing is done on **GitHub**, not from a local machine.

1. Create an [npm access token](https://www.npmjs.com/settings/~/tokens) (Automation).
2. Add it as a repository secret named `NPM_TOKEN`  
   (Settings → Secrets and variables → Actions).
3. Bump `apps/cli/package.json` `version` on `main` if needed.
4. Create a GitHub Release (tag like `v0.1.0`).

The [Publish](.github/workflows/publish.yml) workflow runs tests, builds, and publishes `flareskill` to npm. After that:

```bash
npx flareskill --help
```

Workspace libraries are bundled into the CLI; `commander`, `yaml`, and `zod` remain runtime dependencies.

## License

MIT. Individual skills declare their own license in `SKILL.md`.
