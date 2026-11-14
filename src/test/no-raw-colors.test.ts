import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const src = join(process.cwd(), "src");
const roots = ["app", "views", "widgets", "features", "entities", "shared"].map((d) => join(src, d));
// tokens.css is where raw values live; globals.css only maps tokens. Covers are content with their own
// palettes (docs/design-system.md §5); BookPdf mirrors the primitives because PDF can't read CSS variables.
const allowed = new Set(["tokens.css", "globals.css", "cover-design.ts", "BookPdf.tsx"]);
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
  it("every layer uses tokens only", () => {
    const offenders = roots.flatMap(files).filter((f) => rawColor.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
