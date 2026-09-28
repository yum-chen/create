import { cli } from "./cli.ts";

export * from "./cli.ts";
export * from "./config.ts";
export type * from "./config.d.ts";
export * from "./config/npm-package.ts";
export type * from "./config/npm-package.d.ts";
export * from "./registries.ts";
export * from "./schema.ts";
export { set } from "./config.ts";

export const main = (args: string[] = process.argv.slice(2)) => {
  if (args.length > 0) {
    return cli(args);
  }
  return "Hello, world!";
};
