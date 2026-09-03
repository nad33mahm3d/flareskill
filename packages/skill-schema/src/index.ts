import { z } from "zod";

export const SKILL_CATEGORIES = [
  "backend",
  "frontend",
  "mobile",
  "devops",
  "cloud",
  "security",
  "database",
  "qa",
  "architecture",
  "ai",
  "data",
  "product",
  "design",
  "documentation",
  "marketing",
  "business",
  "engineering",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const AGENT_NAMES = ["cursor", "claude", "codex", "generic"] as const;
export type KnownAgentName = (typeof AGENT_NAMES)[number];

export const skillNameSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Name must be lowercase letters, numbers, and hyphens only",
  );

export const skillVersionSchema = z
  .string()
  .regex(/^[0-9]+\.[0-9]+\.[0-9]+$/, "Version must be semver MAJOR.MINOR.PATCH");

/** Dependency refs: name, name@1.2.0, name@1.x, name@^1.2.0, name@~1.2.0 */
export const skillDependencyRefSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:@(?:\*|[\^~]?[0-9]+(?:\.(?:[0-9]+|x)){0,2}))?$/,
    "Dependency must be name or name@version/range (e.g. foo@1.2.0, foo@1.x, foo@^1.0.0)",
  );

export const skillMetadataSchema = z
  .object({
    name: skillNameSchema,
    version: skillVersionSchema,
    description: z.string().min(1).max(1024),
    author: z.string().min(1),
    license: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1),
    category: z.enum(SKILL_CATEGORIES),
    homepage: z.string().url().optional(),
    repository: z.string().min(1).optional(),
    documentation: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    maintainers: z.array(z.string().min(1)).optional(),
    keywords: z.array(z.string().min(1)).optional(),
    dependencies: z.array(skillDependencyRefSchema).optional(),
    agents: z.array(z.enum(AGENT_NAMES)).optional(),
    compatibility: z.record(z.string()).optional(),
  })
  .strict();

export type SkillMetadata = z.infer<typeof skillMetadataSchema>;

export const skillPackageSchema = skillMetadataSchema.extend({
  body: z.string(),
  rootDir: z.string(),
});

export type SkillPackage = z.infer<typeof skillPackageSchema>;
