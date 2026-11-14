import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

/**
 * Feature-Sliced Design boundaries (see README → Architecture).
 * Layers, top to bottom: app → views → widgets → features → entities → shared.
 * 1. A layer imports only from layers below it.
 * 2. Slices on the same layer don't import each other.
 * 3. Other slices are imported through their public API (index.ts), never by deep path.
 *    Inside a slice, use relative imports.
 */
const layers = ["shared", "entities", "features", "widgets", "views", "app"];
const sliced = ["entities", "features", "widgets", "views"];

const deepImports = {
  group: [...sliced.map((l) => `@/${l}/*/*`), "@/shared/*/*"],
  message: "Import a slice through its public API (index.ts), not by a deep path.",
};

function boundaries(layer) {
  const above = layers.slice(layers.indexOf(layer) + 1);
  const patterns = [deepImports];
  if (above.length) {
    patterns.push({
      group: above.flatMap((l) => [`@/${l}`, `@/${l}/*`]),
      message: `"${layer}" can only import from layers below it (${layers.slice(0, layers.indexOf(layer)).join(", ") || "none"}).`,
    });
  }
  if (sliced.includes(layer)) {
    patterns.push({
      group: [`@/${layer}/*`],
      message: `Slices on the "${layer}" layer must not import each other. Inside a slice, use relative imports.`,
    });
  }
  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: { "no-restricted-imports": ["error", { patterns }] },
  };
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Formatting is Prettier's job – turn off stylistic ESLint rules that would conflict.
  eslintConfigPrettier,
  ...layers.map(boundaries),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
