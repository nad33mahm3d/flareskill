import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateSkillDirectory } from "./index.js";

const FRONTMATTER = `---
name: demo-skill
version: 1.0.0
description: A demo skill for tests.
author: flareskill-community
license: MIT
tags:
  - demo
category: engineering
---
`;

describe("validateSkillDirectory", () => {
  it("accepts a valid skill", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-valid-"));
    await writeFile(
      path.join(dir, "SKILL.md"),
      `${FRONTMATTER}\n# Demo\n\nDo the work carefully.\n`,
    );
    const result = await validateSkillDirectory(dir);
    expect(result.ok).toBe(true);
    expect(result.skill?.name).toBe("demo-skill");
    expect(result.errors).toHaveLength(0);
  });

  it("fails when required metadata is missing", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-invalid-"));
    await writeFile(
      path.join(dir, "SKILL.md"),
      `---\nname: demo-skill\n---\n\nBody\n`,
    );
    const result = await validateSkillDirectory(dir);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("warns on suspicious phrases without failing", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-warn-"));
    await writeFile(
      path.join(dir, "SKILL.md"),
      `${FRONTMATTER}\nNever delete all files on the machine.\n`,
    );
    const result = await validateSkillDirectory(dir);
    expect(result.ok).toBe(true);
    expect(
      result.warnings.some((w) => w.message.includes("delete all files")),
    ).toBe(true);
  });

  it("rejects empty bodies and blocked file types", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-strong-"));
    await writeFile(path.join(dir, "SKILL.md"), `${FRONTMATTER}\n\n`);
    const empty = await validateSkillDirectory(dir);
    expect(empty.ok).toBe(false);
    expect(empty.errors.some((e) => e.message.includes("empty"))).toBe(true);

    await writeFile(
      path.join(dir, "SKILL.md"),
      `${FRONTMATTER}\n# Demo\n\nDo the work carefully.\n`,
    );
    await writeFile(path.join(dir, "malware.exe"), "x");
    const blocked = await validateSkillDirectory(dir);
    expect(blocked.ok).toBe(false);
    expect(blocked.errors.some((e) => e.message.includes("Blocked"))).toBe(
      true,
    );
  });

  it("rejects invalid dependency refs", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-deps-"));
    await writeFile(
      path.join(dir, "SKILL.md"),
      `---
name: demo-skill
version: 1.0.0
description: A demo skill for tests with a longer description.
author: flareskill-community
license: MIT
tags:
  - demo
category: engineering
dependencies:
  - Not A Valid Ref!!!
---

# Demo

Body text.
`,
    );
    const result = await validateSkillDirectory(dir);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.message.includes("dependencies"))).toBe(
      true,
    );
  });
});
