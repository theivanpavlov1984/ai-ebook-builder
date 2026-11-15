// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * WCAG contrast of the token pairs the interface actually uses, read from tokens.css itself –
 * so a new shade that breaks readability fails here instead of in an audit.
 */
const css = readFileSync(join(__dirname, "tokens.css"), "utf8");
const vars = new Map([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

function resolve(name: string): string {
  let value = vars.get(name);
  for (let i = 0; value?.startsWith("var("); i++) value = vars.get(value.slice(6, -1));
  if (!value?.startsWith("#")) throw new Error(`--${name} is not a plain colour`);
  return value;
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(resolve(a)), luminance(resolve(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const light = ["primer-bg-canvas", "primer-bg-surface", "primer-bg-subtle", "primer-accent-subtle"];

describe("token contrast", () => {
  it.each(["primer-text-primary", "primer-text-secondary", "primer-text-accent"])(
    "%s reads at 4.5:1 or more on every light background",
    (text) => {
      for (const bg of light) expect(contrast(text, bg), `${text} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("errors and success messages read at 4.5:1 on cards and the page", () => {
    for (const fg of ["primer-danger", "primer-success"])
      for (const bg of ["primer-bg-surface", "primer-bg-canvas"]) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("field borders and the focus outline stand out at 3:1 or more", () => {
    for (const fg of ["primer-input-border", "primer-accent"])
      for (const bg of ["primer-bg-surface", "primer-bg-canvas"]) expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
  });

  it("text on the dark primary button reads easily", () => {
    expect(contrast("primer-button-primary-text", "primer-button-primary-bg")).toBeGreaterThanOrEqual(7);
  });
});
