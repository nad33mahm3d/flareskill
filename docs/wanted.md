# Wanted contributions

Pick an open issue and open a PR. Prefer items labeled **`status:ready`** or **`good first issue`**.

## Labels

| Label | Meaning |
| --- | --- |
| `skill` | New or improved official skill under `skills/` |
| `feature` / `enhancement` | Product change (CLI, website, registry) |
| `area:cli` / `area:web` / `area:docs` / `area:registry` | Where the work lives |
| `help wanted` | Maintainers want community PRs |
| `status:ready` | Scoped enough for a first PR |
| `good first issue` | Suitable for first-time contributors |

## Issue templates

- [New skill proposal](https://github.com/nad33mahm3d/flareskill/issues/new?template=new_skill.md)
- [Feature request](https://github.com/nad33mahm3d/flareskill/issues/new?template=feature_request.md)
- [Bug report](https://github.com/nad33mahm3d/flareskill/issues/new?template=bug_report.md)

## Browse open work

- [Good first issues](https://github.com/nad33mahm3d/flareskill/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- [Skills](https://github.com/nad33mahm3d/flareskill/issues?q=is%3Aissue+is%3Aopen+label%3Askill)
- [Features](https://github.com/nad33mahm3d/flareskill/issues?q=is%3Aissue+is%3Aopen+label%3Afeature)
- [Help wanted](https://github.com/nad33mahm3d/flareskill/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)

## Skill PR checklist

1. `npx flareskill create <name>` or copy [skill-template](./skill-template/SKILL.md)
2. `npx flareskill validate ./path-to-skill`
3. `npm run registry:build` (commit `registry/index.json`)
4. Open a PR with the PR template
