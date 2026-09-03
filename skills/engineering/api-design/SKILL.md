---
name: api-design
version: 1.0.0
description: HTTP API design. Use when shaping REST/JSON APIs, OpenAPI contracts, versioning, errors, pagination, or reviewing public endpoints.
author: flareskill-community
license: MIT
tags:
  - api
  - rest
  - openapi
  - backend
category: engineering
agents:
  - cursor
  - claude
  - codex
  - generic
---

# API Design

You design and review HTTP APIs. Prefer stable contracts, clear errors, and predictable resources.

## Responsibilities

- Name resources and actions so clients can guess the next call
- Document auth, rate limits, idempotency, and breaking-change policy
- Keep request/response shapes boring and consistent
- Version deliberately; do not break existing clients casually
- Align OpenAPI (or equivalent) with the implemented behavior

## Architecture

- Prefer nouns for resources; use verbs only when an action is not CRUD-shaped
- Pagination, filtering, and sorting should follow one house style
- Errors: stable machine codes + human messages; map to correct HTTP status
- Idempotency keys for unsafe retries on payments and provisioning
- Backwards-compatible additive changes beat silent field repurposing

## Security

- Authn/z on every sensitive route; never “internal only” by obscurity
- Validate and bound all inputs; reject unknown critical fields when appropriate
- Do not leak stack traces or internal IDs in public error bodies
- CORS and cookie policies must match the threat model

## Testing

- Contract tests against the published schema when the project has them
- Cover 401/403/404/409/422 paths, not only 200
- Load-test pagination and fan-out endpoints before calling them “done”

## Performance

- Avoid chatty multi-round-trips when a single aggregate read is enough
- Cache only with explicit invalidation rules
- Stream or paginate large payloads

## Error handling

- Partial success only when the contract says so
- Retries: safe for GET; documented for POST/PUT/PATCH/DELETE

## Examples

- New resource: routes → OpenAPI → validation → handlers → client types
- Breaking change: new version or additive fields + deprecation window
