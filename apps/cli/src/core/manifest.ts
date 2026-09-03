import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { AgentName } from "@flareskill/agent-adapters";

export type InstalledSkill = {
  version: string;
  source: string;
  checksum: string;
  agent: AgentName;
  scope: "project" | "global";
  installedAt: string;
  path: string;
};

export type Manifest = {
  skills: Record<string, InstalledSkill>;
};

const EMPTY: Manifest = { skills: {} };

function manifestPath(scope: "project" | "global", projectRoot: string): string {
  if (scope === "global") {
    return path.join(os.homedir(), ".flareskill", "installed.json");
  }
  return path.join(projectRoot, ".flareskill", "installed.json");
}

export async function readManifest(
  scope: "project" | "global",
  projectRoot: string,
): Promise<Manifest> {
  const file = manifestPath(scope, projectRoot);
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Manifest;
    return { skills: parsed.skills ?? {} };
  } catch {
    return { ...EMPTY, skills: {} };
  }
}

export async function writeManifest(
  scope: "project" | "global",
  projectRoot: string,
  manifest: Manifest,
): Promise<void> {
  const file = manifestPath(scope, projectRoot);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

export async function recordInstall(
  scope: "project" | "global",
  projectRoot: string,
  name: string,
  record: InstalledSkill,
): Promise<void> {
  const manifest = await readManifest(scope, projectRoot);
  manifest.skills[name] = record;
  await writeManifest(scope, projectRoot, manifest);
}

export async function removeInstall(
  scope: "project" | "global",
  projectRoot: string,
  name: string,
): Promise<boolean> {
  const manifest = await readManifest(scope, projectRoot);
  if (!manifest.skills[name]) {
    return false;
  }
  delete manifest.skills[name];
  await writeManifest(scope, projectRoot, manifest);
  return true;
}
