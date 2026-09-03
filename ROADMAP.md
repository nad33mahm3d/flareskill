# Roadmap

FlareSkill ships as a **standard + CLI + GitHub registry + starter skills**.

## v0.1

- Skill specification (`SKILL.md` + metadata)
- CLI: `install`, `uninstall`, `list`, `validate`, `create`, `info`
- Git-based registry (`registry/index.json`)
- Cursor and generic adapters
- Official starter skills

## v0.2

- Search (`flareskill search`)
- Update (`flareskill update`) + outdated listing
- Lock file (`flareskill.lock`) + `install` sync with checksum verification
- Skill dependencies (ranges, cycles, transitive install, skip if satisfied)
- Adapters: Cursor, Claude Code, Codex, generic
- Stronger validation (structure, deps, agents, blocked files, safety heuristics)
- `flareskill init`, quiet install UX, E2E smoke in CI

## v0.3 (in progress)

- Skill profiles (`flareskill profile list|info|install|create`)
- Public registry website (`apps/web`, GitHub Pages)
- GitHub publish workflow for community skills (next)
- Community contribution tooling (next)

## v1.0

- Stable specification and CLI
- Multi-agent support
- Security verification
- Skill testing and documentation site

Marketplace, SaaS, and enterprise features are out of scope until after v1.0.
