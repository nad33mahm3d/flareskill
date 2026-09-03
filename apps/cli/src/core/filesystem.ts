import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";

export async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function findProjectRoot(startDir: string): Promise<string> {
  let current = path.resolve(startDir);
  while (true) {
    const markers = [
      path.join(current, ".flareskill"),
      path.join(current, ".git"),
      path.join(current, "package.json"),
    ];
    for (const marker of markers) {
      if (await pathExists(marker)) {
        return current;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return path.resolve(startDir);
    }
    current = parent;
  }
}

export async function findSkillDirs(root: string): Promise<string[]> {
  const resolved = path.resolve(root);
  const info = await stat(resolved);
  if (!info.isDirectory()) {
    throw new Error(`Not a directory: ${root}`);
  }
  if (await pathExists(path.join(resolved, "SKILL.md"))) {
    return [resolved];
  }

  const found: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && entry.name === "SKILL.md")) {
      found.push(current);
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name.startsWith("_")
      ) {
        continue;
      }
      await walk(path.join(current, entry.name));
    }
  }

  await walk(resolved);
  return found.sort();
}

export function titleFromName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
