# @lib/config

Configuration management library built on top of Zod schema definitions with support for URN resolution, proxy-intercepted schema metadata, group definitions, scope stores (`local`, `user`, `system`), and CLI commands.

## Features

- **Proxy-Intercepted `.meta()` Chaining**: Define fields and config groups with `Schema.config(schema).meta(metadata)` and `Schema.configGroup(schema).meta(metadata)` while chaining Zod validation methods.
- **Strongly Typed `defineConfig`**: Create typed configuration helper functions with `Config.createDefine("groupId")` or `createDefineConfig(schema)`.
- **Flexible Global & Instance Resolution**: Resolve configuration keys using full URNs (e.g., `urn:config.npmPackage:name`), prefixed paths (`config.npmPackage.name`), short paths (`npmPackage:name`, `npmPackage.name`), or group instances (`new Config("npmPackage")`).
- **Scope-Aware Management**: Supports scope stores (`local`, `user`, `system`) with automatic fallback priority (`local` -> `user` -> `system`).
- **CLI Command Interface**: Built-in CLI runner supporting `get` and `set` commands with `--scope=<scope>`.

---

## Installation & Setup

```bash
npm install
npm test
```

---

## Usage Guide

### 1. Defining Config Schemas

Register individual configuration fields and config groups using `.meta(...)`:

```ts
import * as Schema from "@lib/config";

// Register individual field
export const nameSchema = Schema.config(Schema.string().nonempty()).meta({
  urn: "urn:config.npmPackage:name",
  key: "name",
  groupId: "npm-package",
  title: "Name",
});

// Register config group
export const npmPackageSchema = Schema.configGroup(
  Schema.object({
    name: nameSchema.optional(),
  }),
).meta({
  urn: "urn:config.npmPackage",
  id: "npm-package",
  title: "npm package.json",
  resolveMap: {
    local: "package.json",
  },
});
```

### 2. Creating `defineConfig` Functions

Create strongly-typed `defineConfig` functions from a group ID or schema object:

```ts
import { Config, createDefineConfig } from "@lib/config";

// From group ID string
const defineConfig = Config.createDefine("config.npmPackage");

export default defineConfig({
  name: "my-awesome-package",
  version: "1.0.0",
});
```

### 3. Instance Configuration (`new Config`)

Access and update configuration for a specific group:

```ts
import { Config } from "@lib/config";

const npmConfig = new Config("npmPackage");

// Get a field
const name = npmConfig.get("name");

// Set a field in 'local' scope (default)
npmConfig.set("name", "my-new-name");

// Set a field in 'user' or 'system' scope
npmConfig.set("name", "user-name", "user");
```

### 4. Global Resolution (`Config.get` & `Config.set`)

Resolve configuration across all registered schemas using full URNs or short key paths:

```ts
import { Config } from "@lib/config";

// Supports full URN or short keys
Config.get("urn:config.npmPackage:name");
Config.get("config.npmPackage.name");
Config.get("npmPackage:name");
Config.get("npmPackage.name");

// Set values
Config.set("npmPackage.name", "new-name", "local");
```

### 5. Scope Resolution

Scope stores resolve values in order of priority: `local` -> `user` -> `system`.

```ts
import { Config } from "@lib/config";

Config.set("npmPackage.name", "system-val", "system");
Config.set("npmPackage.name", "user-val", "user");

// Returns 'user-val' because 'user' takes precedence over 'system' (local is undefined)
console.log(Config.get("npmPackage.name"));

// Explicit scope query
console.log(Config.get("npmPackage.name", "system")); // 'system-val'
```

### 6. CLI Usage

The package exports a CLI runner for command line access:

```bash
# Get configuration value
npm start -- get npmPackage.name
npm start -- get --scope=local npmPackage.name

# Set configuration value
npm start -- set npmPackage.name "my-updated-package"
npm start -- set --scope=user npmPackage.name "user-override"
```

---

## Development & Building

```bash
# Run tests
npm test

# Format & Lint
npm run fmt
npm run check

# Build
npm run build
```
