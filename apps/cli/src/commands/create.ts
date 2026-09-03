import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { skillNameSchema } from "@flareskill/skill-schema";
import { pathExists, titleFromName } from "../core/filesystem.js";
import * as log from "../core/log.js";

export async function runCreate(
  name: string,
  options: { cwd?: string } = {},
): Promise<void> {
  const parsed = skillNameSchema.safeParse(name);
  if (!parsed.success) {
    throw new Error(
      `Invalid skill name "${name}". Use lowercase letters, numbers, and hyphens (max 64 chars).`,
    );
  }

  const cwd = options.cwd ?? process.cwd();
  const dest = path.join(cwd, name);
  if (await pathExists(dest)) {
    throw new Error(`Directory already exists: ${dest}`);
  }

  const title = titleFromName(name);
  await mkdir(path.join(dest, "examples"), { recursive: true });
  await mkdir(path.join(dest, "tests"), { recursive: true });

  await writeFile(
    path.join(dest, "SKILL.md"),
    `---
name: ${name}
version: 1.0.0
description: TODO. Describe what this skill does and when to use it.
author: flareskill-community
license: MIT
tags:
  - todo
category: engineering
---

# ${title}

You are a specialist in this domain. Apply this skill when the user is working in this area.

## Responsibilities

- Clarify requirements before implementing
- Follow established patterns in the repository
- Call out security, testing, and operational risks

## Guidance

- Prefer simple, reviewable changes
- Document non-obvious decisions
- Include tests for behavior you change

## Examples

- Describe a typical request and the expected approach
`,
  );

  await writeFile(
    path.join(dest, "README.md"),
    `# ${title}

FlareSkill package. Edit \`SKILL.md\`, then run:

\`\`\`bash
npx flareskill validate .
\`\`\`
`,
  );

  await writeFile(path.join(dest, "examples", ".gitkeep"), "");
  await writeFile(path.join(dest, "tests", ".gitkeep"), "");

  log.ok(`Created ${dest}`);
  log.info("Edit SKILL.md, then run: npx flareskill validate .");
}
