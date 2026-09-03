import path from "node:path";
import { AGENT_NAMES, isAgentName, type AgentName } from "@flareskill/agent-adapters";
import { loadRegistryIndex } from "@flareskill/registry-client";
import { loadConfig, resolveRegistryUrl } from "../core/config.js";
import { findProjectRoot } from "../core/filesystem.js";
import { installSkill } from "../core/installer.js";
import * as log from "../core/log.js";
import { readManifest } from "../core/manifest.js";
import {
  findMergedProfile,
  mergeProfiles,
  readLocalProfiles,
  writeLocalProfile,
} from "../core/profiles.js";

type SharedOpts = {
  registry?: string;
  global?: boolean;
  agent?: string;
  quiet?: boolean;
  noDeps?: boolean;
};

async function loadMerged(options: { registry?: string }) {
  const projectRoot = await findProjectRoot(process.cwd());
  const config = await loadConfig(projectRoot);
  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index } = await loadRegistryIndex(registryUrl);
  const local = await readLocalProfiles(projectRoot);
  return {
    projectRoot,
    profiles: mergeProfiles(index.profiles, local),
  };
}

export async function runProfileList(
  options: { registry?: string } = {},
): Promise<void> {
  const { projectRoot, profiles } = await loadMerged(options);
  const local = await readLocalProfiles(projectRoot);
  const localNames = new Set(local.map((profile) => profile.name));

  if (profiles.length === 0) {
    console.log("No profiles found.");
    return;
  }

  for (const profile of profiles) {
    const source = localNames.has(profile.name) ? "local" : "registry";
    console.log(
      `${profile.name}  (${profile.skills.length} skills, ${source})`,
    );
    if (profile.description) {
      console.log(`  ${profile.description}`);
    }
  }
}

export async function runProfileInfo(
  name: string,
  options: { registry?: string } = {},
): Promise<void> {
  const { projectRoot, profiles } = await loadMerged(options);
  const profile = findMergedProfile(profiles, name);
  const local = await readLocalProfiles(projectRoot);
  const source = local.some((item) => item.name === name) ? "local" : "registry";

  console.log(profile.name);
  console.log(profile.description || "(no description)");
  console.log(`source: ${source}`);
  console.log("skills:");
  for (const ref of profile.skills) {
    console.log(`  - ${ref}`);
  }
  console.log("");
  console.log(`install: npx flareskill profile install ${profile.name}`);
}

export async function runProfileInstall(
  name: string,
  options: SharedOpts = {},
): Promise<void> {
  const { profiles } = await loadMerged(options);
  const profile = findMergedProfile(profiles, name);
  log.ok(
    `Installing profile ${profile.name} (${profile.skills.length} skill${profile.skills.length === 1 ? "" : "s"})`,
  );

  for (const ref of profile.skills) {
    await installSkill(ref, {
      agent: parseAgent(options.agent),
      global: options.global,
      registry: options.registry,
      noDeps: options.noDeps,
      quiet: options.quiet,
    });
  }
}

export async function runProfileCreate(
  name: string,
  options: { fromInstalled?: boolean; force?: boolean } = {},
): Promise<void> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `Invalid profile name "${name}". Use lowercase letters, numbers, and hyphens.`,
    );
  }

  const projectRoot = await findProjectRoot(process.cwd());
  const existing = await readLocalProfiles(projectRoot);
  if (existing.some((profile) => profile.name === name) && !options.force) {
    throw new Error(
      `Local profile "${name}" already exists. Pass --force to overwrite.`,
    );
  }

  let skills: string[] = [];
  if (options.fromInstalled) {
    const manifest = await readManifest("project", projectRoot);
    skills = Object.keys(manifest.skills).sort();
    if (skills.length === 0) {
      throw new Error("No project skills installed to snapshot.");
    }
  }

  const dest = await writeLocalProfile(projectRoot, {
    name,
    description: options.fromInstalled
      ? `Snapshot of project skills (${new Date().toISOString().slice(0, 10)})`
      : `TODO. Describe this ${name} profile.`,
    skills: skills.length > 0 ? skills : ["senior-react-engineer"],
  });
  log.ok(`Wrote ${path.relative(projectRoot, dest)}`);
  console.log(`Edit the file, then: npx flareskill profile install ${name}`);
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
