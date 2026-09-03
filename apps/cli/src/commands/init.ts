import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { findProjectRoot, pathExists } from "../core/filesystem.js";
import { lockfilePath, writeLockfile } from "../core/lockfile.js";
import * as log from "../core/log.js";

export async function runInit(
  options: { force?: boolean; cwd?: string } = {},
): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const projectRoot = await findProjectRoot(cwd);
  const flareskillDir = path.join(projectRoot, ".flareskill");
  const configPath = path.join(flareskillDir, "config.yaml");
  const lockPath = lockfilePath(projectRoot);

  await mkdir(flareskillDir, { recursive: true });

  if ((await pathExists(configPath)) && !options.force) {
    log.info(`Keeping existing ${path.relative(projectRoot, configPath)}`);
  } else {
    const body = `registry:
  url: https://raw.githubusercontent.com/nad33mahm3d/flareskill/main/registry/index.json
defaults:
  agent: auto
skills:
  directory: .flareskill/skills
`;
    await writeFile(configPath, body);
    log.ok(`Wrote ${path.relative(projectRoot, configPath)}`);
  }

  if ((await pathExists(lockPath)) && !options.force) {
    log.info(`Keeping existing flareskill.lock`);
  } else {
    await writeLockfile(projectRoot, { lockfileVersion: 1, skills: {} });
    log.ok("Wrote flareskill.lock");
  }

  console.log("");
  console.log("Project ready. Next:");
  console.log("  npx flareskill search <query>");
  console.log("  npx flareskill install <skill>");
}
