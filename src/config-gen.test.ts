import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vite-plus/test";
import { generateConfig } from "../scripts/config-gen.ts";

test("generateConfig generates target JSON from source configuration", async () => {
  const tmpConfigPath = resolve(process.cwd(), "test.config.ts");
  const tmpJsonPath = resolve(process.cwd(), "test.output.json");

  const configContent = `
import { defineConfig } from "./src/main.ts";

export default defineConfig({
  name: "@lib/test-pkg",
  version: "1.0.0",
  codegen: [
    {
      src: "test.config.ts",
      dst: "test.output.json",
      format: "json",
    },
  ],
});
`;

  writeFileSync(tmpConfigPath, configContent, "utf-8");

  try {
    await generateConfig("test.config.ts");

    expect(existsSync(tmpJsonPath)).toBe(true);
    const content = JSON.parse(readFileSync(tmpJsonPath, "utf-8"));
    expect(content.name).toBe("@lib/test-pkg");
    expect(content.version).toBe("1.0.0");
    expect(content.codegen).toBeUndefined();
  } finally {
    if (existsSync(tmpConfigPath)) unlinkSync(tmpConfigPath);
    if (existsSync(tmpJsonPath)) unlinkSync(tmpJsonPath);
  }
});
