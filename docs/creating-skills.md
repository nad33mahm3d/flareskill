# Creating a skill

## Scaffold

```bash
npx flareskill create senior-redis-engineer
```

This generates:

```text
senior-redis-engineer/
├── SKILL.md
├── README.md
├── examples/
└── tests/
```

## Edit SKILL.md

Fill in the YAML frontmatter (required fields are listed in the [specification](specification.md)), then write the body as instructions for an AI agent:

- Role and when to apply the skill
- Responsibilities
- Architecture, security, testing, and error handling as they apply
- Concrete examples

Write `description` in third person, including **what** the skill covers and **when** to use it. Cursor and similar agents use the description for discovery.

## Validate

```bash
npx flareskill validate ./senior-redis-engineer
```

Fix errors. Warnings (including suspicious-phrase flags) are review signals, not automatic failures.

## Quality checklist

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

## Share

For official skills, add the package under `skills/<category>/` and open a pull request. CI validates schema and structure. After merge, `registry/index.json` lists the skill for `flareskill install`.
