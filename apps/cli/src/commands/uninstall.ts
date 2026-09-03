import { getAdapter, type AgentName } from "@flareskill/agent-adapters";
import { findProjectRoot } from "../core/filesystem.js";
import { removeLockInstall } from "../core/lockfile.js";
import * as log from "../core/log.js";
import { readManifest, removeInstall } from "../core/manifest.js";

export async function runUninstall(
  name: string,
  options: { global?: boolean } = {},
): Promise<void> {
  const projectRoot = await findProjectRoot(process.cwd());
  const scope = options.global ? "global" : "project";
  const manifest = await readManifest(scope, projectRoot);
  const record = manifest.skills[name];
  if (!record) {
    throw new Error(
      `Skill "${name}" is not installed in ${scope} scope. Try --global if it was installed globally.`,
    );
  }

  const adapter = getAdapter(record.agent as AgentName);
  await adapter.uninstall(name, {
    global: scope === "global",
    projectRoot,
  });
  await removeInstall(scope, projectRoot, name);
  if (scope === "project") {
    await removeLockInstall(projectRoot, name);
  }
  log.ok(`Uninstalled ${name}`);
}
