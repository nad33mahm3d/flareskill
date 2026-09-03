# FlareSkill

[![npm version](https://img.shields.io/npm/v/flareskill.svg)](https://www.npmjs.com/package/flareskill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/nad33mahm3d/flareskill/blob/main/LICENSE)

Open-source registry and CLI for discovering, installing, sharing, and managing reusable AI agent skills.

```bash
npx flareskill install senior-react-engineer --agent cursor
```

![FlareSkill install demo](https://raw.githubusercontent.com/nad33mahm3d/flareskill/main/docs/assets/demo.gif)

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

## Docs

- [Repository](https://github.com/nad33mahm3d/flareskill)
- [Skill specification](https://github.com/nad33mahm3d/flareskill/blob/main/docs/specification.md)
- [Creating skills](https://github.com/nad33mahm3d/flareskill/blob/main/docs/creating-skills.md)

## License

MIT
