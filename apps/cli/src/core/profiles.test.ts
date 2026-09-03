import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  runProfileCreate,
  runProfileInfo,
  runProfileList,
} from "../commands/profile.js";
import { readLocalProfiles } from "./profiles.js";

const registryPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../registry/index.json",
);

describe("local profiles", () => {
  let projectRoot: string;
  let prevCwd: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(tmpdir(), "flareskill-profile-"));
    prevCwd = process.cwd();
    await mkdir(path.join(projectRoot, ".git"));
    process.chdir(projectRoot);
  });

  afterEach(() => {
    process.chdir(prevCwd);
  });

  it("creates a local profile file", async () => {
    await runProfileCreate("my-stack");
    const local = await readLocalProfiles(projectRoot);
    expect(local.map((p) => p.name)).toEqual(["my-stack"]);
    expect(local[0]?.skills.length).toBeGreaterThan(0);
  });

  it("lists and describes a created profile", async () => {
    await runProfileCreate("my-stack");
    const logs: string[] = [];
    const orig = console.log;
    console.log = (msg?: unknown) => {
      logs.push(String(msg ?? ""));
    };
    try {
      await runProfileList({ registry: registryPath });
      await runProfileInfo("my-stack", { registry: registryPath });
    } finally {
      console.log = orig;
    }
    expect(logs.some((line) => line.startsWith("my-stack"))).toBe(true);
    expect(logs.some((line) => line.includes("source: local"))).toBe(true);
    expect(logs.some((line) => line.startsWith("frontend"))).toBe(true);
  });
});
