import * as Schema from "../schema.ts";
import { seedScopeStore } from "../config.ts";

const STD_GROUP_ID = "std";
const STD_GROUP_URN = "urn:config:std";

export const codegenItemSchema = Schema.object({
  src: Schema.string(),
  dst: Schema.string(),
  format: Schema.string().default("json"),
});

export const codegenSchema = Schema.config(Schema.array(codegenItemSchema)).meta({
  urn: `${STD_GROUP_URN}.codegen`,
  key: "codegen",
  groupId: STD_GROUP_ID,
  title: "Codegen Configuration",
  description:
    "Array of file code generation configurations specifying source, destination, and format.",
  examples: [[{ src: "package.config.ts", dst: "package.json", format: "json" }]],
});

export const resolveMapSchema = Schema.config(Schema.record(Schema.string(), Schema.string())).meta(
  {
    urn: `${STD_GROUP_URN}.resolveMap`,
    key: "resolveMap",
    groupId: STD_GROUP_ID,
    title: "Default Resolver Map",
    description: "Map of scope or target identifiers to file paths.",
    examples: [{ local: "package.json" }],
  },
);

export const stdSchema = Schema.configGroup().meta({
  urn: STD_GROUP_URN,
  id: STD_GROUP_ID,
  title: "Standard Config",
  description: "Standard configuration group including resolveMap and codegen settings.",
  resolveMap: {
    local: "std.config.ts",
  },
  codegen: [
    {
      src: "package.config.ts",
      dst: "package.json",
      format: "json",
    },
  ],
});

export const defaultStdConfig = {
  resolveMap: {
    local: "std.config.ts",
  },
  codegen: [
    {
      src: "package.config.ts",
      dst: "package.json",
      format: "json",
    },
  ],
};

seedScopeStore(STD_GROUP_ID, "local", defaultStdConfig);

export const stdConfigs = stdSchema.parse(defaultStdConfig);
export const stdValue = stdConfigs;
export const configs = stdConfigs;
export const value = stdValue;
