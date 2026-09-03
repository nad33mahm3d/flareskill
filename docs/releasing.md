# Releasing FlareSkill

Maintainer notes for publishing the `flareskill` CLI to npm via **Trusted Publishing (OIDC)**.

No long-lived `NPM_TOKEN` is required for releases once the trusted publisher is configured.

## One-time npm setup

On [npmjs.com/package/flareskill](https://www.npmjs.com/package/flareskill) → **Settings → Trusted Publisher → GitHub Actions**:

| Field | Value |
| ----- | ----- |
| Organization or user | `nad33mahm3d` |
| Repository | `flareskill` |
| Workflow filename | `publish.yml` |
| Environment name | `release` |
| Allowed actions | enable **npm publish** |

Fields are case-sensitive. After OIDC works, you can delete the GitHub secret `NPM_TOKEN` if it still exists, and optionally set npm publishing access to disallow classic tokens.

## Cut a release

1. Bump `apps/cli/package.json` `version` on `main` and update [CHANGELOG.md](../CHANGELOG.md).
2. Push to `main`.
3. Create a GitHub Release with tag `vX.Y.Z` (for example `v0.3.0`) and release notes from the changelog.

The [Publish](../.github/workflows/publish.yml) workflow:

- Runs on the `release` GitHub Environment
- Uses `id-token: write` for OIDC
- Tests, builds, and publishes `flareskill` with provenance

Also see [launch-checklist.md](./launch-checklist.md) after website deploys.

## Troubleshooting

- **ENEEDAUTH / Unable to authenticate:** confirm the trusted publisher fields match exactly (especially `publish.yml` and environment `release`).
- **Self-hosted runners:** not supported for npm OIDC; use GitHub-hosted runners.
- **New package name:** create the package with a one-time token or local `npm publish` first, then attach the trusted publisher.
