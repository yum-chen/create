import type { core, ZodType } from "zod";

export declare const $output: unique symbol;
export type $output = typeof $output;
export declare const $input: unique symbol;
export type $input = typeof $input;

export type $replace<Meta, S extends ZodType<any, any, any>> = Meta extends $output
  ? core.output<S>
  : Meta extends $input
    ? core.input<S>
    : Meta extends (infer M)[]
      ? $replace<M, S>[]
      : Meta extends (...args: infer P) => infer R
        ? (...args: { [K in keyof P]: $replace<P[K], S> }) => $replace<R, S>
        : Meta extends object
          ? { [K in keyof Meta]: $replace<Meta[K], S> }
          : Meta;

export type MetadataType = object | undefined;

export declare class $SchemaRegistry<
  Meta extends MetadataType = MetadataType,
  Schema extends ZodType<any, any, any> = any,
> extends core.$ZodRegistry<Meta, any> {
  _meta: Meta;
  _schema: Schema;
  _map: WeakMap<any, any>;
  _idmap: Map<string, any>;
  add<S extends Schema>(
    schema: S,
    ..._meta: undefined extends Meta ? [core.$replace<Meta, S>?] : [core.$replace<Meta, S>]
  ): this;
  clear(): this;
  remove(schema: Schema | string): this;
  get<S extends Schema>(schema: S | string): core.$replace<Meta, S> | undefined;
  has(schema: Schema | string): boolean;
  readonly size: number;
  [Symbol.iterator](): IterableIterator<[Schema | string, core.$replace<Meta, Schema>]>;
  entries(): IterableIterator<[Schema | string, core.$replace<Meta, Schema>]>;
  keys(): IterableIterator<Schema | string>;
  values(): IterableIterator<core.$replace<Meta, Schema>>;
}

export declare type $ZodRegistry<
  Meta extends MetadataType = MetadataType,
  Schema extends ZodType<any, any, any> = any,
> = $SchemaRegistry<Meta, Schema>;

export interface JSONSchemaMeta {
  id?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  deprecated?: boolean | undefined;
  [k: string]: unknown;
}

export interface GlobalMeta extends JSONSchemaMeta {}

export declare function registry<
  T extends MetadataType = MetadataType,
  S extends ZodType<any, any, any> = any,
>(): $SchemaRegistry<T, S>;

export declare const globalRegistry: $SchemaRegistry<GlobalMeta>;

export declare const s: typeof import("zod").z;
export { z } from "zod";
export * from "zod";

export declare function config<T extends ZodType<any, any, any>, M = any>(
  schema: T,
  meta?: M,
): T & {
  meta: (m: M) => T & { meta: any; describe: any };
  describe: (desc: string) => T & { meta: any; describe: any };
};

export declare function configGroup<
  T extends ZodType<any, any, any> = ZodType<any, any, any>,
  M = any,
>(
  schema?: T | M,
  meta?: M,
): T & {
  meta: (m: M) => T & { meta: any; describe: any };
  describe: (desc: string) => T & { meta: any; describe: any };
};
