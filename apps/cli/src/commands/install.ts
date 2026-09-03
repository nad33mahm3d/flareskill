import { installSkill } from "../core/installer.js";
import type { AgentName } from "@flareskill/agent-adapters";

export async function runInstall(
  ref: string,
  options: {
    agent?: string;
    global?: boolean;
    registry?: string;
  },
): Promise<void> {
  const agent = parseAgent(options.agent);
  await installSkill(ref, {
    agent,
    global: options.global,
    registry: options.registry,
  });
}

function parseAgent(value: string | undefined): AgentName | "auto" | undefined {
  if (!value) {
    return undefined;
  }
  if (value === "auto" || value === "cursor" || value === "generic") {
    return value;
  }
  throw new Error(`Unknown agent "${value}". Use cursor, generic, or auto.`);
}
