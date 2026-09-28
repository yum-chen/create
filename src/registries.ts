import {
  fieldsByGroupIdMap,
  registeredFieldsMap,
  registeredGroupsMap,
  registerCustomRegistry,
  registry,
  validateGroupFields,
} from "./schema.ts";

/** Metadata base for all registries. */
export type MetadataBase = {
  urn: string;
  title?: string;
  description?: string;
  moduleUrl?: string;
  hash?: string;
  deprecated?: boolean;
  examples?: any[];
};

export type MetadataConfigField = {
  key: string;
  groupId: string;
} & MetadataBase;

export type MetadataConfigGroup = {
  id: string;
  resolveMap?: {
    system?: string | string[];
    user?: string | string[];
    local?: string | string[];
  };
} & MetadataBase;

/**
 * Configuration field registry.
 * Configuration fields are key-value pairs within a ZodType.
 */
export const configFieldRegistry = registry<MetadataConfigField, any>();

export const configFieldReg = configFieldRegistry;

/**
 * Configuration group registry.
 * Configuration groups are collections of configuration fields sharing the same grouping.
 */
export const configGroupRegistry = registry<MetadataConfigGroup, any>();

export const configGroupReg = configGroupRegistry;

registerCustomRegistry("field", configFieldRegistry);
registerCustomRegistry("group", configGroupRegistry);

const origFieldAdd = configFieldRegistry.add.bind(configFieldRegistry);
configFieldRegistry.add = function (schema: any, meta: any) {
  if (meta && typeof meta === "object" && meta.groupId && meta.key) {
    registeredFieldsMap.set(`${meta.groupId}:${meta.key}`, meta);

    let groupFields = fieldsByGroupIdMap.get(meta.groupId);
    if (!groupFields) {
      groupFields = new Map();
      fieldsByGroupIdMap.set(meta.groupId, groupFields);
    }
    groupFields.set(meta.key, { schema, meta });
  }
  return origFieldAdd(schema, meta);
};

const origGroupAdd = configGroupRegistry.add.bind(configGroupRegistry);
configGroupRegistry.add = function (schema: any, meta: any) {
  if (meta && typeof meta === "object" && meta.id) {
    if (schema) {
      validateGroupFields(schema, meta.id);
    }
    registeredGroupsMap.set(meta.id, { schema, meta });
  }
  return origGroupAdd(schema, meta);
};
