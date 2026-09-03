import {
  compareSemver,
  loadRegistryIndex,
  resolveEntry,
} from "@flareskill/registry-client";
import {
  AGENT_NAMES,
  isAgentName,
  type AgentName,
} from "@flareskill/agent-adapters";
import { loadConfig, resolveRegistryUrl } from "../core/config.js";
import { findProjectRoot } from "../core/filesystem.js";
import { installSkill } from "../core/installer.js";
import * as log from "../core/log.js";
import { readManifest } from "../core/manifest.js";

export async function runUpdate(
  names: string[],
  options: {
    global?: boolean;
    registry?: string;
    agent?: string;
  } = {},
): Promise<void> {
  const projectRoot = await findProjectRoot(process.cwd());
  const scope = options.global ? "global" : "project";
  const manifest = await readManifest(scope, projectRoot);
  const installedNames =
    names.length > 0 ? names : Object.keys(manifest.skills);

  if (installedNames.length === 0) {
    console.log("No installed skills to update.");
    return;
  }

  const config = await loadConfig(projectRoot);
  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index } = await loadRegistryIndex(registryUrl);
  const agentOverride = parseAgent(options.agent);

  let updated = 0;
  let skipped = 0;

  for (const name of installedNames) {
    const current = manifest.skills[name];
    if (!current) {
      log.warn(`Skipping ${name}: not installed in ${scope} scope`);
      skipped += 1;
      continue;
    }
    if (current.source === "local") {
      log.warn(`Skipping ${name}: installed from a local path`);
      skipped += 1;
      continue;
    }

    let latest;
    try {
      latest = resolveEntry(index, name);
    } catch {
      log.warn(`Skipping ${name}: not found in registry`);
      skipped += 1;
      continue;
    }

    if (compareSemver(latest.version, current.version) <= 0) {
      log.ok(`${name} already at ${current.version}`);
      skipped += 1;
      continue;
    }

    log.ok(`Updating ${name}: ${current.version} → ${latest.version}`);
    await installSkill(`${name}@${latest.version}`, {
      global: options.global,
      registry: options.registry,
      agent: agentOverride ?? current.agent,
    });
    updated += 1;
  }

  console.log("");
  console.log(`Updated ${updated}, skipped ${skipped}.`);
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
