import { expect, test } from "vite-plus/test";
import { Config, createDefineConfig, resolver } from "./config.ts";
import "./config/npm-package.ts";
import * as Schema from "./schema.ts";

test("Config.createDefine and createDefineConfig work with groupId string or schema object", () => {
  const defineConfigFromGroupId = Config.createDefine("config.npm-package");
  const res1 = defineConfigFromGroupId({ name: "my-app", version: "1.0.0" });
  expect(res1.name).toBe("my-app");
  expect(res1.version).toBe("1.0.0");

  const defineConfigFromShortGroupId = createDefineConfig("npm-package");
  const res2 = defineConfigFromShortGroupId({ name: "my-lib" });
  expect(res2.name).toBe("my-lib");

  const customSchema = Schema.object({ title: Schema.string() });
  const defineConfigFromSchema = createDefineConfig(customSchema);
  const res3 = defineConfigFromSchema({ title: "Custom Title" });
  expect(res3.title).toBe("Custom Title");
});

test("new Config('npmPackage') instance get and set and resolveMap", () => {
  const npmConfig = new Config("npmPackage", { local: "package.json" });
  expect(npmConfig.get("name")).toBe("@lib/config");

  expect(resolver["npm-package"]).toEqual({ local: "package.json" });

  npmConfig.set("name", "new-package-name");
  expect(npmConfig.get("name")).toBe("new-package-name");

  // Get full group config object
  const fullGroup = npmConfig.get();
  expect(fullGroup.name).toBe("new-package-name");
});

test("Global Config.get and Config.set with full URN, with and without config. prefix", () => {
  // Test with 'npmPackage.version'
  expect(Config.get("npmPackage.version")).toBe("0.0.0");

  // Test setting via 'config.npm-package.version'
  Config.set("config.npm-package.version", "1.2.3");
  expect(Config.get("config.npm-package.version")).toBe("1.2.3");
  expect(Config.get("npmPackage:version")).toBe("1.2.3");
  expect(Config.get("urn:config:npm-package.version")).toBe("1.2.3");
  expect(Config.get("urn:config.npm-package:version")).toBe("1.2.3");

  // Test full group get
  const pkgGroup = Config.get("config.npm-package");
  expect(pkgGroup.version).toBe("1.2.3");
});

test("Scope resolution and scope stores (local, user, system)", () => {
  // Register a custom test group
  Schema.config(Schema.string()).meta({
    urn: "urn:config:appServer.host",
    key: "host",
    groupId: "app-server",
  });

  Schema.configGroup().meta({
    urn: "urn:config:appServer",
    id: "app-server",
  });

  const serverConfig = new Config("appServer");

  // Set values across scopes
  serverConfig.set("host", "system-host", "system");
  serverConfig.set("host", "user-host", "user");

  expect(serverConfig.get("host", "system")).toBe("system-host");
  expect(serverConfig.get("host", "user")).toBe("user-host");
  expect(serverConfig.get("host", "local")).toBeUndefined();

  // Without explicit scope, falls back user -> system (local is undefined)
  expect(serverConfig.get("host")).toBe("user-host");

  // Override in local scope
  serverConfig.set("host", "local-host", "local");
  expect(serverConfig.get("host", "local")).toBe("local-host");
  expect(serverConfig.get("host")).toBe("local-host");
});

test("Throws error when group or field key is not found", () => {
  expect(() => Config.get("nonexistentGroup.key")).toThrow(/could not be resolved|not found/);

  const npmConfig = new Config("npm-package");
  expect(() => npmConfig.get("nonexistentField")).toThrow(/not found in config group/);
});
