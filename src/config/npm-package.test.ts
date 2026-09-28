import { expect, test } from "vite-plus/test";
import { configFieldRegistry, configGroupRegistry } from "../registries.ts";
import { configs, nameSchema, npmPackageSchema, value } from "./npm-package.ts";

test("npmPackageSchema validates current package.json successfully", () => {
  expect(configs).toBeDefined();
  expect(value).toBeDefined();
  expect(configs.name).toBe("@lib/config");
  expect(configs.type).toBe("module");
});

test("npmPackageSchema is registered on configGroupRegistry with resolveMap", () => {
  const meta = configGroupRegistry.get(npmPackageSchema);
  expect(meta).toBeDefined();
  expect(meta?.urn).toBe("urn:config:npm-package");
  expect(meta?.id).toBe("npm-package");
  expect(meta?.resolveMap).toEqual({
    local: "package.json",
  });
});

test("nameSchema is registered on configFieldRegistry", () => {
  const meta = configFieldRegistry.get(nameSchema);
  expect(meta).toBeDefined();
  expect(meta?.urn).toBe("urn:config:npm-package.name");
  expect(meta?.key).toBe("name");
  expect(meta?.groupId).toBe("npm-package");
  expect(meta?.title).toBe("Name");
});

test("npmPackageSchema parses valid package.json object", () => {
  const input = {
    name: "my-package",
    version: "1.2.3",
    description: "Sample package",
    keywords: ["sample", "test"],
    author: "Jane Doe <jane@example.com>",
    dependencies: {
      zod: "^4.0.0",
    },
  };

  const parsed = npmPackageSchema.parse(input);
  expect(parsed.name).toBe("my-package");
  expect(parsed.version).toBe("1.2.3");
  expect(parsed.description).toBe("Sample package");
});
