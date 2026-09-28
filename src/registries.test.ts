import { expect, test } from "vite-plus/test";
import { z } from "zod";
import { configFieldRegistry, configGroupRegistry } from "./registries.ts";

test("configFieldRegistry registers schema metadata and is iterable", () => {
  const schema = z.object({ foo: z.string() }).register(configFieldRegistry, {
    urn: "urn:test:foo",
    key: "foo",
    groupId: "test-group",
    title: "Foo Field",
    description: "A test foo field",
  });

  const metadata = configFieldRegistry.get(schema);
  expect(metadata).toEqual({
    urn: "urn:test:foo",
    key: "foo",
    groupId: "test-group",
    title: "Foo Field",
    description: "A test foo field",
    moduleUrl: expect.stringMatching(/src\/registries\.test\.ts$/),
  });

  // Test iterable
  const fields = Array.from(configFieldRegistry as any);
  expect(fields.length).toBeGreaterThan(0);
  const found = fields.find((f: any) => f.meta?.key === "foo");
  expect(found).toBeDefined();
});

test("configGroupRegistry registers group metadata and is iterable", () => {
  z.object({ bar: z.number() }).register(configFieldRegistry, {
    urn: "urn:test:group:bar",
    key: "bar",
    groupId: "test-group-id",
    title: "Bar Field",
  });

  const groupSchema = z.object({ bar: z.number() }).register(configGroupRegistry, {
    urn: "urn:test:group",
    id: "test-group-id",
    title: "Test Group",
    resolveMap: {
      local: ".testrc",
      user: "~/.testrc",
      system: "/etc/testrc",
    },
  });

  const metadata = configGroupRegistry.get(groupSchema);
  expect(metadata).toEqual({
    urn: "urn:test:group",
    id: "test-group-id",
    title: "Test Group",
    resolveMap: {
      local: ".testrc",
      user: "~/.testrc",
      system: "/etc/testrc",
    },
    moduleUrl: expect.stringMatching(/src\/registries\.test\.ts$/),
  });

  // Test iterable
  const groups = Array.from(configGroupRegistry as any);
  expect(groups.length).toBeGreaterThan(0);
  const foundGroup = groups.find((g: any) => g.meta?.id === "test-group-id");
  expect(foundGroup).toBeDefined();
});

test("configGroupRegistry throws error if a field is not registered in configFieldRegistry for groupId", () => {
  const unvalidatedGroup = z.object({
    unregisteredField: z.string(),
  });

  expect(() => {
    unvalidatedGroup.register(configGroupRegistry, {
      urn: "urn:test:invalid-group",
      id: "invalid-group-id",
    });
  }).toThrow(/unregisteredField/);
});
