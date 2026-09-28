import { expect, test } from "vite-plus/test";
import { configFieldRegistry, configGroupRegistry } from "../registries.ts";
import { codegenSchema, resolveMapSchema, stdSchema, stdConfigs } from "./std.ts";

test("stdSchema validates default std configuration", () => {
  expect(stdConfigs).toBeDefined();
  expect(stdConfigs.resolveMap).toEqual({ local: "std.config.ts" });
  expect(stdConfigs.codegen).toEqual([
    {
      src: "package.config.ts",
      dst: "package.json",
      format: "json",
    },
  ]);
});

test("stdSchema is registered on configGroupRegistry", () => {
  const meta = configGroupRegistry.get(stdSchema);
  expect(meta).toBeDefined();
  expect(meta?.urn).toBe("urn:config:std");
  expect(meta?.id).toBe("std");
});

test("codegenSchema and resolveMapSchema are registered on configFieldRegistry", () => {
  const codegenMeta = configFieldRegistry.get(codegenSchema);
  expect(codegenMeta?.key).toBe("codegen");
  expect(codegenMeta?.groupId).toBe("std");

  const resolveMapMeta = configFieldRegistry.get(resolveMapSchema);
  expect(resolveMapMeta?.key).toBe("resolveMap");
  expect(resolveMapMeta?.groupId).toBe("std");
});
