## Summary
<!-- What does this PR change and why? -->

## Type
- [ ] Skill / profile / registry
- [ ] CLI / packages
- [ ] Website (`apps/web`)
- [ ] Docs

## Test plan
- [ ] `npm test`
- [ ] `npm run validate:skills` (if skills changed)
- [ ] `npm run registry:build` (if skills/profiles changed; commit `registry/index.json`)
- [ ] Manual CLI check if user-facing (`npx flareskill --help` / install)
- [ ] `npm run build:web` if the site changed

## Skill PRs
- [ ] Follows sections in [docs/skill-template](../docs/skill-template/SKILL.md)
- [ ] Name is unique kebab-case
- [ ] Description says when to use the skill
