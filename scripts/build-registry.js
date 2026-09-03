#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistryIndex } from "../packages/registry-client/dist/index.js";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const index = await buildRegistryIndex(repoRoot);
const out = path.join(repoRoot, "registry", "index.json");
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(index, null, 2)}\n`);
console.log(
  `Wrote ${index.skills.length} skills and ${index.profiles?.length ?? 0} profiles to ${out}`,
);
