import * as Schema from "../schema.ts";
import pkgJson from "../../package.json" with { type: "json" };
import { configFieldRegistry } from "../registries.ts";
import { seedScopeStore } from "../config.ts";

const NPM_GROUP_ID = "npm-package";
const NPM_GROUP_URN = "config.npm-package";

// Person schema (used for author, contributors, maintainers)
const personSchema = Schema.union([
  Schema.string(),
  Schema.object({
    name: Schema.string(),
    email: Schema.string().optional(),
    url: Schema.string().optional(),
  }),
]).register(configFieldRegistry, {
  urn: "config.npmPackage.person",
  key: "person",
  groupId: NPM_GROUP_ID,
  title: "Person",
  description: "Person schema (used for author, contributors, maintainers)",
});

// Funding schema
const fundingObjectSchema = Schema.object({
  type: Schema.string().optional(),
  url: Schema.string(),
});
export const fundingSchema = Schema.union([
  Schema.string(),
  fundingObjectSchema,
  Schema.array(Schema.union([Schema.string(), fundingObjectSchema])),
]).register(configFieldRegistry, {
  urn: "config.npmPackage.funding",
  key: "funding",
  groupId: NPM_GROUP_ID,
  title: "Person",
  description: "Person schema (used for author, contributors, maintainers)",
});

// Repository schema
const repositoryValueSchema = Schema.union([
  Schema.string(),
  Schema.object({
    type: Schema.string(),
    url: Schema.string(),
    directory: Schema.string().optional(),
  }),
]).register(configFieldRegistry, {
  urn: "config.npmPackage.repository",
  key: "repository",
  groupId: NPM_GROUP_ID,
  title: "Repository",
  description: "Repository schema",
});

// Bugs schema
const bugsValueSchema = Schema.union([
  Schema.string(),
  Schema.object({
    url: Schema.string().optional(),
    email: Schema.string().optional(),
  }),
]);

// Bin schema helper
const binValueSchema = Schema.union([
  Schema.string(),
  Schema.record(Schema.string(), Schema.string()),
]);

// Man schema helper
const manValueSchema = Schema.union([Schema.string(), Schema.array(Schema.string())]);

// Directories schema helper
const directoriesValueSchema = Schema.object({
  bin: Schema.string().optional(),
  doc: Schema.string().optional(),
  lib: Schema.string().optional(),
  man: Schema.string().optional(),
}).passthrough();

// Workspaces schema helper
const workspacesValueSchema = Schema.union([
  Schema.array(Schema.string()),
  Schema.object({
    packages: Schema.array(Schema.string()).optional(),
  }).passthrough(),
]);

// Individual field schemas registered with Schema.config and .meta()
export const nameSchema = Schema.config(Schema.string().nonempty()).meta({
  urn: `${NPM_GROUP_URN}.name`,
  key: "name",
  groupId: NPM_GROUP_ID,
  title: "Name",
  description: `If you plan to publish your package, the most important things in your package.json are the name and version fields as they will be required. The name and version together form an identifier that is assumed to be completely unique. Changes to the package should come along with changes to the version. If you don't plan to publish your package, the name and version fields are optional.

The name is what your thing is called.

Some rules:
  The name must be less than or equal to 214 characters. This includes the scope for scoped packages.
  The names of scoped packages can begin with a dot or an underscore. This is not permitted without a scope.
  New packages must not have uppercase letters in the name.
  The name ends up being part of a URL, an argument on the command line, and a folder name. Therefore, the name can't contain any non-URL-safe characters.

Some tips:
  Don't use the same name as a core Node module.
  Don't put "js" or "node" in the name. It's assumed that it's js, since you're writing a package.json file, and you can specify the engine using the "engines" field. (See below.)
  The name will probably be passed as an argument to require(), so it should be something short, but also reasonably descriptive.
  You may want to check the npm registry to see if there's something by that name already, before you get too attached to it. https://www.npmjs.com/

A name can be optionally prefixed by a scope, e.g. @npm/example. See scope for more detail.`,
  examples: ["@npm/example"],
});

export const versionSchema = Schema.config(Schema.string()).meta({
  urn: `${NPM_GROUP_URN}.version`,
  key: "version",
  groupId: NPM_GROUP_ID,
  title: "Version",
  description: "Version must be parseable by node-semver.",
  examples: ["1.0.0"],
});

export const descriptionSchema = Schema.config(Schema.string()).meta({
  urn: `${NPM_GROUP_URN}.description`,
  key: "description",
  groupId: NPM_GROUP_ID,
  title: "Description",
  description:
    "Put a description in it. It's a string. This helps people discover your package, as it's listed in npm search.",
  examples: ["A packaged foo"],
});

export const keywordsSchema = Schema.config(Schema.array(Schema.string())).meta({
  urn: `${NPM_GROUP_URN}.keywords`,
  key: "keywords",
  groupId: NPM_GROUP_ID,
  title: "Keywords",
  description:
    "Put keywords in it. It's an array of strings. This helps people discover your package as it's listed in npm search.",
  examples: [["node", "javascript", "npm"]],
});

export const homepageSchema = Schema.config(Schema.string()).meta({
  urn: `${NPM_GROUP_URN}.homepage`,
  key: "homepage",
  groupId: NPM_GROUP_ID,
  title: "Homepage",
  description: "The URL to the project homepage.",
  examples: ["https://github.com/npm/example#readme"],
});

export const bugsSchema = Schema.config(bugsValueSchema).meta({
  urn: `${NPM_GROUP_URN}.bugs`,
  key: "bugs",
  groupId: NPM_GROUP_ID,
  title: "Bugs",
  description:
    "The URL to your project's issue tracker and / or the email address to which issues should be reported.",
  examples: [
    {
      url: "https://github.com/npm/example/issues",
      email: "example@npmjs.com",
    },
  ],
});

export const licenseSchema = Schema.config(Schema.string()).meta({
  urn: `${NPM_GROUP_URN}.license`,
  key: "license",
  groupId: NPM_GROUP_ID,
  title: "License",
  description:
    "You should specify a license for your package so that people know how they are permitted to use it, and any restrictions you're placing on it.",
  examples: ["BSD-3-Clause"],
});

export const authorSchema = Schema.config(personSchema).meta({
  urn: `${NPM_GROUP_URN}.author`,
  key: "author",
  groupId: NPM_GROUP_ID,
  title: "Author",
  description: "The author is one person.",
  examples: ["Barney Rubble <barney@npmjs.com> (http://barnyrubble.npmjs.com/)"],
});

export const contributorsSchema = Schema.config(Schema.array(personSchema)).meta({
  urn: `${NPM_GROUP_URN}.contributors`,
  key: "contributors",
  groupId: NPM_GROUP_ID,
  title: "Contributors",
  description: "Contributors is an array of people.",
  examples: [[{ name: "Barney Rubble" }]],
});

export const maintainersSchema = Schema.config(Schema.array(personSchema)).meta({
  urn: `${NPM_GROUP_URN}.maintainers`,
  key: "maintainers",
  groupId: NPM_GROUP_ID,
  title: "Maintainers",
  description: "npm also sets a top-level maintainers field with your npm user info.",
  examples: [[{ name: "Barney Rubble" }]],
});

export const filesSchema = Schema.config(Schema.array(Schema.string())).meta({
  urn: `${NPM_GROUP_URN}.files`,
  key: "files",
  groupId: NPM_GROUP_ID,
  title: "Files",
  description:
    "The optional files field is an array of file patterns that describes the entries to be included when your package is installed as a dependency.",
  examples: [["dist"]],
});

export const mainSchema = Schema.config(Schema.string()).meta({
  urn: `${NPM_GROUP_URN}.main`,
  key: "main",
  groupId: NPM_GROUP_ID,
  title: "Main",
  description: "The main field is a module ID that is the primary entry point to your program.",
  examples: ["./dist/main.mjs"],
});

export const exportsSchema = Schema.config(Schema.unknown()).meta({
  urn: `${NPM_GROUP_URN}.exports`,
  key: "exports",
  groupId: NPM_GROUP_ID,
  title: "Exports",
  description:
    "The exports field provides a modern alternative to main allowing multiple entry points to be defined.",
  examples: [{ ".": "./dist/main.mjs" }],
});

export const typeSchema = Schema.config(Schema.enum(["module", "commonjs"])).meta({
  urn: `${NPM_GROUP_URN}.type`,
  key: "type",
  groupId: NPM_GROUP_ID,
  title: "Type",
  description: "The type field defines how Node.js should interpret .js files in your package.",
  examples: ["module"],
});

export const browserSchema = Schema.config(
  Schema.union([
    Schema.string(),
    Schema.record(Schema.string(), Schema.union([Schema.string(), Schema.boolean()])),
  ]),
).meta({
  urn: `${NPM_GROUP_URN}.browser`,
  key: "browser",
  groupId: NPM_GROUP_ID,
  title: "Browser",
  description:
    "If your module is meant to be used client-side the browser field should be used instead of the main field.",
  examples: ["build/browser.js"],
});

export const binSchema = Schema.config(binValueSchema).meta({
  urn: `${NPM_GROUP_URN}.bin`,
  key: "bin",
  groupId: NPM_GROUP_ID,
  title: "Bin",
  description:
    "A lot of packages have one or more executable files that they'd like to install into the PATH.",
  examples: [{ myapp: "bin/cli.js" }],
});

export const manSchema = Schema.config(manValueSchema).meta({
  urn: `${NPM_GROUP_URN}.man`,
  key: "man",
  groupId: NPM_GROUP_ID,
  title: "Man",
  description: "Specify either a single file or an array of filenames to include as man pages.",
  examples: ["./man/doc.1"],
});

export const directoriesSchema = Schema.config(directoriesValueSchema).meta({
  urn: `${NPM_GROUP_URN}.directories`,
  key: "directories",
  groupId: NPM_GROUP_ID,
  title: "Directories",
  description:
    "The CommonJS Packages spec details a few ways that you can indicate the structure of your package using a directories object.",
  examples: [{ lib: "lib" }],
});

export const repositorySchema = Schema.config(repositoryValueSchema).meta({
  urn: `${NPM_GROUP_URN}.repository`,
  key: "repository",
  groupId: NPM_GROUP_ID,
  title: "Repository",
  description: "Specify the place where your code lives.",
  examples: [
    {
      type: "git",
      url: "git+https://github.com/npm/cli.git",
    },
  ],
});

export const scriptsSchema = Schema.config(Schema.record(Schema.string(), Schema.string())).meta({
  urn: `${NPM_GROUP_URN}.scripts`,
  key: "scripts",
  groupId: NPM_GROUP_ID,
  title: "Scripts",
  description:
    "The scripts property is a dictionary containing script commands that are run at various times in the lifecycle of your package.",
  examples: [{ test: "vp test" }],
});

export const gypfileSchema = Schema.config(Schema.boolean()).meta({
  urn: `${NPM_GROUP_URN}.gypfile`,
  key: "gypfile",
  groupId: NPM_GROUP_ID,
  title: "Gypfile",
  description:
    "Set gypfile to false to prevent npm from automatically building your module with node-gyp.",
  examples: [false],
});

export const configSchema = Schema.config(Schema.record(Schema.string(), Schema.unknown())).meta({
  urn: `${NPM_GROUP_URN}.config`,
  key: "config",
  groupId: NPM_GROUP_ID,
  title: "Config",
  description:
    "A config object can be used to set configuration parameters used in package scripts.",
  examples: [{ port: "8080" }],
});

export const dependenciesSchema = Schema.config(
  Schema.record(Schema.string(), Schema.string()),
).meta({
  urn: `${NPM_GROUP_URN}.dependencies`,
  key: "dependencies",
  groupId: NPM_GROUP_ID,
  title: "Dependencies",
  description:
    "Dependencies are specified in a simple object that maps a package name to a version range.",
  examples: [{ zod: "^4.0.0" }],
});

export const devDependenciesSchema = Schema.config(
  Schema.record(Schema.string(), Schema.string()),
).meta({
  urn: `${NPM_GROUP_URN}.devDependencies`,
  key: "devDependencies",
  groupId: NPM_GROUP_ID,
  title: "DevDependencies",
  description: "Map additional tools needed for development in a devDependencies object.",
  examples: [{ "vite-plus": "^1.0.0" }],
});

export const peerDependenciesSchema = Schema.config(
  Schema.record(Schema.string(), Schema.string()),
).meta({
  urn: `${NPM_GROUP_URN}.peerDependencies`,
  key: "peerDependencies",
  groupId: NPM_GROUP_ID,
  title: "PeerDependencies",
  description: "Express the compatibility of your package with a host tool or library.",
  examples: [{ typescript: "^7.0.0" }],
});

export const peerDependenciesMetaSchema = Schema.config(
  Schema.record(Schema.string(), Schema.object({ optional: Schema.boolean().optional() })),
).meta({
  urn: `${NPM_GROUP_URN}.peerDependenciesMeta`,
  key: "peerDependenciesMeta",
  groupId: NPM_GROUP_ID,
  title: "PeerDependenciesMeta",
  description: "Provides npm more information on how your peer dependencies are to be used.",
  examples: [{ "@npm/soy-milk": { optional: true } }],
});

export const bundleDependenciesSchema = Schema.config(
  Schema.union([Schema.array(Schema.string()), Schema.boolean()]),
).meta({
  urn: `${NPM_GROUP_URN}.bundleDependencies`,
  key: "bundleDependencies",
  groupId: NPM_GROUP_ID,
  title: "BundleDependencies",
  description:
    "Defines an array of package names that will be bundled when publishing the package.",
  examples: [["@npm/renderized"]],
});

export const bundledDependenciesSchema = Schema.config(
  Schema.union([Schema.array(Schema.string()), Schema.boolean()]),
).meta({
  urn: `${NPM_GROUP_URN}.bundledDependencies`,
  key: "bundledDependencies",
  groupId: NPM_GROUP_ID,
  title: "BundledDependencies",
  description: "Alternative spelling for bundleDependencies.",
  examples: [["@npm/renderized"]],
});

export const optionalDependenciesSchema = Schema.config(
  Schema.record(Schema.string(), Schema.string()),
).meta({
  urn: `${NPM_GROUP_URN}.optionalDependencies`,
  key: "optionalDependencies",
  groupId: NPM_GROUP_ID,
  title: "OptionalDependencies",
  description: "Map of package name to version or URL that npm can proceed if installation fails.",
  examples: [{ "@npm/foo": "^1.0.0" }],
});

export const overridesSchema = Schema.config(Schema.record(Schema.string(), Schema.unknown())).meta(
  {
    urn: `${NPM_GROUP_URN}.overrides`,
    key: "overrides",
    groupId: NPM_GROUP_ID,
    title: "Overrides",
    description:
      "Replace a package in your dependency tree with another version or package entirely.",

    examples: [{ vite: "npm:@voidzero-dev/vite-plus-core@1.0.0-rc.1" }],
  },
);

export const packageExtensionsSchema = Schema.config(
  Schema.record(Schema.string(), Schema.unknown()),
).meta({
  urn: `${NPM_GROUP_URN}.packageExtensions`,
  key: "packageExtensions",
  groupId: NPM_GROUP_ID,
  title: "PackageExtensions",
  description: "Apply small, declarative repairs to the manifests of third-party dependencies.",
  examples: [
    {
      "broken-package@1": { dependencies: { "missing-dep": "^2.0.0" } },
    },
  ],
});

export const enginesSchema = Schema.config(Schema.record(Schema.string(), Schema.string())).meta({
  urn: `${NPM_GROUP_URN}.engines`,
  key: "engines",
  groupId: NPM_GROUP_ID,
  title: "Engines",
  description: "Specify the version of node or npm that your stuff works on.",
  examples: [{ node: ">=18" }],
});

export const osSchema = Schema.config(
  Schema.union([Schema.string(), Schema.array(Schema.string())]),
).meta({
  urn: `${NPM_GROUP_URN}.os`,
  key: "os",
  groupId: NPM_GROUP_ID,
  title: "OS",
  description: "Specify which operating systems your module will run on.",
  examples: [["darwin", "linux"]],
});

export const cpuSchema = Schema.config(
  Schema.union([Schema.string(), Schema.array(Schema.string())]),
).meta({
  urn: `${NPM_GROUP_URN}.cpu`,
  key: "cpu",
  groupId: NPM_GROUP_ID,
  title: "CPU",
  description: "Specify which cpu architectures your module will run on.",
  examples: [["x64", "ia32"]],
});

export const libcSchema = Schema.config(
  Schema.union([Schema.string(), Schema.array(Schema.string())]),
).meta({
  urn: `${NPM_GROUP_URN}.libc`,
  key: "libc",
  groupId: NPM_GROUP_ID,
  title: "Libc",
  description: "Specify which versions of libc your module runs or builds in.",
  examples: ["glibc"],
});

export const devEnginesSchema = Schema.config(
  Schema.record(Schema.string(), Schema.unknown()),
).meta({
  urn: `${NPM_GROUP_URN}.devEngines`,
  key: "devEngines",
  groupId: NPM_GROUP_ID,
  title: "DevEngines",
  description: "Aids engineers working on a codebase to all be using the same tooling.",
  examples: [{ packageManager: { name: "npm", version: "11.11.0" } }],
});

export const privateSchema = Schema.config(Schema.boolean()).meta({
  urn: `${NPM_GROUP_URN}.private`,
  key: "private",
  groupId: NPM_GROUP_ID,
  title: "Private",
  description: "If set to true, npm will refuse to publish it.",
  examples: [true],
});

export const publishConfigSchema = Schema.config(
  Schema.record(Schema.string(), Schema.unknown()),
).meta({
  urn: `${NPM_GROUP_URN}.publishConfig`,
  key: "publishConfig",
  groupId: NPM_GROUP_ID,
  title: "PublishConfig",
  description: "Set of config values that will be used at publish-time.",
  examples: [{ access: "public" }],
});

export const workspacesSchema = Schema.config(workspacesValueSchema).meta({
  urn: `${NPM_GROUP_URN}.workspaces`,
  key: "workspaces",
  groupId: NPM_GROUP_ID,
  title: "Workspaces",
  description: "Describes locations within the local file system for workspace packages.",
  examples: [["./packages/*"]],
});

// Full npm package.json schema registered without repeating individual field schemas
const npmPackageSchema = Schema.configGroup().meta({
  urn: NPM_GROUP_URN,
  id: NPM_GROUP_ID,
  title: "npm package.json",
  description: "Schema for npm package.json manifest",
  resolveMap: {
    local: "package.json",
  },
});

const configs = npmPackageSchema.parse(pkgJson);
seedScopeStore(NPM_GROUP_ID, "local", configs);
const value = configs;

export type NpmPackageConfig = Schema.infer<typeof npmPackageSchema>;

export { configs, npmPackageSchema, value };
