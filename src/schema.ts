import { pathToFileURL } from "node:url";
import { type ZodType, globalRegistry as defaultGlobalRegistry } from "zod";
import {
  buildGroupSchemaFromFields,
  configFieldRegistry,
  configGroupRegistry,
  type MetadataConfigField,
} from "./registries.ts";

export function getCallerModuleUrl(): string | undefined {
  const stack = new Error().stack;
  if (!stack) return undefined;
  const lines = stack.split("\n");

  for (const line of lines) {
    if (
      line.includes("schema.ts") ||
      line.includes("schema.js") ||
      line.includes("registries.ts") ||
      line.includes("registries.js") ||
      line.includes("node:internal") ||
      line.includes("node_modules")
    ) {
      continue;
    }

    const match = line.match(/(https?:\/\/|file:\/\/|\/|[A-Za-z]:[\\/])[^\s):]+/);
    if (match) {
      let filePath = match[0];
      filePath = filePath.replace(/(:\d+)+$/, "");

      if (
        filePath.startsWith("file://") ||
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
      ) {
        return filePath;
      }
      try {
        return pathToFileURL(filePath).href;
      } catch {
        return filePath;
      }
    }
  }
  return undefined;
}

export * from "zod";
export { z as s } from "zod";

export type MetadataType = object | undefined;

function createRegistryEntry(schema: any, meta: any): [any, any] & { schema: any; meta: any } {
  const tuple = [schema, meta] as any;
  tuple.schema = schema;
  tuple.meta = meta;
  return tuple;
}

const ZodRegistryBase = (defaultGlobalRegistry?.constructor || class {}) as any;

export class $SchemaRegistry<
  Meta extends MetadataType = MetadataType,
  Schema extends ZodType = ZodType,
> extends ZodRegistryBase {
  _meta!: Meta;
  _schema!: Schema;
  _map: WeakMap<any, any> = new WeakMap();
  _idmap: Map<string, any> = new Map();
  private _entries: Array<[any, any] & { schema: any; meta: any }> = [];

  add<S extends Schema>(schema: S, ..._metaArr: undefined extends Meta ? [any?] : [any]): this {
    const meta = _metaArr[0];
    if (meta && typeof meta === "object") {
      if (!meta.moduleUrl) {
        const callerUrl = getCallerModuleUrl();
        if (callerUrl) {
          meta.moduleUrl = callerUrl;
        }
      }
    }

    if (schema && (typeof schema === "object" || typeof schema === "function")) {
      this._map.set(schema, meta);
    }

    if (meta && typeof meta === "object") {
      const keyId = meta.id || meta.urn || meta.key;
      if (keyId && typeof keyId === "string") {
        this._idmap.set(keyId, schema);
      }
      if (meta.groupId && meta.key) {
        this._idmap.set(`${meta.groupId}:${meta.key}`, schema);
        this._idmap.set(`${meta.groupId}.${meta.key}`, schema);
      }
    }

    const entry = createRegistryEntry(schema, meta);
    const existingIdx = this._entries.findIndex(([s]) => s === schema);
    if (existingIdx >= 0) {
      this._entries[existingIdx] = entry;
    } else {
      this._entries.push(entry);
    }

    return this;
  }

  clear(): this {
    this._map = new WeakMap();
    this._idmap.clear();
    this._entries = [];
    return this;
  }

  remove(schemaOrKey: Schema | string): this {
    if (typeof schemaOrKey === "string") {
      const schema = this._idmap.get(schemaOrKey);
      this._idmap.delete(schemaOrKey);
      if (schema) {
        this._map.delete(schema);
        this._entries = this._entries.filter(([s]) => s !== schema);
      }
    } else {
      this._map.delete(schemaOrKey);
      for (const [k, v] of this._idmap.entries()) {
        if (v === schemaOrKey) {
          this._idmap.delete(k);
        }
      }
      this._entries = this._entries.filter(([s]) => s !== schemaOrKey);
    }
    return this;
  }

  get<S extends Schema>(schemaOrKey: S | string): any {
    if (typeof schemaOrKey === "string") {
      const schema = this._idmap.get(schemaOrKey);
      if (schema) {
        return this._map.get(schema);
      }
      for (const [, meta] of this._entries) {
        if (
          meta &&
          (meta.id === schemaOrKey ||
            meta.key === schemaOrKey ||
            meta.urn === schemaOrKey ||
            `${meta.groupId}:${meta.key}` === schemaOrKey ||
            `${meta.groupId}.${meta.key}` === schemaOrKey)
        ) {
          return meta;
        }
      }
      return undefined;
    }
    return this._map.get(schemaOrKey);
  }

  has(schemaOrKey: Schema | string): boolean {
    if (typeof schemaOrKey === "string") {
      if (this._idmap.has(schemaOrKey)) return true;
      for (const [, meta] of this._entries) {
        if (
          meta &&
          (meta.id === schemaOrKey ||
            meta.key === schemaOrKey ||
            meta.urn === schemaOrKey ||
            `${meta.groupId}:${meta.key}` === schemaOrKey ||
            `${meta.groupId}.${meta.key}` === schemaOrKey)
        ) {
          return true;
        }
      }
      return false;
    }
    return this._map.has(schemaOrKey);
  }

  get size(): number {
    return this._entries.length;
  }

  [Symbol.iterator](): IterableIterator<[any, any]> {
    return this._entries[Symbol.iterator]();
  }

  entries(): IterableIterator<[any, any]> {
    return this._entries[Symbol.iterator]();
  }

  keys(): IterableIterator<any> {
    return this._entries.map(([k]) => k)[Symbol.iterator]();
  }

  values(): IterableIterator<any> {
    return this._entries.map(([, v]) => v)[Symbol.iterator]();
  }
}

export type $ZodRegistry<
  Meta extends MetadataType = MetadataType,
  Schema extends ZodType = ZodType,
> = $SchemaRegistry<Meta, Schema>;

export function registry<
  T extends MetadataType = MetadataType,
  S extends ZodType = ZodType,
>(): $SchemaRegistry<T, S> {
  return new $SchemaRegistry<T, S>();
}

export const globalRegistry = registry<any>();

function getRegistry(registryOrGetter: any): any {
  return typeof registryOrGetter === "function" ? registryOrGetter() : registryOrGetter;
}

function createConfigProxy<T extends ZodType<any>, M>(
  schema: T | undefined,
  registryTarget: any,
  initialMeta?: M,
): any {
  let currentSchema: any = schema;
  let currentMeta: any = initialMeta ? { ...initialMeta } : undefined;

  if (currentMeta) {
    if (!currentMeta.moduleUrl) {
      const callerUrl = getCallerModuleUrl();
      if (callerUrl) {
        currentMeta.moduleUrl = callerUrl;
      }
    }
    if (!currentSchema && currentMeta.id) {
      currentSchema = buildGroupSchemaFromFields(currentMeta.id);
    }
    if (currentSchema) {
      getRegistry(registryTarget).add(currentSchema, currentMeta);
    }
  }

  const dummyTarget = function () {};

  const handler: ProxyHandler<any> = {
    get(_target, prop, _receiver) {
      if (prop === "meta") {
        return (meta: M) => {
          const callerUrl = getCallerModuleUrl();
          currentMeta = currentMeta ? { ...currentMeta, ...meta } : { ...meta };
          if (!currentMeta.moduleUrl && callerUrl) {
            currentMeta.moduleUrl = callerUrl;
          }
          if (!currentSchema && currentMeta.id) {
            currentSchema = buildGroupSchemaFromFields(currentMeta.id);
          }
          if (currentSchema) {
            const reg = getRegistry(registryTarget);
            reg.add(currentSchema, currentMeta);
            reg.add(proxy, currentMeta);
          }
          return proxy;
        };
      }

      if (prop === "describe") {
        return (description: string) => {
          if (currentSchema && typeof currentSchema.describe === "function") {
            const res = currentSchema.describe(description);
            if (res && typeof res === "object") {
              currentSchema = res;
            }
          }
          currentMeta = currentMeta ? { ...currentMeta, description } : { description };
          if (!currentSchema && currentMeta.id) {
            currentSchema = buildGroupSchemaFromFields(currentMeta.id);
          }
          if (currentSchema) {
            const reg = getRegistry(registryTarget);
            reg.add(currentSchema, currentMeta);
            reg.add(proxy, currentMeta);
          }
          return proxy;
        };
      }

      if (!currentSchema && prop === "parse") {
        return function (input: any) {
          if (currentMeta && currentMeta.id) {
            currentSchema = buildGroupSchemaFromFields(currentMeta.id);
          }
          if (currentSchema) {
            return currentSchema.parse(input);
          }
          throw new Error("Config schema is not initialized or registered with metadata.");
        };
      }

      if (!currentSchema) {
        return undefined;
      }

      const val = Reflect.get(currentSchema, prop, currentSchema);
      if (typeof val === "function") {
        return function (this: any, ...args: any[]) {
          const res = val.apply(currentSchema, args);
          if (
            res &&
            typeof res === "object" &&
            (typeof res.parse === "function" || typeof res._def === "object")
          ) {
            currentSchema = res;
            if (currentMeta) {
              const reg = getRegistry(registryTarget);
              reg.add(currentSchema, currentMeta);
              reg.add(proxy, currentMeta);
            }
            return proxy;
          }
          return res;
        };
      }
      return val;
    },
  };

  const proxy = new Proxy(dummyTarget, handler);
  if (currentMeta && currentSchema) {
    getRegistry(registryTarget).add(proxy, currentMeta);
  }
  return proxy as any;
}

function createConfigWrapper<M>(registryTarget: any) {
  function configFn<T extends ZodType<any>>(
    schema: T,
    meta?: M,
  ): T & { meta: (m: M) => T; describe: (d: string) => T } {
    return createConfigProxy(schema, registryTarget, meta);
  }

  return new Proxy(configFn, {
    apply(_target, _thisArg, argArray: [any, any?]) {
      const [schema, meta] = argArray;
      return createConfigProxy(schema, registryTarget, meta);
    },
  });
}

/**
 * Proxy for registering a single configuration field schema into `configFieldRegistry`.
 */
export const config = createConfigWrapper<MetadataConfigField>(() => configFieldRegistry);

/**
 * Proxy for registering a configuration group schema into `configGroupRegistry`.
 * Does not require passing individual field schemas in Schema.object({...}).
 */
export const configGroup = new Proxy(
  function (arg1?: any, arg2?: any) {
    if (arg1 && typeof arg1 === "object" && (arg1.id || arg1.urn) && !arg1._def) {
      return createConfigProxy(undefined, () => configGroupRegistry, arg1);
    }
    return createConfigProxy(arg1, () => configGroupRegistry, arg2);
  },
  {
    apply(_target, _thisArg, argArray: [any?, any?]) {
      const [arg1, arg2] = argArray;
      if (arg1 && typeof arg1 === "object" && (arg1.id || arg1.urn) && !arg1._def) {
        return createConfigProxy(undefined, () => configGroupRegistry, arg1);
      }
      return createConfigProxy(arg1, () => configGroupRegistry, arg2);
    },
  },
) as any;
