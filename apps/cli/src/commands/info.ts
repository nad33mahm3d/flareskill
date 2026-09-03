import {
  loadRegistryIndex,
  parseSkillRef,
  resolveEntry,
} from "@flareskill/registry-client";
import { loadConfig, resolveRegistryUrl } from "../core/config.js";
import { findProjectRoot } from "../core/filesystem.js";

export async function runInfo(
  ref: string,
  options: { registry?: string } = {},
): Promise<void> {
  const projectRoot = await findProjectRoot(process.cwd());
  const config = await loadConfig(projectRoot);
  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index } = await loadRegistryIndex(registryUrl);
  const { name, version } = parseSkillRef(ref);
  const entry = resolveEntry(index, name, version);

  console.log(`${entry.name}@${entry.version}`);
  console.log(entry.description);
  console.log(`category: ${entry.category}`);
  console.log(`tags: ${entry.tags.join(", ")}`);
  console.log(`author: ${entry.author}`);
  console.log(`license: ${entry.license}`);
  console.log(`checksum: sha256:${entry.checksum}`);
  if (entry.repository) {
    console.log(`repository: ${entry.repository}`);
  }
}
