import { Command } from "commander";
import { runCreate } from "./commands/create.js";
import { runInfo } from "./commands/info.js";
import { runInit } from "./commands/init.js";
import { runInstall } from "./commands/install.js";
import { runList } from "./commands/list.js";
import { runOutdated } from "./commands/outdated.js";
import {
  runProfileCreate,
  runProfileInfo,
  runProfileInstall,
  runProfileList,
} from "./commands/profile.js";
import { runSearch } from "./commands/search.js";
import { runUninstall } from "./commands/uninstall.js";
import { runUpdate } from "./commands/update.js";
import { runValidate } from "./commands/validate.js";
import { fail } from "./core/log.js";

const program = new Command();

program
  .name("flareskill")
  .description(
    "Discover, install, and manage reusable AI agent skills",
  )
  .version("0.2.0");

program
  .command("init")
  .option("-f, --force", "Overwrite existing config and lockfile")
  .description("Create .flareskill/config.yaml and an empty flareskill.lock")
  .action(async (options: { force?: boolean }) => {
    await runInit(options);
  });

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
  .command("search")
  .argument("[query]", "Search name, description, tags, or category", "")
  .option("-r, --registry <url>", "Registry index URL or local path")
  .option("-n, --limit <count>", "Max results to show", "25")
  .description("Search the registry for skills")
  .action(
    async (
      query: string,
      options: { registry?: string; limit: string },
    ) => {
      const limit = Number.parseInt(options.limit, 10);
      await runSearch(query, {
        registry: options.registry,
        limit: Number.isFinite(limit) ? limit : 25,
      });
    },
  );

program
  .command("install")
  .argument(
    "[skill]",
    "Skill name, name@version, or local path (omit to sync from flareskill.lock)",
  )
  .option("-g, --global", "Install for the current user")
  .option(
    "-a, --agent <agent>",
    "Target agent: auto, cursor, claude, codex, or generic",
    "auto",
  )
  .option("-r, --registry <url>", "Registry index URL or local path")
  .option("--no-deps", "Skip installing skill dependencies")
  .option("-q, --quiet", "Less verbose install output (still prints summary)")
  .description(
    "Install a skill from the registry, a local directory, or flareskill.lock",
  )
  .action(
    async (
      skill: string | undefined,
      options: {
        global?: boolean;
        agent: string;
        registry?: string;
        deps?: boolean;
        quiet?: boolean;
      },
    ) => {
      await runInstall(skill, {
        global: options.global,
        agent: options.agent,
        registry: options.registry,
        noDeps: options.deps === false,
        quiet: options.quiet,
      });
    },
  );

program
  .command("update")
  .argument("[names...]", "Skill names to update (default: all installed)")
  .option("-g, --global", "Update skills in the user-level scope")
  .option(
    "-a, --agent <agent>",
    "Override target agent: auto, cursor, claude, codex, or generic",
  )
  .option("-r, --registry <url>", "Registry index URL or local path")
  .description("Update installed skills to the latest registry versions")
  .action(
    async (
      names: string[],
      options: { global?: boolean; agent?: string; registry?: string },
    ) => {
      await runUpdate(names, options);
    },
  );

program
  .command("outdated")
  .option("-g, --global", "Check user-level installed skills")
  .option("-r, --registry <url>", "Registry index URL or local path")
  .description("List installed skills that have newer registry versions")
  .action(async (options: { global?: boolean; registry?: string }) => {
    await runOutdated(options);
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

const profile = program
  .command("profile")
  .description("Install or manage named skill profiles");

profile
  .command("list")
  .option("-r, --registry <url>", "Registry index URL or local path")
  .description("List official and local skill profiles")
  .action(async (options: { registry?: string }) => {
    await runProfileList(options);
  });

profile
  .command("info")
  .argument("<name>", "Profile name")
  .option("-r, --registry <url>", "Registry index URL or local path")
  .description("Show skills in a profile")
  .action(async (name: string, options: { registry?: string }) => {
    await runProfileInfo(name, options);
  });

profile
  .command("install")
  .argument("<name>", "Profile name")
  .option("-g, --global", "Install for the current user")
  .option(
    "-a, --agent <agent>",
    "Target agent: auto, cursor, claude, codex, or generic",
    "auto",
  )
  .option("-r, --registry <url>", "Registry index URL or local path")
  .option("--no-deps", "Skip installing skill dependencies")
  .option("-q, --quiet", "Less verbose install output")
  .description("Install every skill in a profile")
  .action(
    async (
      name: string,
      options: {
        global?: boolean;
        agent: string;
        registry?: string;
        deps?: boolean;
        quiet?: boolean;
      },
    ) => {
      await runProfileInstall(name, {
        global: options.global,
        agent: options.agent,
        registry: options.registry,
        noDeps: options.deps === false,
        quiet: options.quiet,
      });
    },
  );

profile
  .command("create")
  .argument("<name>", "Profile name (lowercase, hyphens)")
  .option(
    "--from-installed",
    "Snapshot currently installed project skills",
  )
  .option("-f, --force", "Overwrite an existing local profile")
  .description("Create a local profile under .flareskill/profiles/")
  .action(
    async (
      name: string,
      options: { fromInstalled?: boolean; force?: boolean },
    ) => {
      await runProfileCreate(name, options);
    },
  );

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
