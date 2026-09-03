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
  dependencies?: string[];
};

export type DependencyRef = {
  name: string;
  range?: string;
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

export function compareSemver(a: string, b: string): number {
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

export function parseDependencyRef(ref: string): DependencyRef {
  const at = ref.lastIndexOf("@");
  if (at > 0) {
    return { name: ref.slice(0, at), range: ref.slice(at + 1) };
  }
  return { name: ref };
}

function parseParts(version: string): [number, number, number] {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);
  return [major, minor, patch];
}

/** True if exact semver satisfies an optional range (*, 1.2.3, 1.x, ^1.2.3, ~1.2.3). */
export function versionSatisfies(version: string, range?: string): boolean {
  if (!range || range === "*") {
    return true;
  }
  if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(range)) {
    return version === range;
  }
  if (/^[0-9]+\.x$/.test(range)) {
    const major = Number(range.slice(0, -2));
    return parseParts(version)[0] === major;
  }
  if (range.startsWith("^")) {
    const base = range.slice(1);
    if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(base)) {
      return false;
    }
    const [bMaj, bMin, bPat] = parseParts(base);
    const [vMaj, vMin, vPat] = parseParts(version);
    if (vMaj !== bMaj) {
      return false;
    }
    if (vMin > bMin) {
      return true;
    }
    if (vMin < bMin) {
      return false;
    }
    return vPat >= bPat;
  }
  if (range.startsWith("~")) {
    const base = range.slice(1);
    if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(base)) {
      return false;
    }
    const [bMaj, bMin, bPat] = parseParts(base);
    const [vMaj, vMin, vPat] = parseParts(version);
    return vMaj === bMaj && vMin === bMin && vPat >= bPat;
  }
  return false;
}

export function resolveEntryForRange(
  index: RegistryIndex,
  name: string,
  range?: string,
): RegistryEntry {
  const matches = index.skills
    .filter((skill) => skill.name === name)
    .filter((skill) => versionSatisfies(skill.version, range))
    .sort((a, b) => compareSemver(b.version, a.version));
  if (matches.length === 0) {
    const label = range ? `${name}@${range}` : name;
    throw new RegistryError(`No version of ${label} found in registry`);
  }
  return matches[0]!;
}

/**
 * Resolve install order for a root skill and its transitive dependencies.
 * Returned entries are dependencies-first (root last). Detects cycles and
 * incompatible version ranges.
 */
export function resolveDependencyOrder(
  index: RegistryIndex,
  rootName: string,
  rootVersion?: string,
): RegistryEntry[] {
  const resolved = new Map<string, RegistryEntry>();
  const requiredRanges = new Map<string, Array<string | undefined>>();
  const visiting = new Set<string>();
  const order: RegistryEntry[] = [];

  function select(name: string): RegistryEntry {
    const ranges = requiredRanges.get(name) ?? [undefined];
    const candidates = index.skills
      .filter((skill) => skill.name === name)
      .filter((skill) =>
        ranges.every((range) => versionSatisfies(skill.version, range)),
      )
      .sort((a, b) => compareSemver(b.version, a.version));
    if (candidates.length === 0) {
      const label = ranges
        .map((range) => (range ? `${name}@${range}` : name))
        .join(" / ");
      throw new RegistryError(`No registry version satisfies ${label}`);
    }
    return candidates[0]!;
  }

  function visit(name: string, range?: string): void {
    const ranges = requiredRanges.get(name) ?? [];
    ranges.push(range);
    requiredRanges.set(name, ranges);

    if (resolved.has(name)) {
      const current = resolved.get(name)!;
      if (!versionSatisfies(current.version, range)) {
        throw new RegistryError(
          `Dependency conflict for ${name}: installed resolution ${current.version} does not satisfy ${range ?? "*"}`,
        );
      }
      return;
    }

    if (visiting.has(name)) {
      throw new RegistryError(`Circular dependency detected involving ${name}`);
    }

    visiting.add(name);
    const entry = select(name);
    for (const depRef of entry.dependencies ?? []) {
      const dep = parseDependencyRef(depRef);
      visit(dep.name, dep.range);
    }
    visiting.delete(name);
    resolved.set(name, entry);
    order.push(entry);
  }

  visit(rootName, rootVersion);
  return order;
}

export function searchSkills(
  index: RegistryIndex,
  query: string,
): RegistryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...index.skills].sort((a, b) => a.name.localeCompare(b.name));
  }

  const terms = q.split(/\s+/).filter(Boolean);

  function score(entry: RegistryEntry): number {
    const haystack = [
      entry.name,
      entry.description,
      entry.category,
      entry.author,
      ...entry.tags,
    ]
      .join(" ")
      .toLowerCase();

    let points = 0;
    for (const term of terms) {
      if (entry.name.toLowerCase() === term) {
        points += 100;
      } else if (entry.name.toLowerCase().includes(term)) {
        points += 40;
      }
      if (entry.category.toLowerCase() === term) {
        points += 30;
      }
      if (entry.tags.some((tag) => tag.toLowerCase() === term)) {
        points += 25;
      } else if (entry.tags.some((tag) => tag.toLowerCase().includes(term))) {
        points += 10;
      }
      if (haystack.includes(term)) {
        points += 5;
      } else {
        return -1;
      }
    }
    return points;
  }

  return index.skills
    .map((entry) => ({ entry, points: score(entry) }))
    .filter((row) => row.points >= 0)
    .sort(
      (a, b) =>
        b.points - a.points || a.entry.name.localeCompare(b.entry.name),
    )
    .map((row) => row.entry);
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
      ...(result.skill.dependencies?.length
        ? { dependencies: result.skill.dependencies }
        : {}),
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { version: 1, skills };
}
