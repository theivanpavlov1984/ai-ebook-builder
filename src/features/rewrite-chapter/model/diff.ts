const norm = (p: string) => p.replace(/\s+/g, " ").trim();

/** For each paragraph of the rewrite: true when it is not in the original word for word. */
export function changedParagraphs(original: string[], rewrite: string[]): boolean[] {
  const before = new Set(original.map(norm));
  return rewrite.map((p) => !before.has(norm(p)));
}
