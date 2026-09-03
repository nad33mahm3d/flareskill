# Contributing to FlareSkill

Thank you for contributing. FlareSkill is an open-source registry and CLI for reusable AI agent skills.

## How to contribute

1. Fork this repository.
2. Create a skill with `npx flareskill create my-skill` or edit an existing one under `skills/`.
3. Validate: `npx flareskill validate ./path-to-skill`.
4. Add or update tests if you change packages.
5. Open a pull request.
6. Maintainers review (schema, security, quality).
7. After merge, the Git-based registry index is updated.

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
```

Workspaces live under `apps/` and `packages/`. Official skills live under `skills/`. Official profiles live under `profiles/`. After adding or changing a skill or profile, run `npm run registry:build` so `registry/index.json` stays in sync.

## Pull requests

- Keep changes focused.
- Do not include secrets.
- Run `npm test` and `npm run validate:skills` before opening a PR.

## Maintainers

Release process (npm publish, GitHub Releases, planned OIDC trusted publishing): [docs/releasing.md](docs/releasing.md).
