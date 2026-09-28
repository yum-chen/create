import { expect, test } from "vite-plus/test";
import { Config, defineConfig, createDefineConfig } from "../config.ts";
import { configFieldRegistry, configGroupRegistry } from "../registries.ts";
import { codegenSchema, resolveMapSchema, stdConfigs, stdSchema, stdValue } from "./std.ts";

test("stdSchema validates default std configuration", () => {
  expect(stdConfigs).toBeDefined();
  expect(stdValue).toBeDefined();
  expect(stdConfigs.resolveMap.local).toBe("package.config.ts");
  expect(stdConfigs.codegen?.[0]?.dst).toBe("package.json");
});

test("stdSchema is registered on configGroupRegistry", () => {
  const meta = configGroupRegistry.get(stdSchema);
  expect(meta).toBeDefined();
  expect(meta?.urn).toBe("config.std");
  expect(meta?.id).toBe("std");
  expect(meta?.resolveMap).toEqual({ local: "package.config.ts" });
});

test("resolveMapSchema and codegenSchema are registered on configFieldRegistry", () => {
  const resolveMapMeta = configFieldRegistry.get(resolveMapSchema);
  expect(resolveMapMeta).toBeDefined();
  expect(resolveMapMeta?.key).toBe("resolveMap");
  expect(resolveMapMeta?.groupId).toBe("std");

  const codegenMeta = configFieldRegistry.get(codegenSchema);
  expect(codegenMeta).toBeDefined();
  expect(codegenMeta?.key).toBe("codegen");
  expect(codegenMeta?.groupId).toBe("std");
});

test("new Config('std') get and set operations", () => {
  const stdConfig = new Config("std");
  expect(stdConfig.get("resolveMap")).toEqual({ local: "package.config.ts" });

  stdConfig.set("resolveMap", { local: "custom.config.ts" });
  expect(stdConfig.get("resolveMap")).toEqual({ local: "custom.config.ts" });
});

test("defineConfig works with std group ID and config object", () => {
  const defineStd = createDefineConfig("std");
  const parsed = defineStd({
    codegen: [{ src: "package.config.ts", dst: "package.json", format: "json" }],
  });
  expect(parsed.codegen[0].src).toBe("package.config.ts");

  const direct = defineConfig("std", {
    codegen: [{ src: "package.config.ts", dst: "package.json", format: "json" }],
  });
  expect(direct.codegen[0].dst).toBe("package.json");
});
