import { findProjectRoot } from "../core/filesystem.js";
import { readManifest, type InstalledSkill } from "../core/manifest.js";

export async function runList(): Promise<void> {
  const projectRoot = await findProjectRoot(process.cwd());
  const project = await readManifest("project", projectRoot);
  const global = await readManifest("global", projectRoot);

  const rows: Array<{ name: string; record: InstalledSkill }> = [
    ...Object.entries(project.skills).map(([name, record]) => ({ name, record })),
    ...Object.entries(global.skills).map(([name, record]) => ({ name, record })),
  ];

  if (rows.length === 0) {
    console.log("No skills installed.");
    return;
  }

  for (const { name, record } of rows) {
    console.log(
      `${name}@${record.version}  agent=${record.agent}  scope=${record.scope}`,
    );
  }
}
