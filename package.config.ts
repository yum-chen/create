import { defineConfig } from "./src/main.ts";

export default defineConfig({
  name: "@lib/config",
  version: "0.0.0",
  files: ["dist"],
  type: "module",
  exports: {
    ".": "./dist/main.mjs",
    "./package.json": "./package.json",
  },
  scripts: {
    build: "vp pack",
    dev: "vp pack --watch",
    start: "vp run src/main.ts",
    test: "vp test",
    check: "vp check",
    fmt: "vp fmt",
    lint: "vp lint",
    prepublishOnly: "vp run build",
    prepare: "node --experimental-strip-types scripts/config-gen.ts",
  },
  dependencies: {
    zod: "^4.6.5",
  },
  devDependencies: {
    "@types/node": "^26.6.2",
    "vite-plus": "^1.0.0-rc.1",
  },
  peerDependencies: {
    typescript: "^7.0.2",
  },
  overrides: {
    vite: "npm:@voidzero-dev/vite-plus-core@1.0.0-rc.1",
  },
  devEngines: {
    packageManager: {
      name: "npm",
      version: "11.11.0",
      onFail: "download",
    },
  },
  codegen: [
    {
      src: "package.config.ts",
      dst: "package.json",
      format: "json",
    },
  ],
});
