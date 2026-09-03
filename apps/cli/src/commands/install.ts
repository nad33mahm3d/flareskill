import { AGENT_NAMES, isAgentName, type AgentName } from "@flareskill/agent-adapters";
import {
  loadRegistryIndex,
  resolveEntry,
} from "@flareskill/registry-client";
import { loadConfig, resolveRegistryUrl } from "../core/config.js";
import { findProjectRoot } from "../core/filesystem.js";
import { installSkill } from "../core/installer.js";
import { readLockfile } from "../core/lockfile.js";
import * as log from "../core/log.js";

export async function runInstall(
  ref: string | undefined,
  options: {
    agent?: string;
    global?: boolean;
    registry?: string;
    noDeps?: boolean;
    quiet?: boolean;
  },
): Promise<void> {
  if (!ref) {
    if (options.global) {
      throw new Error(
        "Lockfile sync is project-scoped. Omit --global, or pass a skill name.",
      );
    }
    await installFromLockfile(options);
    return;
  }

  const agent = parseAgent(options.agent);
  await installSkill(ref, {
    agent,
    global: options.global,
    registry: options.registry,
    noDeps: options.noDeps,
    quiet: options.quiet,
  });
}

async function installFromLockfile(options: {
  agent?: string;
  registry?: string;
  quiet?: boolean;
}): Promise<void> {
  const projectRoot = await findProjectRoot(process.cwd());
  const lockfile = await readLockfile(projectRoot);
  const entries = Object.entries(lockfile.skills);

  if (entries.length === 0) {
    console.log("No skills in flareskill.lock. Nothing to install.");
    return;
  }

  const config = await loadConfig(projectRoot);
  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index } = await loadRegistryIndex(registryUrl);

  const overrideAgent = parseAgent(options.agent);
  log.ok(`Syncing ${entries.length} skill(s) from flareskill.lock`);

  for (const [name, record] of entries) {
    if (record.source === "local") {
      log.warn(
        `Skipping ${name}: lockfile entry is local (reinstall from path manually)`,
      );
      continue;
    }

    let entry;
    try {
      entry = resolveEntry(index, name, record.version);
    } catch {
      throw new Error(
        `Lockfile skill ${name}@${record.version} not found in registry`,
      );
    }
    if (entry.checksum !== record.checksum) {
      throw new Error(
        `Lockfile checksum drift for ${name}@${record.version}: lock has ${record.checksum}, registry has ${entry.checksum}. Re-run install for that skill or update the lockfile.`,
      );
    }

    await installSkill(`${name}@${record.version}`, {
      agent: overrideAgent ?? record.agent,
      registry: options.registry,
      noDeps: true,
      quiet: options.quiet,
      verifyLockChecksum: true,
      expectedLockChecksum: record.checksum,
    });
  }
}

function parseAgent(value: string | undefined): AgentName | "auto" | undefined {
  if (!value) {
    return undefined;
  }
  if (value === "auto") {
    return "auto";
  }
  if (isAgentName(value)) {
    return value;
  }
  throw new Error(
    `Unknown agent "${value}". Use ${AGENT_NAMES.join(", ")}, or auto.`,
  );
}
