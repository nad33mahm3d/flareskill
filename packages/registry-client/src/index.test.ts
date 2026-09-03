import { describe, expect, it } from "vitest";
import {
  parseDependencyRef,
  parseSkillRef,
  resolveDependencyOrder,
  resolveEntry,
  resolveProfile,
  searchSkills,
  versionSatisfies,
  type RegistryIndex,
} from "./index.js";

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

describe("searchSkills", () => {
  const index: RegistryIndex = {
    version: 1,
    skills: [
      {
        name: "senior-react-engineer",
        version: "1.0.0",
        category: "frontend",
        description: "Production-grade React engineering.",
        tags: ["react", "frontend", "typescript"],
        author: "flareskill-community",
        license: "MIT",
        path: "skills/frontend/senior-react-engineer",
        files: ["SKILL.md"],
        checksum: "a",
      },
      {
        name: "security-engineer",
        version: "1.0.0",
        category: "security",
        description: "Application security engineering.",
        tags: ["security", "appsec"],
        author: "flareskill-community",
        license: "MIT",
        path: "skills/security/security-engineer",
        files: ["SKILL.md"],
        checksum: "b",
      },
    ],
  };

  it("finds skills by tag or name fragment", () => {
    const hits = searchSkills(index, "react");
    expect(hits.map((skill) => skill.name)).toEqual(["senior-react-engineer"]);
  });

  it("finds by category", () => {
    const hits = searchSkills(index, "security");
    expect(hits.some((skill) => skill.name === "security-engineer")).toBe(true);
  });
});

describe("dependencies", () => {
  const index: RegistryIndex = {
    version: 1,
    skills: [
      {
        name: "security-engineer",
        version: "1.0.0",
        category: "security",
        description: "sec",
        tags: ["security"],
        author: "a",
        license: "MIT",
        path: "skills/security/security-engineer",
        files: ["SKILL.md"],
        checksum: "s",
      },
      {
        name: "code-reviewer",
        version: "1.2.0",
        category: "engineering",
        description: "review",
        tags: ["review"],
        author: "a",
        license: "MIT",
        path: "skills/engineering/code-reviewer",
        files: ["SKILL.md"],
        checksum: "c",
        dependencies: ["security-engineer@1.x"],
      },
      {
        name: "senior-spring-boot-engineer",
        version: "1.0.0",
        category: "backend",
        description: "spring",
        tags: ["java"],
        author: "a",
        license: "MIT",
        path: "skills/backend/senior-spring-boot-engineer",
        files: ["SKILL.md"],
        checksum: "j",
        dependencies: ["code-reviewer@^1.0.0"],
      },
    ],
  };

  it("parses dependency refs and ranges", () => {
    expect(parseDependencyRef("code-reviewer@1.x")).toEqual({
      name: "code-reviewer",
      range: "1.x",
    });
    expect(versionSatisfies("1.2.0", "1.x")).toBe(true);
    expect(versionSatisfies("2.0.0", "1.x")).toBe(false);
    expect(versionSatisfies("1.2.0", "^1.0.0")).toBe(true);
  });

  it("orders transitive dependencies before the root", () => {
    const order = resolveDependencyOrder(
      index,
      "senior-spring-boot-engineer",
    ).map((skill) => skill.name);
    expect(order).toEqual([
      "security-engineer",
      "code-reviewer",
      "senior-spring-boot-engineer",
    ]);
  });

  it("detects circular dependencies", () => {
    const cyclic: RegistryIndex = {
      version: 1,
      skills: [
        {
          name: "a-skill",
          version: "1.0.0",
          category: "engineering",
          description: "a",
          tags: ["a"],
          author: "a",
          license: "MIT",
          path: "a",
          files: ["SKILL.md"],
          checksum: "a",
          dependencies: ["b-skill"],
        },
        {
          name: "b-skill",
          version: "1.0.0",
          category: "engineering",
          description: "b",
          tags: ["b"],
          author: "a",
          license: "MIT",
          path: "b",
          files: ["SKILL.md"],
          checksum: "b",
          dependencies: ["a-skill"],
        },
      ],
    };
    expect(() => resolveDependencyOrder(cyclic, "a-skill")).toThrow(/Circular/);
  });
});

describe("resolveProfile", () => {
  it("finds a named profile", () => {
    const index: RegistryIndex = {
      version: 1,
      skills: [],
      profiles: [
        {
          name: "frontend",
          description: "UI",
          skills: ["senior-react-engineer"],
        },
      ],
    };
    expect(resolveProfile(index, "frontend").skills).toEqual([
      "senior-react-engineer",
    ]);
    expect(() => resolveProfile(index, "missing")).toThrow(/not found/);
  });
});
