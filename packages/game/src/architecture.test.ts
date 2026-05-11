import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const forbidden = [
  "@wiai/schema",
  "@wiai/db",
  "@wiai/agent",
  "@colyseus",
  "drizzle-orm",
  "react"
];

function collectTsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? collectTsFiles(path) : [path];
  });
}

describe("package boundaries", () => {
  it("keeps packages/game free of adapter dependencies", () => {
    const files = collectTsFiles(dirname(fileURLToPath(import.meta.url))).filter(
      (file) => !file.endsWith("architecture.test.ts")
    );
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");

    for (const token of forbidden) {
      expect(source).not.toContain(token);
    }
  });
});
