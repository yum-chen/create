import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export interface CodegenTask {
  src: string;
  dst: string;
  format?: string;
}

export async function generateConfig(configPath = "package.config.ts"): Promise<void> {
  const absPath = resolve(process.cwd(), configPath);
  const fileUrl = pathToFileURL(absPath).href;

  const mod = await import(fileUrl);
  const config = mod.default ?? mod.config ?? mod;

  const tasks: CodegenTask[] =
    Array.isArray(config?.codegen) && config.codegen.length > 0
      ? config.codegen
      : [{ src: configPath, dst: "package.json", format: "json" }];

  for (const task of tasks) {
    const srcPath = resolve(process.cwd(), task.src);
    const srcUrl = pathToFileURL(srcPath).href;
    const srcMod = srcPath === absPath ? mod : await import(srcUrl);
    const srcConfig = srcMod.default ?? srcMod.config ?? srcMod;

    const format = task.format || "json";
    let content = "";

    if (format === "json") {
      const { codegen: _codegen, resolveMap: _resolveMap, ...cleanConfig } = srcConfig;
      content = JSON.stringify(cleanConfig, null, 2) + "\n";
    } else if (format === "text") {
      content = typeof srcConfig === "string" ? srcConfig : String(srcConfig);
    } else {
      content = JSON.stringify(srcConfig, null, 2) + "\n";
    }

    const dstPath = resolve(process.cwd(), task.dst);
    writeFileSync(dstPath, content, "utf-8");
    console.log(`[config-gen] Successfully generated "${task.dst}" from "${task.src}" (${format})`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  generateConfig().catch((err) => {
    console.error("[config-gen] Error generating config:", err);
    process.exit(1);
  });
}
