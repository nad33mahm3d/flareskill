import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runInit } from "./commands/init.js";
import { runInstall } from "./commands/install.js";
import { runOutdated } from "./commands/outdated.js";
import { runUninstall } from "./commands/uninstall.js";
import { readLockfile, writeLockfile } from "./core/lockfile.js";
import { readManifest } from "./core/manifest.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const registryPath = path.join(repoRoot, "registry", "index.json");

describe("e2e install → lock → uninstall", () => {
  let projectRoot: string;
  let homeDir: string;
  let prevHome: string | undefined;
  let prevCwd: string;

  beforeEach(async () => {
    projectRoot = await mkdtemp(path.join(tmpdir(), "flareskill-e2e-"));
    homeDir = await mkdtemp(path.join(tmpdir(), "flareskill-home-"));
    prevHome = process.env.HOME;
    prevCwd = process.cwd();
    process.env.HOME = homeDir;
    await mkdir(path.join(projectRoot, ".git"));
    process.chdir(projectRoot);
  });

  afterEach(async () => {
    process.chdir(prevCwd);
    process.env.HOME = prevHome;
    await rm(projectRoot, { recursive: true, force: true });
    await rm(homeDir, { recursive: true, force: true });
  });

  it("installs from local registry, writes lock, and uninstalls", async () => {
    await runInit({ cwd: projectRoot });
    await runInstall("senior-react-engineer", {
      agent: "generic",
      registry: registryPath,
    });

    const lock = await readLockfile(projectRoot);
    expect(lock.skills["senior-react-engineer"]).toBeDefined();
    expect(lock.skills["senior-react-engineer"]?.version).toBe("1.0.0");
    expect(lock.skills["senior-react-engineer"]?.checksum).toMatch(/^[a-f0-9]+$/);

    const manifest = await readManifest("project", projectRoot);
    expect(manifest.skills["senior-react-engineer"]?.agent).toBe("generic");

    const skillMd = await readFile(
      path.join(
        projectRoot,
        ".flareskill",
        "skills",
        "senior-react-engineer",
        "SKILL.md",
      ),
      "utf8",
    );
    expect(skillMd).toContain("senior-react-engineer");

    await runInstall("senior-react-engineer", {
      agent: "generic",
      registry: registryPath,
      quiet: true,
    });

    expect(await runOutdated({ registry: registryPath })).toBe(0);

    await runUninstall("senior-react-engineer");
    const after = await readManifest("project", projectRoot);
    expect(after.skills["senior-react-engineer"]).toBeUndefined();
    const lockAfter = await readLockfile(projectRoot);
    expect(lockAfter.skills["senior-react-engineer"]).toBeUndefined();
  });

  it("installs transitive dependencies and skips when already present", async () => {
    await runInstall("senior-nextjs-engineer", {
      agent: "generic",
      registry: registryPath,
    });
    const lock = await readLockfile(projectRoot);
    expect(lock.skills["senior-react-engineer"]).toBeDefined();
    expect(lock.skills["senior-nextjs-engineer"]).toBeDefined();

    await runInstall("senior-nextjs-engineer", {
      agent: "generic",
      registry: registryPath,
      quiet: true,
    });
  });

  it("fails lock sync when checksum drifts", async () => {
    await runInstall("docker-engineer", {
      agent: "generic",
      registry: registryPath,
    });
    const lock = await readLockfile(projectRoot);
    lock.skills["docker-engineer"]!.checksum = "deadbeef".repeat(8);
    await writeLockfile(projectRoot, lock);

    await expect(
      runInstall(undefined, {
        agent: "generic",
        registry: registryPath,
      }),
    ).rejects.toThrow(/checksum drift/i);
  });

  it("installs into claude and codex agent roots", async () => {
    await runInstall("qa-engineer", {
      agent: "claude",
      registry: registryPath,
    });
    const claudeMd = await readFile(
      path.join(projectRoot, ".claude", "skills", "qa-engineer", "SKILL.md"),
      "utf8",
    );
    expect(claudeMd).toContain("qa-engineer");

    await runInstall("qa-engineer", {
      agent: "codex",
      registry: registryPath,
    });
    const codexMd = await readFile(
      path.join(projectRoot, ".agents", "skills", "qa-engineer", "SKILL.md"),
      "utf8",
    );
    expect(codexMd).toContain("qa-engineer");
  });
});
