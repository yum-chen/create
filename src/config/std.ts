import * as Schema from "../schema.ts";
import { seedScopeStore } from "../config.ts";

const STD_GROUP_ID = "std";
const STD_GROUP_URN = "config.std";

export const resolveMapSchema = Schema.config(
  Schema.object({
    system: Schema.union([Schema.string(), Schema.array(Schema.string())]).optional(),
    user: Schema.union([Schema.string(), Schema.array(Schema.string())]).optional(),
    local: Schema.union([Schema.string(), Schema.array(Schema.string())]).optional(),
  }).passthrough(),
).meta({
  urn: `${STD_GROUP_URN}.resolveMap`,
  key: "resolveMap",
  groupId: STD_GROUP_ID,
  title: "Default Resolve Map",
  description: "Default resolver map for configuration groups across scopes",
  examples: [{ local: "package.config.ts" }],
});

export const codegenItemSchema = Schema.object({
  src: Schema.string(),
  dst: Schema.string(),
  format: Schema.enum(["json", "yaml", "toml", "text"]).default("json").optional(),
});

export const codegenSchema = Schema.config(Schema.array(codegenItemSchema)).meta({
  urn: `${STD_GROUP_URN}.codegen`,
  key: "codegen",
  groupId: STD_GROUP_ID,
  title: "Codegen Configurations",
  description: "Array of codegen tasks mapping source configuration files to generated outputs",
  examples: [[{ src: "package.config.ts", dst: "package.json", format: "json" }]],
});

export const stdSchema = Schema.configGroup().meta({
  urn: STD_GROUP_URN,
  id: STD_GROUP_ID,
  title: "Standard Config",
  description: "Standard configuration for @lib/config including codegen and default resolvers",
  resolveMap: {
    local: "package.config.ts",
  },
});

export const stdConfigs = {
  resolveMap: {
    local: "package.config.ts",
  },
  codegen: [
    {
      src: "package.config.ts",
      dst: "package.json",
      format: "json",
    },
  ],
};

seedScopeStore(STD_GROUP_ID, "local", stdConfigs);
export const stdValue = stdConfigs;

export type StdConfig = Schema.infer<typeof stdSchema>;
