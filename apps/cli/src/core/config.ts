import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { DEFAULT_REGISTRY_URL } from "@flareskill/registry-client";
import type { AgentName } from "@flareskill/agent-adapters";
import { pathExists } from "./filesystem.js";

export type FlareSkillConfig = {
  registry: { url: string };
  defaults: { agent: AgentName | "auto" };
  skills: { directory: string };
};

const DEFAULT_CONFIG: FlareSkillConfig = {
  registry: { url: DEFAULT_REGISTRY_URL },
  defaults: { agent: "auto" },
  skills: { directory: ".flareskill/skills" },
};

function mergeConfig(
  base: FlareSkillConfig,
  overlay: Partial<FlareSkillConfig> | undefined,
): FlareSkillConfig {
  if (!overlay) {
    return base;
  }
  return {
    registry: { ...base.registry, ...overlay.registry },
    defaults: { ...base.defaults, ...overlay.defaults },
    skills: { ...base.skills, ...overlay.skills },
  };
}

async function readYamlConfig(filePath: string): Promise<Partial<FlareSkillConfig>> {
  if (!(await pathExists(filePath))) {
    return {};
  }
  const raw = await readFile(filePath, "utf8");
  const parsed = parseYaml(raw);
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Partial<FlareSkillConfig>;
}

export async function loadConfig(projectRoot: string): Promise<FlareSkillConfig> {
  const globalFile = path.join(os.homedir(), ".flareskill", "config.yaml");
  const projectFile = path.join(projectRoot, ".flareskill", "config.yaml");
  const fromEnv = process.env.FLARESKILL_REGISTRY
    ? { registry: { url: process.env.FLARESKILL_REGISTRY } }
    : undefined;
  const global = await readYamlConfig(globalFile);
  const project = await readYamlConfig(projectFile);
  return mergeConfig(
    mergeConfig(mergeConfig(DEFAULT_CONFIG, global), fromEnv as Partial<FlareSkillConfig>),
    project,
  );
}

export async function resolveRegistryUrl(
  projectRoot: string,
  config: FlareSkillConfig,
  override?: string,
): Promise<string> {
  if (override) {
    return override;
  }
  const localIndex = path.join(projectRoot, "registry", "index.json");
  if (await pathExists(localIndex)) {
    return localIndex;
  }
  const cwdIndex = path.join(process.cwd(), "registry", "index.json");
  if (cwdIndex !== localIndex && (await pathExists(cwdIndex))) {
    return cwdIndex;
  }
  return config.registry.url;
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}
