import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { SkillMetadata, SkillPackage } from "@flareskill/skill-schema";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export class SkillParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillParseError";
  }
}

export function parseFrontmatter(markdown: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = FRONTMATTER_RE.exec(markdown);
  if (!match) {
    throw new SkillParseError(
      "SKILL.md must start with YAML frontmatter delimited by ---",
    );
  }

  let data: unknown;
  try {
    data = parseYaml(match[1] ?? "");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new SkillParseError(`Invalid YAML frontmatter: ${reason}`);
  }

  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    throw new SkillParseError("Frontmatter must be a YAML object");
  }

  return {
    data: data as Record<string, unknown>,
    body: (match[2] ?? "").trim(),
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Frontmatter wins on key conflicts. */
export function mergeMetadata(
  frontmatter: Record<string, unknown>,
  fileMeta: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!fileMeta) {
    return { ...frontmatter };
  }
  return { ...fileMeta, ...frontmatter };
}

export async function parseSkillDirectory(
  rootDir: string,
): Promise<{ raw: Record<string, unknown>; body: string; rootDir: string }> {
  const skillMdPath = path.join(rootDir, "SKILL.md");
  let markdown: string;
  try {
    markdown = await readFile(skillMdPath, "utf8");
  } catch {
    throw new SkillParseError(`Missing SKILL.md in ${rootDir}`);
  }

  const { data: frontmatter, body } = parseFrontmatter(markdown);

  let fileMeta: Record<string, unknown> | undefined;
  const metaPath = path.join(rootDir, "metadata.yaml");
  try {
    const raw = await readFile(metaPath, "utf8");
    const parsed = parseYaml(raw);
    if (!isPlainObject(parsed)) {
      throw new SkillParseError("metadata.yaml must be a YAML object");
    }
    fileMeta = parsed;
  } catch (error) {
    if (error instanceof SkillParseError) {
      throw error;
    }
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as NodeJS.ErrnoException).code
        : undefined;
    if (code !== "ENOENT") {
      const reason = error instanceof Error ? error.message : String(error);
      throw new SkillParseError(`Invalid metadata.yaml: ${reason}`);
    }
  }

  return {
    raw: mergeMetadata(frontmatter, fileMeta),
    body,
    rootDir,
  };
}

export function asSkillPackage(
  parsed: { raw: Record<string, unknown>; body: string; rootDir: string },
  metadata: SkillMetadata,
): SkillPackage {
  return {
    ...metadata,
    body: parsed.body,
    rootDir: parsed.rootDir,
  };
}
