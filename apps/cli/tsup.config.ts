import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  clean: true,
  sourcemap: false,
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  noExternal: [
    "@flareskill/agent-adapters",
    "@flareskill/registry-client",
    "@flareskill/skill-parser",
    "@flareskill/skill-schema",
    "@flareskill/skill-validator",
  ],
});
