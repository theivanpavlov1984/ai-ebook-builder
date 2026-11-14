import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/shared/styles/tokens.css"), "utf8");

// Semantic roles from docs/design-system.md §4.2. CSS variables use the --primer- prefix
// so they never collide with Tailwind's --color-* theme namespace.
const semantic = [
  "bg-canvas",
  "bg-surface",
  "bg-subtle",
  "bg-inverse",
  "text-primary",
  "text-secondary",
  "text-inverse",
  "text-accent",
  "border-default",
  "border-strong",
  "accent",
  "accent-subtle",
  "focus-ring",
  "danger",
  "danger-subtle",
  "success",
  "success-subtle",
  "warning",
  "warning-subtle",
];

describe("tokens.css", () => {
  it("defines every semantic color token", () => {
    for (const t of semantic) expect(css).toMatch(new RegExp(`--primer-${t}:`));
  });

  it("semantic tokens reference primitives, not raw values", () => {
    for (const t of semantic) {
      expect(css).toMatch(new RegExp(`--primer-${t}:\\s*(var\\(|color-mix\\()`));
    }
  });

  it("defines primitives with the spec values", () => {
    expect(css).toMatch(/--paper-50:\s*#FBF8F3/i);
    expect(css).toMatch(/--ink-900:\s*#1F1B16/i);
    expect(css).toMatch(/--terracotta-500:\s*#C2512C/i);
    expect(css).toMatch(/--red-600:\s*#C0262D/i);
  });

  it("maps the primary button to the inverse tokens, not the accent", () => {
    expect(css).toMatch(/--primer-button-primary-bg:\s*var\(--primer-bg-inverse\)/);
  });

  it("has a reduced-motion rule", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});
