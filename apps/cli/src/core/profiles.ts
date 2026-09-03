import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { SkillProfile } from "@flareskill/registry-client";
import { pathExists } from "./filesystem.js";

export function localProfilesDir(projectRoot: string): string {
  return path.join(projectRoot, ".flareskill", "profiles");
}

export async function readLocalProfiles(
  projectRoot: string,
): Promise<SkillProfile[]> {
  const dir = localProfilesDir(projectRoot);
  if (!(await pathExists(dir))) {
    return [];
  }
  const names = (await readdir(dir)).filter(
    (file) => file.endsWith(".yaml") || file.endsWith(".yml") || file.endsWith(".json"),
  );
  const profiles: SkillProfile[] = [];
  for (const file of names.sort()) {
    const raw = await readFile(path.join(dir, file), "utf8");
    const parsed = file.endsWith(".json")
      ? (JSON.parse(raw) as Partial<SkillProfile>)
      : (parseYaml(raw) as Partial<SkillProfile>);
    if (!parsed?.name || !Array.isArray(parsed.skills)) {
      continue;
    }
    profiles.push({
      name: parsed.name,
      description: parsed.description ?? "",
      skills: parsed.skills.filter((ref) => typeof ref === "string"),
    });
  }
  return profiles;
}

export async function writeLocalProfile(
  projectRoot: string,
  profile: SkillProfile,
): Promise<string> {
  const dir = localProfilesDir(projectRoot);
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, `${profile.name}.yaml`);
  const body = stringifyYaml(
    {
      name: profile.name,
      description: profile.description,
      skills: profile.skills,
    },
    { lineWidth: 0 },
  );
  await writeFile(dest, body.endsWith("\n") ? body : `${body}\n`);
  return dest;
}

/** Local profiles override registry profiles of the same name. */
export function mergeProfiles(
  registry: SkillProfile[] | undefined,
  local: SkillProfile[],
): SkillProfile[] {
  const map = new Map<string, SkillProfile & { source: "registry" | "local" }>();
  for (const profile of registry ?? []) {
    map.set(profile.name, { ...profile, source: "registry" });
  }
  for (const profile of local) {
    map.set(profile.name, { ...profile, source: "local" });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function findMergedProfile(
  profiles: SkillProfile[],
  name: string,
): SkillProfile {
  const profile = profiles.find((item) => item.name === name);
  if (!profile) {
    throw new Error(
      `Profile "${name}" not found. Run: npx flareskill profile list`,
    );
  }
  return profile;
}
