import type { NpmPackageConfig } from "./config/npm-package.ts";

/**
 * Mapping of group identifiers / URNs to their respective typed configuration object interfaces.
 * Can be augmented by user applications or plugins via declaration merging:
 *
 * ```ts
 * declare module "@lib/config" {
 *   interface UserConfigGroupMap {
 *     "my-group": MyCustomGroupConfig;
 *   }
 * }
 * ```
 */
export interface UserConfigGroupMap {
  "npm-package-json": NpmPackageConfig;
  "config.npmPackage": NpmPackageConfig;
  npmPackage: NpmPackageConfig;
  "urn:npm:package": NpmPackageConfig;
  [key: string]: Record<string, any>;
}

/**
 * Base or combined user configuration type.
 */
export interface UserConfig extends NpmPackageConfig {
  [key: string]: any;
}

/**
 * Type helper for strongly typed defineConfig functions.
 */
export type DefineConfigFn<T = UserConfig> = <C extends T = T>(config: C) => C;

export type Scope = "local" | "user" | "system";
