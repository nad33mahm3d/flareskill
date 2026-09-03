import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCreate } from "./commands/create.js";
import { runValidate } from "./commands/validate.js";

describe("create + validate", () => {
  it("scaffolds a skill that passes validation", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "flareskill-create-"));
    await runCreate("demo-new-skill", { cwd });
    const code = await runValidate(path.join(cwd, "demo-new-skill"));
    // Template description is valid (non-empty); scaffold should pass schema.
    expect(code).toBe(0);
  });
});
