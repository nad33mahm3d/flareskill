import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  mergeMetadata,
  parseFrontmatter,
  parseSkillDirectory,
} from "./index.js";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter and body", () => {
    const result = parseFrontmatter(
      `---\nname: demo-skill\nversion: 1.0.0\n---\n\n# Hello\n`,
    );
    expect(result.data.name).toBe("demo-skill");
    expect(result.body).toBe("# Hello");
  });

  it("rejects missing frontmatter", () => {
    expect(() => parseFrontmatter("# just markdown")).toThrow(/YAML frontmatter/);
  });
});

describe("mergeMetadata", () => {
  it("lets frontmatter win on conflicts", () => {
    const merged = mergeMetadata(
      { name: "from-frontmatter", version: "2.0.0" },
      { name: "from-file", author: "alice" },
    );
    expect(merged.name).toBe("from-frontmatter");
    expect(merged.author).toBe("alice");
    expect(merged.version).toBe("2.0.0");
  });
});

describe("parseSkillDirectory", () => {
  it("merges metadata.yaml under frontmatter", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-"));
    await writeFile(
      path.join(dir, "SKILL.md"),
      `---\nname: demo-skill\nversion: 1.0.0\n---\n\nBody\n`,
    );
    await writeFile(
      path.join(dir, "metadata.yaml"),
      `author: flareskill-community\nlicense: MIT\n`,
    );
    const parsed = await parseSkillDirectory(dir);
    expect(parsed.raw.name).toBe("demo-skill");
    expect(parsed.raw.author).toBe("flareskill-community");
    expect(parsed.body).toBe("Body");
  });

  it("fails when SKILL.md is missing", async () => {
    const empty = await mkdtemp(path.join(tmpdir(), "flareskill-empty-"));
    await expect(parseSkillDirectory(empty)).rejects.toThrow(/Missing SKILL.md/);
  });

  it("fails when metadata.yaml is not an object", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "flareskill-meta-"));
    await writeFile(
      path.join(dir, "SKILL.md"),
      `---\nname: demo-skill\n---\n\nBody\n`,
    );
    await writeFile(path.join(dir, "metadata.yaml"), `- just a list\n`);
    await expect(parseSkillDirectory(dir)).rejects.toThrow(/metadata.yaml/);
  });
});
