import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  getAdapter,
  resolveAgent,
  type AgentName,
} from "@flareskill/agent-adapters";
import {
  downloadSkill,
  hashSkillDir,
  loadRegistryIndex,
  parseSkillRef,
  resolveEntry,
  type RegistryEntry,
} from "@flareskill/registry-client";
import { validateSkillDirectory } from "@flareskill/skill-validator";
import { loadConfig, resolveRegistryUrl } from "./config.js";
import { findProjectRoot, pathExists } from "./filesystem.js";
import * as log from "./log.js";
import { recordInstall } from "./manifest.js";

export type InstallOptions = {
  agent?: AgentName | "auto";
  global?: boolean;
  registry?: string;
  cwd?: string;
};

export async function installSkill(
  refOrPath: string,
  options: InstallOptions = {},
): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const projectRoot = await findProjectRoot(cwd);
  const config = await loadConfig(projectRoot);
  const scope = options.global ? "global" : "project";
  const requestedAgent = options.agent ?? config.defaults.agent;
  const installOpts = {
    global: Boolean(options.global),
    projectRoot,
  };
  const agent = await resolveAgent(requestedAgent, installOpts);

  const localSkill = path.resolve(cwd, refOrPath);
  const installingFromPath = await pathExists(path.join(localSkill, "SKILL.md"));

  let skillDir: string;
  let source: string;
  let entry: RegistryEntry | undefined;
  let expectedChecksum: string | undefined;

  if (installingFromPath) {
    skillDir = localSkill;
    source = "local";
    log.ok("Found local skill");
  } else {
    const registryUrl = await resolveRegistryUrl(
      projectRoot,
      config,
      options.registry,
    );
    const { index, source: indexSource, localRoot } = await loadRegistryIndex(
      registryUrl,
    );
    const { name, version } = parseSkillRef(refOrPath);
    entry = resolveEntry(index, name, version);
    log.ok("Found skill");
    log.ok(`Version: ${entry.version}`);

    skillDir = await mkdtemp(path.join(os.tmpdir(), `flareskill-${entry.name}-`));
    await downloadSkill(entry, skillDir, {
      indexUrl: indexSource,
      localRoot,
    });
    source = "registry";
    expectedChecksum = entry.checksum;
  }

  const validation = await validateSkillDirectory(skillDir);
  for (const warning of validation.warnings) {
    log.warn(warning.message);
  }
  if (!validation.ok || !validation.skill) {
    for (const error of validation.errors) {
      log.fail(error.message);
    }
    throw new Error("Skill validation failed");
  }
  log.ok("Validated");

  const checksum = await hashSkillDir(skillDir);
  if (expectedChecksum && checksum !== expectedChecksum) {
    throw new Error(
      `Checksum mismatch for ${validation.skill.name} (expected ${expectedChecksum}, got ${checksum})`,
    );
  }

  const adapter = getAdapter(agent);
  const dest = await adapter.install(validation.skill, installOpts);
  log.ok("Installed");
  log.ok(`Agent: ${agent === "cursor" ? "Cursor" : "Generic"}`);

  await recordInstall(scope, projectRoot, validation.skill.name, {
    version: validation.skill.version,
    source,
    checksum,
    agent,
    scope,
    installedAt: new Date().toISOString(),
    path: dest,
  });

  console.log("");
  console.log(`${title(validation.skill.name)} is ready.`);
}

function title(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
