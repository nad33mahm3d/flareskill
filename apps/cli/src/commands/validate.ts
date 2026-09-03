import { validateSkillDirectory } from "@flareskill/skill-validator";
import { findSkillDirs } from "../core/filesystem.js";
import * as log from "../core/log.js";

export async function runValidate(targetPath: string): Promise<number> {
  const dirs = await findSkillDirs(targetPath);
  if (dirs.length === 0) {
    log.fail(`No SKILL.md found under ${targetPath}`);
    return 1;
  }

  let failed = 0;
  for (const dir of dirs) {
    const result = await validateSkillDirectory(dir);
    const label = dirs.length > 1 ? dir : targetPath;
    if (result.ok) {
      log.ok(`Valid ${result.skill?.name}@${result.skill?.version} (${label})`);
    } else {
      failed += 1;
      log.fail(`Invalid skill (${label})`);
      for (const error of result.errors) {
        log.fail(error.message);
      }
    }
    for (const warning of result.warnings) {
      log.warn(warning.message);
    }
  }

  if (failed > 0) {
    return 1;
  }
  return 0;
}
