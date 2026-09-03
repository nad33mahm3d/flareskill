# Releasing FlareSkill

Maintainer notes for publishing the `flareskill` CLI to npm.

## Current process (npm Automation token)

1. Create an [npm Automation token](https://www.npmjs.com/settings/~/tokens).
2. Add it as the repo secret `NPM_TOKEN` (Settings → Secrets and variables → Actions).
3. Bump `apps/cli/package.json` `version` on `main`.
4. Create a GitHub Release (tag like `v0.1.3`).

The [Publish](../.github/workflows/publish.yml) workflow runs tests, builds, and publishes `flareskill`. Workspace libraries are bundled into the CLI; `commander`, `yaml`, and `zod` remain runtime dependencies.

## Planned: npm Trusted Publishing (OIDC)

Goal: publish from GitHub Actions **without** a long-lived `NPM_TOKEN`.

### Why not only OIDC today

npm Trusted Publishing can only be configured after the package already exists on the registry. First publish (or bootstrap) still needs a token or a one-time local publish. After that, OIDC can replace the token for subsequent releases.

### Target setup

1. Keep [Publish](../.github/workflows/publish.yml) with `permissions.id-token: write` and `registry-url: https://registry.npmjs.org`.
2. Use a GitHub Environment (e.g. `release`) on the publish job if you want protection rules.
3. Ensure CI uses npm **≥ 11.5.1** and Node **≥ 22.14** (or Node 24).
4. On [npmjs.com/package/flareskill](https://www.npmjs.com/package/flareskill) → **Settings → Trusted Publisher → GitHub Actions**:

| Field | Value |
| ----- | ----- |
| Organization or user | `nad33mahm3d` |
| Repository | `flareskill` |
| Workflow filename | `publish.yml` |
| Environment name | `release` (if used in the workflow) |
| Allowed actions | **npm publish** |

5. Remove `NODE_AUTH_TOKEN` / `NPM_TOKEN` from the publish step once OIDC works.
6. Optionally restrict token publishing on npm (`Require 2FA and disallow tokens`) after OIDC is verified.

### Bootstrap reminder

If you ever need a fresh package name: publish once with a token (or `npm login` locally), attach the trusted publisher, then rely on GitHub Releases + OIDC only.
