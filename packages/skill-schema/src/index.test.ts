import { describe, expect, it } from "vitest";
import { skillMetadataSchema } from "./index.js";

describe("skillMetadataSchema", () => {
  const valid = {
    name: "senior-react-engineer",
    version: "1.0.0",
    description: "Production-grade React engineering skill.",
    author: "flareskill-community",
    license: "MIT",
    tags: ["react", "frontend"],
    category: "frontend" as const,
  };

  it("accepts valid metadata", () => {
    expect(skillMetadataSchema.parse(valid).name).toBe("senior-react-engineer");
  });

  it("rejects invalid names", () => {
    expect(() =>
      skillMetadataSchema.parse({ ...valid, name: "Senior_React" }),
    ).toThrow();
  });

  it("rejects non-semver versions", () => {
    expect(() =>
      skillMetadataSchema.parse({ ...valid, version: "1.0" }),
    ).toThrow();
  });

  it("accepts dependency ranges and known agents", () => {
    const parsed = skillMetadataSchema.parse({
      ...valid,
      dependencies: ["security-engineer@1.x", "code-reviewer@^1.0.0"],
      agents: ["cursor", "claude", "codex", "generic"],
    });
    expect(parsed.dependencies).toHaveLength(2);
    expect(parsed.agents).toContain("claude");
  });

  it("rejects unknown agents", () => {
    expect(() =>
      skillMetadataSchema.parse({ ...valid, agents: ["copilot"] }),
    ).toThrow();
  });
});
