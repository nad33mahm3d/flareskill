# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

Skills are instructions that influence AI agents. Malicious skills can be dangerous.

Please report security issues privately. Do not open a public GitHub issue for vulnerabilities.

Email: security@flareskill.dev

Include:

- Description of the issue
- Affected package, skill, or CLI command
- Steps to reproduce
- Impact assessment if known

We will acknowledge reports as soon as possible and work on a fix before any public disclosure.

## Skill package rules

Install never writes outside the chosen skills directory. Packages that contain absolute paths or `..` path segments are rejected.

Suspicious instruction phrases are flagged as review warnings and do not automatically fail validation.
