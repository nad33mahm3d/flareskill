# FlareSkill

[![npm version](https://img.shields.io/npm/v/flareskill.svg)](https://www.npmjs.com/package/flareskill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/nad33mahm3d/flareskill/blob/main/LICENSE)
[![Registry](https://img.shields.io/badge/registry-flareskill.vercel.app-7dd3fc)](https://flareskill.vercel.app)
[![DeepWiki](https://img.shields.io/badge/docs-DeepWiki-6e56cf)](https://deepwiki.com/nad33mahm3d/flareskill)

Open-source registry and CLI for discovering, installing, sharing, and managing reusable AI agent skills.

```bash
npx flareskill init
npx flareskill search react
npx flareskill install senior-react-engineer --agent cursor
```

![FlareSkill install demo](https://raw.githubusercontent.com/nad33mahm3d/flareskill/main/docs/assets/demo.gif)

## Install a skill

```bash
npx flareskill install senior-spring-boot-engineer
npx flareskill install senior-react-engineer --agent cursor
npx flareskill install senior-nextjs-engineer --agent claude
npx flareskill install docker-engineer --agent codex
npx flareskill install kubernetes-engineer --global
```

Project installs go to `.cursor/skills/`, `.claude/skills/`, `.agents/skills/`, or `.flareskill/skills/` depending on `--agent` / auto-detect. Global installs use the matching home directory (`~/.cursor`, `~/.claude`, `~/.codex`, or `~/.flareskill`).

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

## Docs

- [Registry website](https://flareskill.vercel.app)
- [DeepWiki](https://deepwiki.com/nad33mahm3d/flareskill)
- [Repository](https://github.com/nad33mahm3d/flareskill)
- [Skill specification](https://github.com/nad33mahm3d/flareskill/blob/main/docs/specification.md)
- [Creating skills](https://github.com/nad33mahm3d/flareskill/blob/main/docs/creating-skills.md)

## License

MIT
