import { describe, expect, it } from "vitest";
import { parseSkillRef, resolveEntry, type RegistryIndex } from "./index.js";

describe("parseSkillRef", () => {
  it("parses name and version", () => {
    expect(parseSkillRef("senior-react-engineer@1.2.0")).toEqual({
      name: "senior-react-engineer",
      version: "1.2.0",
    });
    expect(parseSkillRef("senior-react-engineer")).toEqual({
      name: "senior-react-engineer",
    });
  });
});

describe("resolveEntry", () => {
  const index: RegistryIndex = {
    version: 1,
    skills: [
      {
        name: "demo-skill",
        version: "1.0.0",
        category: "engineering",
        description: "d",
        tags: ["t"],
        author: "a",
        license: "MIT",
        path: "skills/engineering/demo-skill",
        files: ["SKILL.md"],
        checksum: "abc",
      },
      {
        name: "demo-skill",
        version: "1.1.0",
        category: "engineering",
        description: "d",
        tags: ["t"],
        author: "a",
        license: "MIT",
        path: "skills/engineering/demo-skill",
        files: ["SKILL.md"],
        checksum: "def",
      },
    ],
  };

  it("picks the latest version by default", () => {
    expect(resolveEntry(index, "demo-skill").version).toBe("1.1.0");
  });

  it("resolves an exact version", () => {
    expect(resolveEntry(index, "demo-skill", "1.0.0").checksum).toBe("abc");
  });
});
