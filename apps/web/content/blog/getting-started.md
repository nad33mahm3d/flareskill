---
title: Get started with FlareSkill
date: 2026-09-04
description: Init a project, search the registry, install a skill, and pin versions with a lockfile.
---

FlareSkill treats agent instructions as packages. You search a catalog, install a skill into Cursor, Claude Code, or Codex, and share the same versions with your team.

## Install the CLI

You do not need a global install. Use npx:

```
npx flareskill init
```

`init` prepares the project so later installs have a place to land.

## Find a skill

Browse the [registry](https://flareskill.vercel.app) or search from the terminal:

```
npx flareskill search react
```

Open a skill page for the exact install command, version, tags, and source path on GitHub.

## Install

```
npx flareskill install senior-react-engineer --agent cursor
```

Omit `--agent` if you want FlareSkill to detect the project. Use `--agent claude` or `--agent codex` when you know the target. Global installs go to the matching home directory.

## Keep the team in sync

Project installs write `flareskill.lock` with versions and checksums.

- `npx flareskill outdated` shows drift
- `npx flareskill update` moves pins forward
- `npx flareskill install` with no arguments syncs from the lockfile and fails if a checksum no longer matches the registry

That is the whole loop: search, install, lock, repeat.
