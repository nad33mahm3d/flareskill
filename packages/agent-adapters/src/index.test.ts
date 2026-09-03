import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CursorAdapter, GenericAdapter } from "./index.js";
import type { SkillPackage } from "@flareskill/skill-schema";

async function makeSkill(): Promise<SkillPackage> {
  const rootDir = await mkdtemp(path.join(tmpdir(), "skill-src-"));
  await writeFile(
    path.join(rootDir, "SKILL.md"),
    `---\nname: demo-skill\ndescription: Demo\n---\n\n# Demo\n`,
  );
  return {
    name: "demo-skill",
    version: "1.0.0",
    description: "Demo",
    author: "flareskill-community",
    license: "MIT",
    tags: ["demo"],
    category: "engineering",
    body: "# Demo",
    rootDir,
  };
}

describe("adapters", () => {
  it("installs a generic skill under .flareskill/skills", async () => {
    const projectRoot = await mkdtemp(path.join(tmpdir(), "proj-"));
    const skill = await makeSkill();
    const dest = await new GenericAdapter().install(skill, {
      global: false,
      projectRoot,
    });
    expect(dest).toBe(path.join(projectRoot, ".flareskill", "skills", "demo-skill"));
    const installed = await readFile(path.join(dest, "SKILL.md"), "utf8");
    expect(installed).toContain("demo-skill");
  });

  it("installs a Cursor skill under .cursor/skills", async () => {
    const projectRoot = await mkdtemp(path.join(tmpdir(), "proj-"));
    await mkdir(path.join(projectRoot, ".cursor"));
    const skill = await makeSkill();
    const dest = await new CursorAdapter().install(skill, {
      global: false,
      projectRoot,
    });
    expect(dest).toBe(path.join(projectRoot, ".cursor", "skills", "demo-skill"));
  });

  it("detects Cursor when .cursor exists", async () => {
    const projectRoot = await mkdtemp(path.join(tmpdir(), "proj-"));
    await mkdir(path.join(projectRoot, ".cursor"));
    expect(await new CursorAdapter().detect({ global: false, projectRoot })).toBe(
      true,
    );
  });
});
