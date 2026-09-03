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
});
