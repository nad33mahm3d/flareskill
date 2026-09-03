import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node18",
  clean: true,
  sourcemap: true,
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
