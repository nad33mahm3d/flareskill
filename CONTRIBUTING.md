# Contributing to FlareSkill

Thank you for contributing. FlareSkill is an open-source registry and CLI for reusable AI agent skills.

## How to contribute

1. Fork this repository.
2. Create a skill with `npx flareskill create my-skill` (or copy [docs/skill-template](docs/skill-template/SKILL.md) into `skills/<category>/<name>/`).
3. Validate: `npx flareskill validate ./path-to-skill`.
4. Add or update tests if you change packages.
5. If you add or change an official skill or profile, run `npm run registry:build` and commit `registry/index.json`.
6. Open a pull request (use the PR template).
7. Maintainers review (schema, security, quality).

Looking for ideas? Open a [New skill proposal](https://github.com/nad33mahm3d/flareskill/issues/new?template=new_skill.md) or pick an issue labeled `good first issue`.

## Skill quality checklist

- Clear role definition
- Clear responsibilities
- Technology coverage
- Security guidance
- Testing guidance
- Error handling
- Performance considerations
- Examples
- Version metadata
- License
- Documentation

## Development

```bash
npm install
npm test
npm run build
node apps/cli/dist/index.js --help
npm run validate:skills
npm run registry:build
npm run web
```

Workspaces live under `apps/` and `packages/`. Official skills live under `skills/`. Official profiles live under `profiles/`. Preview the registry site with `npm run web`.

## Pull requests

- Keep changes focused.
- Do not include secrets.
- Run `npm test` and `npm run validate:skills` before opening a PR.

## Maintainers

Release process (npm publish via OIDC): [docs/releasing.md](docs/releasing.md).
Launch / Search Console checklist: [docs/launch-checklist.md](docs/launch-checklist.md).
