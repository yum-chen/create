import { expect, test } from "vite-plus/test";
import { configFieldRegistry, configGroupRegistry } from "./registries.ts";
import * as Schema from "./schema.ts";

test("Schema.s is re-exported alias for Schema.z", () => {
  expect(Schema.s).toBe(Schema.z);
});

test("Schema.config supports .describe() chaining and registers description in configFieldRegistry", () => {
  const describedField = Schema.config(Schema.string()).describe("An awesome description").meta({
    urn: "urn:test:field:described",
    key: "described",
    groupId: "test-group-id",
  });

  expect(describedField.parse("hello")).toBe("hello");

  const meta = configFieldRegistry.get(describedField);
  expect(meta?.description).toBe("An awesome description");
  expect(meta?.key).toBe("described");
});

test("Schema.registry ($SchemaRegistry) supports string key lookup, size, iteration, remove, clear", () => {
  const reg = Schema.registry<{ id: string; title: string }>();
  const strSchema = Schema.string();
  const numSchema = Schema.number();

  reg.add(strSchema, { id: "str-key", title: "String Field" });
  reg.add(numSchema, { id: "num-key", title: "Number Field" });

  expect(reg.size).toBe(2);

  // Lookup by schema object
  expect(reg.get(strSchema)).toEqual({ id: "str-key", title: "String Field" });

  // Lookup by string key
  expect(reg.has("str-key")).toBe(true);
  expect(reg.get("str-key")).toEqual({ id: "str-key", title: "String Field" });
  expect(reg.has("nonexistent")).toBe(false);

  // Iteration
  const entries = Array.from(reg);
  expect(entries.length).toBe(2);
  expect(entries[0]![1]).toEqual({ id: "str-key", title: "String Field" });

  // Remove by string key
  reg.remove("str-key");
  expect(reg.size).toBe(1);
  expect(reg.has("str-key")).toBe(false);

  // Clear
  reg.clear();
  expect(reg.size).toBe(0);
});

test("Schema.config registers single field schema into configFieldRegistry using .meta()", () => {
  const nameField = Schema.config(Schema.string().min(1)).meta({
    urn: "urn:test:field:name",
    key: "name",
    groupId: "test-group-id",
    title: "Name Field",
  });

  expect(nameField.parse("my-name")).toBe("my-name");

  const meta = configFieldRegistry.get(nameField);
  expect(meta).toEqual({
    urn: "urn:test:field:name",
    key: "name",
    groupId: "test-group-id",
    title: "Name Field",
  });
});

test("Schema.config supports chaining method calls before .meta()", () => {
  const urnField = Schema.config(Schema.string()).startsWith("urn:").meta({
    urn: "urn:test:field:urnField",
    key: "urnField",
    groupId: "test-group-id",
    title: "URN Field",
  });

  expect(urnField.parse("urn:valid")).toBe("urn:valid");
  expect(() => urnField.parse("invalid")).toThrow();

  const meta = configFieldRegistry.get(urnField);
  expect(meta?.urn).toBe("urn:test:field:urnField");
});

test("Schema.config supports integer/number positive().meta()", () => {
  const positiveInt = Schema.config(Schema.number().int()).positive().meta({
    urn: "urn:test:field:positiveInt",
    key: "positiveInt",
    groupId: "test-group-id",
    title: "Positive Int Field",
  });

  expect(positiveInt.parse(5)).toBe(5);
  expect(() => positiveInt.parse(-5)).toThrow();
  expect(configFieldRegistry.get(positiveInt)?.key).toBe("positiveInt");
});

test("Schema.configGroup registers group schema into configGroupRegistry without passing field schemas", () => {
  Schema.config(Schema.number()).meta({
    urn: "urn:test:field:age",
    key: "age",
    groupId: "user-config",
    title: "Age Field",
  });

  const userGroup = Schema.configGroup().meta({
    urn: "urn:test:group:user",
    id: "user-config",
    title: "User Config",
  });

  const meta = configGroupRegistry.get(userGroup);
  expect(meta).toEqual({
    urn: "urn:test:group:user",
    id: "user-config",
    title: "User Config",
  });

  const parsed = userGroup.parse({ age: 25 });
  expect(parsed.age).toBe(25);
});
