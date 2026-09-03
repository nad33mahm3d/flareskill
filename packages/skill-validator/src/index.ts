import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  parseSkillDirectory,
  SkillParseError,
} from "@flareskill/skill-parser";
import {
  skillMetadataSchema,
  type SkillMetadata,
  type SkillPackage,
} from "@flareskill/skill-schema";

const ALLOWED_ROOT_FILES = new Set([
  "skill.md",
  "metadata.yaml",
  "metadata.yml",
  "readme.md",
  "license",
  "license.md",
  "license.txt",
]);

const ALLOWED_ROOT_DIRS = new Set([
  "examples",
  "references",
  "templates",
  "tests",
  "scripts",
]);

const SUSPICIOUS_PHRASES = [
  "delete all files",
  "send credentials",
  "upload secrets",
  "disable security",
  "execute unknown binary",
];

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  skill?: SkillPackage;
};

export function isUnsafeRelative(relativePath: string): boolean {
  if (path.isAbsolute(relativePath)) {
    return true;
  }
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.startsWith("~")) {
    return true;
  }
  return normalized.split("/").some((segment) => segment === "..");
}

async function walkFiles(rootDir: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }

  await walk(rootDir);
  return out;
}

function scanSuspicious(text: string): string[] {
  const lower = text.toLowerCase();
  return SUSPICIOUS_PHRASES.filter((phrase) => lower.includes(phrase));
}

export async function validateSkillDirectory(
  rootDir: string,
): Promise<ValidationResult> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  let parsed: Awaited<ReturnType<typeof parseSkillDirectory>>;
  try {
    parsed = await parseSkillDirectory(rootDir);
  } catch (error) {
    const message =
      error instanceof SkillParseError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    errors.push({ level: "error", message });
    return { ok: false, errors, warnings };
  }

  const metadataResult = skillMetadataSchema.safeParse(parsed.raw);
  if (!metadataResult.success) {
    for (const issue of metadataResult.error.issues) {
      const where = issue.path.length > 0 ? issue.path.join(".") : "metadata";
      errors.push({
        level: "error",
        message: `${where}: ${issue.message}`,
      });
    }
  }

  let entries: string[] = [];
  try {
    entries = await readdir(rootDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push({
      level: "error",
      message: `Cannot read skill directory: ${message}`,
    });
    return { ok: false, errors, warnings };
  }

  for (const name of entries) {
    const lower = name.toLowerCase();
    const full = path.join(rootDir, name);
    if (isUnsafeRelative(name)) {
      errors.push({
        level: "error",
        message: `Unsafe path in package: ${name}`,
      });
      continue;
    }

    const info = await stat(full);
    if (info.isDirectory()) {
      if (!ALLOWED_ROOT_DIRS.has(lower)) {
        warnings.push({
          level: "warning",
          message: `Unexpected directory "${name}" (allowed: ${[...ALLOWED_ROOT_DIRS].join(", ")})`,
        });
      }
    } else if (info.isFile() && !ALLOWED_ROOT_FILES.has(lower)) {
      warnings.push({
        level: "warning",
        message: `Unexpected file "${name}" at skill root`,
      });
    }
  }

  const files = await walkFiles(rootDir);
  for (const file of files) {
    const relative = path.relative(rootDir, file);
    if (isUnsafeRelative(relative)) {
      errors.push({
        level: "error",
        message: `Unsafe path in package: ${relative}`,
      });
    }
  }

  const haystack = `${JSON.stringify(parsed.raw)}\n${parsed.body}`;
  for (const phrase of scanSuspicious(haystack)) {
    warnings.push({
      level: "warning",
      message: `Suspicious phrase flagged for review: "${phrase}"`,
    });
  }

  if (errors.length > 0 || !metadataResult.success) {
    return { ok: false, errors, warnings };
  }

  const metadata = metadataResult.data as SkillMetadata;
  const skill: SkillPackage = {
    ...metadata,
    body: parsed.body,
    rootDir: parsed.rootDir,
  };

  return { ok: true, errors, warnings, skill };
}
