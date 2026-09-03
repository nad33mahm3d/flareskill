import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  AGENT_NAMES,
  type KnownAgentName,
  type SkillPackage,
} from "@flareskill/skill-schema";
import { isUnsafeRelative } from "@flareskill/skill-validator";

export { AGENT_NAMES };
export type AgentName = KnownAgentName;

export type InstallOpts = {
  global: boolean;
  projectRoot: string;
  homeDir?: string;
};

export interface AgentAdapter {
  name: AgentName;
  detect(opts: InstallOpts): Promise<boolean>;
  install(skill: SkillPackage, opts: InstallOpts): Promise<string>;
  uninstall(skillName: string, opts: InstallOpts): Promise<void>;
}

export function isAgentName(value: string): value is AgentName {
  return (AGENT_NAMES as readonly string[]).includes(value);
}

function home(opts: InstallOpts): string {
  return opts.homeDir ?? os.homedir();
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await readdir(target);
    return true;
  } catch {
    try {
      await readFile(target);
      return true;
    } catch {
      return false;
    }
  }
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

async function copySkillInto(skill: SkillPackage, destRoot: string): Promise<void> {
  const resolvedDest = path.resolve(destRoot);
  await mkdir(resolvedDest, { recursive: true });
  const files = await walkFiles(skill.rootDir);
  for (const file of files) {
    const relative = path.relative(skill.rootDir, file).split(path.sep).join("/");
    if (isUnsafeRelative(relative)) {
      throw new Error(`Refusing to copy unsafe path: ${relative}`);
    }
    const target = path.resolve(resolvedDest, relative);
    const relToDest = path.relative(resolvedDest, target);
    if (relToDest.startsWith("..") || path.isAbsolute(relToDest)) {
      throw new Error(`Refusing to write outside skills root: ${relative}`);
    }
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await readFile(file));
  }
}

abstract class DirectoryAdapter implements AgentAdapter {
  abstract name: AgentName;
  abstract destDir(skillName: string, opts: InstallOpts): string;
  abstract detect(opts: InstallOpts): Promise<boolean>;

  async install(skill: SkillPackage, opts: InstallOpts): Promise<string> {
    const dest = this.destDir(skill.name, opts);
    await copySkillInto(skill, dest);
    return dest;
  }

  async uninstall(skillName: string, opts: InstallOpts): Promise<void> {
    await rm(this.destDir(skillName, opts), { recursive: true, force: true });
  }
}

export class GenericAdapter extends DirectoryAdapter {
  name: AgentName = "generic";

  destDir(skillName: string, opts: InstallOpts): string {
    if (opts.global) {
      return path.join(home(opts), ".flareskill", "skills", skillName);
    }
    return path.join(opts.projectRoot, ".flareskill", "skills", skillName);
  }

  async detect(_opts: InstallOpts): Promise<boolean> {
    return true;
  }
}

export class CursorAdapter extends DirectoryAdapter {
  name: AgentName = "cursor";

  destDir(skillName: string, opts: InstallOpts): string {
    if (opts.global) {
      return path.join(home(opts), ".cursor", "skills", skillName);
    }
    return path.join(opts.projectRoot, ".cursor", "skills", skillName);
  }

  async detect(opts: InstallOpts): Promise<boolean> {
    return pathExists(path.join(opts.projectRoot, ".cursor"));
  }
}

export class ClaudeAdapter extends DirectoryAdapter {
  name: AgentName = "claude";

  destDir(skillName: string, opts: InstallOpts): string {
    if (opts.global) {
      return path.join(home(opts), ".claude", "skills", skillName);
    }
    return path.join(opts.projectRoot, ".claude", "skills", skillName);
  }

  async detect(opts: InstallOpts): Promise<boolean> {
    return pathExists(path.join(opts.projectRoot, ".claude"));
  }
}

export class CodexAdapter extends DirectoryAdapter {
  name: AgentName = "codex";

  destDir(skillName: string, opts: InstallOpts): string {
    if (opts.global) {
      return path.join(home(opts), ".codex", "skills", skillName);
    }
    return path.join(opts.projectRoot, ".agents", "skills", skillName);
  }

  async detect(opts: InstallOpts): Promise<boolean> {
    return (
      (await pathExists(path.join(opts.projectRoot, ".agents"))) ||
      (await pathExists(path.join(opts.projectRoot, ".codex")))
    );
  }
}

const adapters: Record<AgentName, AgentAdapter> = {
  cursor: new CursorAdapter(),
  claude: new ClaudeAdapter(),
  codex: new CodexAdapter(),
  generic: new GenericAdapter(),
};

export function getAdapter(name: AgentName): AgentAdapter {
  return adapters[name];
}

export async function resolveAgent(
  requested: AgentName | "auto",
  opts: InstallOpts,
): Promise<AgentName> {
  if (requested !== "auto") {
    return requested;
  }
  for (const name of ["cursor", "claude", "codex"] as const) {
    if (await adapters[name].detect(opts)) {
      return name;
    }
  }
  return "generic";
}

export function formatAgentLabel(agent: AgentName): string {
  switch (agent) {
    case "cursor":
      return "Cursor";
    case "claude":
      return "Claude Code";
    case "codex":
      return "Codex";
    default:
      return "Generic";
  }
}
