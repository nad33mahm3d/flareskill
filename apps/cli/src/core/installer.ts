import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  formatAgentLabel,
  getAdapter,
  resolveAgent,
  type AgentName,
} from "@flareskill/agent-adapters";
import {
  downloadSkill,
  hashSkillDir,
  loadRegistryIndex,
  parseSkillRef,
  resolveDependencyOrder,
  resolveEntry,
  type RegistryEntry,
  type RegistryIndex,
} from "@flareskill/registry-client";
import { validateSkillDirectory } from "@flareskill/skill-validator";
import { loadConfig, resolveRegistryUrl } from "./config.js";
import { findProjectRoot, pathExists } from "./filesystem.js";
import { recordLockInstall } from "./lockfile.js";
import * as log from "./log.js";
import { readManifest, recordInstall } from "./manifest.js";

export type InstallOptions = {
  agent?: AgentName | "auto";
  global?: boolean;
  registry?: string;
  cwd?: string;
  /** Skip installing declared skill dependencies. */
  noDeps?: boolean;
  quiet?: boolean;
  /**
   * When syncing from lockfile: require registry checksum to match the lock.
   * Defaults to false for normal installs.
   */
  verifyLockChecksum?: boolean;
  /** Expected checksum from flareskill.lock (lock sync). */
  expectedLockChecksum?: string;
};

export type InstallResult = {
  name: string;
  version: string;
  status: "installed" | "skipped" | "updated";
};

export async function installSkill(
  refOrPath: string,
  options: InstallOptions = {},
): Promise<InstallResult[]> {
  const prevQuiet = log.isQuiet();
  if (options.quiet) {
    log.setQuiet(true);
  }
  try {
    return await installSkillInner(refOrPath, options);
  } finally {
    log.setQuiet(prevQuiet);
  }
}

async function installSkillInner(
  refOrPath: string,
  options: InstallOptions,
): Promise<InstallResult[]> {
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
  const results: InstallResult[] = [];

  const localSkill = path.resolve(cwd, refOrPath);
  const installingFromPath = await pathExists(path.join(localSkill, "SKILL.md"));

  if (installingFromPath) {
    const one = await installOne(localSkill, {
      source: "local",
      agent,
      scope,
      projectRoot,
      installOpts,
      force: true,
    });
    results.push(one);

    if (!options.noDeps) {
      const validation = await validateSkillDirectory(localSkill);
      const deps = validation.skill?.dependencies ?? [];
      if (deps.length > 0) {
        const registryUrl = await resolveRegistryUrl(
          projectRoot,
          config,
          options.registry,
        );
        const { index, source: indexSource, localRoot } =
          await loadRegistryIndex(registryUrl);
        log.ok(
          `Resolving ${deps.length} dependenc${deps.length === 1 ? "y" : "ies"}`,
        );
        for (const depRef of deps) {
          const depResults = await installRegistryRef(depRef, {
            index,
            indexSource,
            localRoot,
            agent,
            scope,
            projectRoot,
            installOpts,
            noDeps: true,
          });
          results.push(...depResults);
        }
      }
    }
    printInstallSummary(results);
    return results;
  }

  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index, source: indexSource, localRoot } =
    await loadRegistryIndex(registryUrl);
  const { name, version } = parseSkillRef(refOrPath);

  if (options.noDeps) {
    const entry = resolveEntry(index, name, version);
    if (options.verifyLockChecksum && options.expectedLockChecksum) {
      if (entry.checksum !== options.expectedLockChecksum) {
        throw new Error(
          `Lockfile checksum drift for ${entry.name}@${entry.version}: lock has ${options.expectedLockChecksum}, registry has ${entry.checksum}. Re-install or update the lockfile.`,
        );
      }
    }
    const one = await installRegistryEntry(entry, {
      indexSource,
      localRoot,
      agent,
      scope,
      projectRoot,
      installOpts,
    });
    results.push(one);
    printInstallSummary(results);
    return results;
  }

  const order = resolveDependencyOrder(index, name, version);
  if (order.length > 1) {
    log.ok(
      `Resolving ${order.length} skill${order.length === 1 ? "" : "s"} (${order.length - 1} dependenc${order.length === 2 ? "y" : "ies"})`,
    );
  }
  for (let i = 0; i < order.length; i += 1) {
    const entry = order[i]!;
    log.ok(`[${i + 1}/${order.length}] ${entry.name}@${entry.version}`);
    const one = await installRegistryEntry(entry, {
      indexSource,
      localRoot,
      agent,
      scope,
      projectRoot,
      installOpts,
    });
    results.push(one);
  }
  printInstallSummary(results);
  return results;
}

async function installRegistryRef(
  ref: string,
  ctx: {
    index: RegistryIndex;
    indexSource: string;
    localRoot?: string;
    agent: AgentName;
    scope: "project" | "global";
    projectRoot: string;
    installOpts: { global: boolean; projectRoot: string };
    noDeps?: boolean;
  },
): Promise<InstallResult[]> {
  const { name, version } = parseSkillRef(ref);
  if (ctx.noDeps) {
    const entry = resolveEntry(ctx.index, name, version);
    return [await installRegistryEntry(entry, ctx)];
  }
  const order = resolveDependencyOrder(ctx.index, name, version);
  const results: InstallResult[] = [];
  for (const item of order) {
    results.push(await installRegistryEntry(item, ctx));
  }
  return results;
}

async function installRegistryEntry(
  entry: RegistryEntry,
  ctx: {
    indexSource: string;
    localRoot?: string;
    agent: AgentName;
    scope: "project" | "global";
    projectRoot: string;
    installOpts: { global: boolean; projectRoot: string };
  },
): Promise<InstallResult> {
  const skipped = await maybeSkipInstalled(
    entry,
    ctx.scope,
    ctx.projectRoot,
    ctx.agent,
  );
  if (skipped) {
    return skipped;
  }

  log.ok(`Downloading ${entry.name}@${entry.version}`);
  const skillDir = await mkdtemp(
    path.join(os.tmpdir(), `flareskill-${entry.name}-`),
  );
  await downloadSkill(entry, skillDir, {
    indexUrl: ctx.indexSource,
    localRoot: ctx.localRoot,
  });
  return installOne(skillDir, {
    source: "registry",
    expectedChecksum: entry.checksum,
    agent: ctx.agent,
    scope: ctx.scope,
    projectRoot: ctx.projectRoot,
    installOpts: ctx.installOpts,
  });
}

async function maybeSkipInstalled(
  entry: RegistryEntry,
  scope: "project" | "global",
  projectRoot: string,
  agent: AgentName,
): Promise<InstallResult | null> {
  const manifest = await readManifest(scope, projectRoot);
  const current = manifest.skills[entry.name];
  if (!current) {
    return null;
  }
  if (
    current.version === entry.version &&
    current.checksum === entry.checksum &&
    current.agent === agent
  ) {
    log.ok(`Already installed ${entry.name}@${entry.version} (skipping)`);
    return {
      name: entry.name,
      version: entry.version,
      status: "skipped",
    };
  }
  return null;
}

async function installOne(
  skillDir: string,
  ctx: {
    source: string;
    expectedChecksum?: string;
    agent: AgentName;
    scope: "project" | "global";
    projectRoot: string;
    installOpts: { global: boolean; projectRoot: string };
  },
): Promise<InstallResult> {
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
  log.ok(`Validated ${validation.skill.name}@${validation.skill.version}`);

  const checksum = await hashSkillDir(skillDir);
  if (ctx.expectedChecksum && checksum !== ctx.expectedChecksum) {
    throw new Error(
      `Checksum mismatch for ${validation.skill.name} (expected ${ctx.expectedChecksum}, got ${checksum})`,
    );
  }

  const manifest = await readManifest(ctx.scope, ctx.projectRoot);
  const previous = manifest.skills[validation.skill.name];
  const status: InstallResult["status"] =
    previous && previous.version !== validation.skill.version
      ? "updated"
      : "installed";

  const adapter = getAdapter(ctx.agent);
  const dest = await adapter.install(validation.skill, ctx.installOpts);
  log.ok(`Installed → ${dest}`);
  log.info(`Agent: ${formatAgentLabel(ctx.agent)}`);

  await recordInstall(ctx.scope, ctx.projectRoot, validation.skill.name, {
    version: validation.skill.version,
    source: ctx.source,
    checksum,
    agent: ctx.agent,
    scope: ctx.scope,
    installedAt: new Date().toISOString(),
    path: dest,
  });

  if (ctx.scope === "project") {
    await recordLockInstall(ctx.projectRoot, validation.skill.name, {
      version: validation.skill.version,
      source: ctx.source,
      checksum,
      agent: ctx.agent,
    });
  }

  return {
    name: validation.skill.name,
    version: validation.skill.version,
    status,
  };
}

function printInstallSummary(results: InstallResult[]): void {
  if (results.length === 0) {
    return;
  }
  const installed = results.filter((r) => r.status === "installed").length;
  const updated = results.filter((r) => r.status === "updated").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  log.summary("");
  log.summary(
    `Done: ${installed} installed, ${updated} updated, ${skipped} skipped.`,
  );
  for (const row of results) {
    const mark =
      row.status === "skipped" ? "·" : row.status === "updated" ? "↑" : "✔";
    log.summary(`  ${mark} ${row.name}@${row.version} (${row.status})`);
  }
}
