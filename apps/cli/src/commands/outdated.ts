import {
  compareSemver,
  loadRegistryIndex,
  resolveEntry,
} from "@flareskill/registry-client";
import { loadConfig, resolveRegistryUrl } from "../core/config.js";
import { findProjectRoot } from "../core/filesystem.js";
import { readManifest } from "../core/manifest.js";

export async function runOutdated(
  options: {
    global?: boolean;
    registry?: string;
  } = {},
): Promise<number> {
  const projectRoot = await findProjectRoot(process.cwd());
  const scope = options.global ? "global" : "project";
  const manifest = await readManifest(scope, projectRoot);
  const names = Object.keys(manifest.skills).sort();

  if (names.length === 0) {
    console.log(`No ${scope} skills installed.`);
    return 0;
  }

  const config = await loadConfig(projectRoot);
  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index } = await loadRegistryIndex(registryUrl);

  const rows: Array<{
    name: string;
    current: string;
    latest: string;
  }> = [];

  for (const name of names) {
    const current = manifest.skills[name]!;
    if (current.source === "local") {
      continue;
    }
    let latest;
    try {
      latest = resolveEntry(index, name);
    } catch {
      continue;
    }
    if (compareSemver(latest.version, current.version) > 0) {
      rows.push({
        name,
        current: current.version,
        latest: latest.version,
      });
    }
  }

  if (rows.length === 0) {
    console.log("All installed registry skills are up to date.");
    return 0;
  }

  console.log("Outdated skills:");
  console.log("");
  for (const row of rows) {
    console.log(`  ${row.name}  ${row.current} → ${row.latest}`);
  }
  console.log("");
  console.log(`Run: npx flareskill update`);
  return rows.length;
}
