import { Command } from "commander";
import { runCreate } from "./commands/create.js";
import { runInfo } from "./commands/info.js";
import { runInstall } from "./commands/install.js";
import { runList } from "./commands/list.js";
import { runUninstall } from "./commands/uninstall.js";
import { runValidate } from "./commands/validate.js";
import { fail } from "./core/log.js";

const program = new Command();

program
  .name("flareskill")
  .description(
    "Discover, install, and manage reusable AI agent skills",
  )
  .version("0.1.0");

program
  .command("validate")
  .argument("[path]", "Skill directory or a tree of skills", ".")
  .description("Validate skill schema and package structure")
  .action(async (targetPath: string) => {
    const code = await runValidate(targetPath);
    process.exitCode = code;
  });

program
  .command("create")
  .argument("<name>", "Skill name (lowercase, hyphens)")
  .description("Scaffold a new skill package")
  .action(async (name: string) => {
    await runCreate(name);
  });

program
  .command("install")
  .argument("<skill>", "Skill name, name@version, or local path")
  .option("-g, --global", "Install for the current user")
  .option(
    "-a, --agent <agent>",
    "Target agent: auto, cursor, or generic",
    "auto",
  )
  .option("-r, --registry <url>", "Registry index URL or local path")
  .description("Install a skill from the registry or a local directory")
  .action(async (skill: string, options: { global?: boolean; agent: string; registry?: string }) => {
    await runInstall(skill, options);
  });

program
  .command("uninstall")
  .argument("<name>", "Installed skill name")
  .option("-g, --global", "Uninstall from the user-level skills directory")
  .description("Remove an installed skill")
  .action(async (name: string, options: { global?: boolean }) => {
    await runUninstall(name, options);
  });

program
  .command("list")
  .description("List installed skills")
  .action(async () => {
    await runList();
  });

program
  .command("info")
  .argument("<skill>", "Skill name or name@version")
  .option("-r, --registry <url>", "Registry index URL or local path")
  .description("Show registry metadata for a skill")
  .action(async (skill: string, options: { registry?: string }) => {
    await runInfo(skill, options);
  });

async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(message);
    process.exitCode = 1;
  }
}

void main();
