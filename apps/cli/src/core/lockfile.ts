import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { AgentName } from "@flareskill/agent-adapters";
import { pathExists } from "./filesystem.js";

export type LockfileSkill = {
  version: string;
  source: string;
  checksum: string;
  agent: AgentName;
};

export type Lockfile = {
  lockfileVersion: 1;
  skills: Record<string, LockfileSkill>;
};

const EMPTY: Lockfile = { lockfileVersion: 1, skills: {} };

export function lockfilePath(projectRoot: string): string {
  return path.join(projectRoot, "flareskill.lock");
}

export async function readLockfile(projectRoot: string): Promise<Lockfile> {
  const file = lockfilePath(projectRoot);
  if (!(await pathExists(file))) {
    return { ...EMPTY, skills: {} };
  }
  const raw = await readFile(file, "utf8");
  const parsed = parseYaml(raw) as Partial<Lockfile> | null;
  if (!parsed || typeof parsed !== "object") {
    return { ...EMPTY, skills: {} };
  }
  return {
    lockfileVersion: 1,
    skills: parsed.skills ?? {},
  };
}

export async function writeLockfile(
  projectRoot: string,
  lockfile: Lockfile,
): Promise<void> {
  const sorted: Lockfile = {
    lockfileVersion: 1,
    skills: Object.fromEntries(
      Object.entries(lockfile.skills).sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
  const body = stringifyYaml(sorted, { lineWidth: 0 });
  await writeFile(
    lockfilePath(projectRoot),
    body.endsWith("\n") ? body : `${body}\n`,
  );
}

export async function recordLockInstall(
  projectRoot: string,
  name: string,
  record: LockfileSkill,
): Promise<void> {
  const lockfile = await readLockfile(projectRoot);
  lockfile.skills[name] = record;
  await writeLockfile(projectRoot, lockfile);
}

export async function removeLockInstall(
  projectRoot: string,
  name: string,
): Promise<void> {
  const lockfile = await readLockfile(projectRoot);
  if (!lockfile.skills[name]) {
    return;
  }
  delete lockfile.skills[name];
  await writeLockfile(projectRoot, lockfile);
}
