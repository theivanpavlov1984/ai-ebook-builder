import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = join(process.cwd(), "src");
const roots = ["components", "app"].map((d) => join(src, d));
// Covers are content with their own palettes (docs/design-system.md §5); globals.css only maps tokens.
const allowed = new Set(["cover-design.ts", "globals.css"]);
const rawColor = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;

function files(dir: string): string[] {
  try {
    return readdirSync(dir).flatMap((name) => {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) return files(p);
      return /\.(tsx?|css)$/.test(name) && !name.includes(".test.") && !allowed.has(name) ? [p] : [];
    });
  } catch {
    return [];
  }
}

describe("no raw colors outside tokens", () => {
  it("components and app use tokens only", () => {
    const offenders = roots.flatMap(files).filter((f) => rawColor.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
