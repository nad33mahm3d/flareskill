import {
  loadRegistryIndex,
  searchSkills,
} from "@flareskill/registry-client";
import { loadConfig, resolveRegistryUrl } from "../core/config.js";
import { findProjectRoot } from "../core/filesystem.js";

export async function runSearch(
  query: string,
  options: { registry?: string; limit?: number } = {},
): Promise<void> {
  const projectRoot = await findProjectRoot(process.cwd());
  const config = await loadConfig(projectRoot);
  const registryUrl = await resolveRegistryUrl(
    projectRoot,
    config,
    options.registry,
  );
  const { index } = await loadRegistryIndex(registryUrl);
  const hits = searchSkills(index, query);
  const limit = options.limit ?? 25;
  const shown = hits.slice(0, limit);

  if (shown.length === 0) {
    console.log(`No skills matched "${query}".`);
    return;
  }

  for (const skill of shown) {
    console.log(`${skill.name}@${skill.version}`);
    console.log(`  ${skill.description}`);
    console.log(
      `  category=${skill.category}  tags=${skill.tags.join(", ")}`,
    );
    console.log(`  install: npx flareskill install ${skill.name}`);
    console.log("");
  }

  if (hits.length > shown.length) {
    console.log(`Showing ${shown.length} of ${hits.length} matches.`);
  }
}
