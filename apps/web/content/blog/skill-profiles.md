---
title: Skill profiles for a whole stack
date: 2026-09-04
description: Install named skill sets like frontend or devops with one profile command instead of ten installs.
---

A profile is a named list of skills. Use it when a stack always needs the same set: frontend, backend, devops, or platform.

## List and inspect

```
npx flareskill profile list
npx flareskill profile info frontend
```

The registry site also lists official profiles and the skills inside each one.

## Install a stack

```
npx flareskill profile install frontend
```

That pulls every skill in the profile, including declared dependencies unless you pass `--no-deps`. The lockfile still records versions so teammates reproduce the same stack.

## Official profiles

FlareSkill ships official JSON profiles in the Git repository. They are baked into `registry/index.json` and show up on [the profiles page](https://flareskill.vercel.app/profiles). You can also create a project-local profile with `flareskill profile create` when your team’s mix is not the official one.

Profiles are for the common path. Individual `flareskill install` remains the way to add one skill at a time.
