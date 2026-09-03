import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSkillDirectory } from "@flareskill/skill-validator";

export const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/nad33mahm3d/flareskill/main/registry/index.json";

export type RegistryEntry = {
  name: string;
  version: string;
  category: string;
  description: string;
  tags: string[];
  author: string;
  license: string;
  path: string;
  files: string[];
  checksum: string;
  repository?: string;
};

export type RegistryIndex = {
  version: 1;
  skills: RegistryEntry[];
};

export class RegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistryError";
  }
}

export function parseSkillRef(ref: string): { name: string; version?: string } {
  const at = ref.lastIndexOf("@");
  if (at > 0) {
    return { name: ref.slice(0, at), version: ref.slice(at + 1) };
  }
  return { name: ref };
}

export function resolveEntry(
  index: RegistryIndex,
  name: string,
  version?: string,
): RegistryEntry {
  const matches = index.skills.filter((skill) => skill.name === name);
  if (matches.length === 0) {
    throw new RegistryError(`Skill not found: ${name}`);
  }
  if (version) {
    const exact = matches.find((skill) => skill.version === version);
    if (!exact) {
      throw new RegistryError(`Skill ${name}@${version} not found`);
    }
    return exact;
  }
  return matches.reduce((latest, skill) =>
    compareSemver(skill.version, latest.version) > 0 ? skill : latest,
  );
}

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) {
      return da - db;
    }
  }
  return 0;
}

async function walkRelativeFiles(rootDir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        out.push(path.relative(rootDir, full).split(path.sep).join("/"));
      }
    }
  }

  await walk(rootDir);
  return out.sort();
}

export async function hashSkillDir(rootDir: string): Promise<string> {
  const files = await walkRelativeFiles(rootDir);
  const hash = createHash("sha256");
  for (const relative of files) {
    hash.update(relative);
    hash.update("\0");
    hash.update(await readFile(path.join(rootDir, relative)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export async function loadRegistryIndex(
  registryUrl: string,
): Promise<{ index: RegistryIndex; source: string; localRoot?: string }> {
  if (registryUrl.startsWith("http://") || registryUrl.startsWith("https://")) {
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new RegistryError(
        `Failed to fetch registry (${response.status}): ${registryUrl}`,
      );
    }
    const index = (await response.json()) as RegistryIndex;
    return { index, source: registryUrl };
  }

  const filePath = registryUrl.startsWith("file:")
    ? fileURLToPath(registryUrl)
    : path.resolve(registryUrl);
  const raw = await readFile(filePath, "utf8");
  const index = JSON.parse(raw) as RegistryIndex;
  return {
    index,
    source: filePath,
    localRoot: path.dirname(path.dirname(filePath)),
  };
}

function repoRootFromIndexUrl(indexUrl: string): string {
  if (indexUrl.endsWith("/registry/index.json")) {
    return indexUrl.slice(0, -"/registry/index.json".length);
  }
  const idx = indexUrl.lastIndexOf("/");
  return idx >= 0 ? indexUrl.slice(0, idx) : indexUrl;
}

export async function downloadSkill(
  entry: RegistryEntry,
  destDir: string,
  options: { indexUrl: string; localRoot?: string },
): Promise<void> {
  await mkdir(destDir, { recursive: true });

  if (options.localRoot) {
    const sourceDir = path.join(options.localRoot, entry.path);
    for (const relative of entry.files) {
      if (relative.includes("..") || path.isAbsolute(relative)) {
        throw new RegistryError(`Unsafe file path in registry entry: ${relative}`);
      }
      const source = path.join(sourceDir, relative);
      const target = path.join(destDir, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, await readFile(source));
    }
    return;
  }

  const base = repoRootFromIndexUrl(options.indexUrl);
  for (const relative of entry.files) {
    if (relative.includes("..") || path.isAbsolute(relative)) {
      throw new RegistryError(`Unsafe file path in registry entry: ${relative}`);
    }
    const url = `${base}/${entry.path}/${relative}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new RegistryError(`Failed to download ${url} (${response.status})`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const target = path.join(destDir, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
}

export async function findSkillMarkdownFiles(
  skillsRoot: string,
): Promise<string[]> {
  const found: string[] = [];

  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name === "SKILL.md") {
        found.push(full);
      }
    }
  }

  await walk(skillsRoot);
  return found.sort();
}

export async function buildRegistryIndex(
  repoRoot: string,
): Promise<RegistryIndex> {
  const skillsRoot = path.join(repoRoot, "skills");
  const skillFiles = await findSkillMarkdownFiles(skillsRoot);
  const skills: RegistryEntry[] = [];

  for (const skillMd of skillFiles) {
    const rootDir = path.dirname(skillMd);
    const result = await validateSkillDirectory(rootDir);
    if (!result.ok || !result.skill) {
      const details = result.errors.map((issue) => issue.message).join("; ");
      throw new RegistryError(`Invalid skill at ${rootDir}: ${details}`);
    }
    const files = await walkRelativeFiles(rootDir);
    const checksum = await hashSkillDir(rootDir);
    skills.push({
      name: result.skill.name,
      version: result.skill.version,
      category: result.skill.category,
      description: result.skill.description,
      tags: result.skill.tags,
      author: result.skill.author,
      license: result.skill.license,
      path: path.relative(repoRoot, rootDir).split(path.sep).join("/"),
      files,
      checksum,
      repository: result.skill.repository,
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { version: 1, skills };
}
