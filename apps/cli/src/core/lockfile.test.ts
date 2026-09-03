import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  readLockfile,
  recordLockInstall,
  removeLockInstall,
} from "./lockfile.js";

describe("lockfile", () => {
  it("records and removes project lock entries", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "flareskill-lock-"));
    await recordLockInstall(root, "demo-skill", {
      version: "1.2.0",
      source: "registry",
      checksum: "abc",
      agent: "cursor",
    });
    const written = await readLockfile(root);
    expect(written.skills["demo-skill"]).toEqual({
      version: "1.2.0",
      source: "registry",
      checksum: "abc",
      agent: "cursor",
    });
    await removeLockInstall(root, "demo-skill");
    const cleared = await readLockfile(root);
    expect(cleared.skills["demo-skill"]).toBeUndefined();
  });
});
