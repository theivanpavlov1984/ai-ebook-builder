/**
 * Cover design logic (docs/design-system.md §5, FLOW.md §5).
 * Covers are content, not UI: they have their own palettes — the only place raw colors are allowed.
 */

export type Mood = "practical" | "inspiring" | "calm" | "bold" | "playful";
export type ArtDirection = "editorial" | "geometric" | "organic" | "typographic";
export type CoverPalette = { bg: string; ink: string; accent: string; accent2: string };
export type CoverDesign = { direction: ArtDirection; palette: CoverPalette; seed: number };

const moodDirections: Record<Mood, [ArtDirection, ArtDirection, ArtDirection]> = {
  practical: ["editorial", "geometric", "typographic"],
  inspiring: ["organic", "editorial", "typographic"],
  calm: ["organic", "editorial", "geometric"],
  bold: ["typographic", "geometric", "editorial"],
  playful: ["geometric", "organic", "typographic"],
};

export function directionsForMood(mood: Mood): [ArtDirection, ArtDirection, ArtDirection] {
  return moodDirections[mood];
}

/** Paper / ink / terracotta family, plus greens, ochre and a deep blue — harmonious with the app. */
export const palettes: Record<ArtDirection, CoverPalette[]> = {
  editorial: [
    { bg: "#F3E7D8", ink: "#1F1B16", accent: "#C2512C", accent2: "#E9B48F" },
    { bg: "#E8EEE6", ink: "#1C2A22", accent: "#2F5D50", accent2: "#B7CDB0" },
    { bg: "#F1ECE2", ink: "#23201B", accent: "#1F3A5F", accent2: "#C9A227" },
  ],
  geometric: [
    { bg: "#1F3A5F", ink: "#F5F0E8", accent: "#E2A07F", accent2: "#C9D9B6" },
    { bg: "#F5F0E8", ink: "#1F1B16", accent: "#C2512C", accent2: "#2F5D50" },
    { bg: "#24453C", ink: "#EDEBE3", accent: "#C9D9B6", accent2: "#E9B48F" },
  ],
  organic: [
    { bg: "#F4DED3", ink: "#3A2418", accent: "#C2512C", accent2: "#E9B48F" },
    { bg: "#E6EDE4", ink: "#1E3328", accent: "#6E9A7F", accent2: "#C9D9B6" },
    { bg: "#F2E6D9", ink: "#2E2A24", accent: "#B5835A", accent2: "#D9B99B" },
  ],
  typographic: [
    { bg: "#A8431F", ink: "#FFF8EC", accent: "#1F1B16", accent2: "#F4DED3" },
    { bg: "#1F1B16", ink: "#FBF8F3", accent: "#C2512C", accent2: "#E2A07F" },
    { bg: "#F2C14E", ink: "#1F1B16", accent: "#C2512C", accent2: "#FFF8EC" },
  ],
};

/** FNV-1a 32-bit — deterministic, non-negative. */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Full size up to ~20 characters, then shrinks with √(20/length); never below `min`. */
export function titleFontSize(title: string, base: number, min: number): number {
  const len = title.trim().length;
  if (len <= 20) return base;
  return Math.max(min, Math.round(base * Math.sqrt(20 / len) * 10) / 10);
}

export function getCoverDesign(input: {
  title: string;
  mood: Mood;
  direction?: ArtDirection;
  variant?: number;
}): CoverDesign {
  const variant = input.variant ?? 0;
  const direction = input.direction ?? directionsForMood(input.mood)[0];
  const set = palettes[direction];
  const palette = set[(hashSeed(input.title) + variant) % set.length];
  return { direction, palette, seed: hashSeed(`${input.title}:${variant}`) };
}

function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
