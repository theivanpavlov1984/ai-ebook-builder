/**
 * Cover geometry computed once and rendered twice: as SVG on screen (Cover.tsx) and in the PDF (PdfCover.tsx).
 * Coordinate system 200 × 280 (5:7), safe area 16 px from each edge.
 */
import { photoColors, titleFontSize, type ArtDirection, type CoverDesign } from "./cover-design";
import type { PhotoLayout } from "./cover-photos";

export const W = 200;
export const H = 280;
const PAD = 16;
const SAFE_W = W - PAD * 2;
const MAX_LINES = 5;

export type FontRole = "display" | "ui" | "brand";
export type Shape = { kind: "rect" | "circle" | "ellipse" | "line"; attrs: Record<string, number | string> };
export type TextBlock = { text: string; x: number; y: number; size: number; color: string; opacity?: number };
export type Box = { x: number; y: number; width: number; height: number };
/** A vertical ink gradient over the photo that keeps text readable: opacity `from` at the top, `to` at the bottom. */
export type Scrim = Box & { color: string; from: number; to: number };
export type CoverScene = {
  width: typeof W;
  height: typeof H;
  bg: string;
  shapes: Shape[];
  title: {
    lines: string[];
    x: number;
    y: number;
    size: number;
    lineGap: number;
    font: FontRole;
    weight: number;
    color: string;
    tight: boolean;
  };
  author?: TextBlock;
  subtitle?: { lines: string[]; x: number; y: number; lineGap: number; size: number; color: string; opacity: number };
  /** Photo covers only: where the photo goes (cropped to fill the box) and the scrims drawn over it. */
  photo?: Box & { src: string };
  scrims: Scrim[];
};

const SUBTITLE_SIZE = 8;
const SUBTITLE_GAP = 10;
/** ~0.5 em average glyph width at 8 px inside the 168 px safe area. */
const SUBTITLE_CHARS = 42;

/** Up to two lines; a longer subtitle ends with an ellipsis on the second line. */
function wrapSubtitle(subtitle: string): string[] {
  const lines = wrap(subtitle, SUBTITLE_CHARS);
  if (lines.length <= 2) return lines;
  let second = "";
  for (const word of lines.slice(1).join(" ").split(" ")) {
    const next = second ? `${second} ${word}` : word;
    if (next.length > SUBTITLE_CHARS - 1) break;
    second = next;
  }
  return [lines[0], `${second}…`];
}

type TitleStyle = { font: FontRole; base: number; min: number; weight: number; charWidth: number; lineHeight: number };

const titleStyles: Record<ArtDirection, TitleStyle> = {
  editorial: { font: "display", base: 26, min: 12, weight: 500, charWidth: 0.5, lineHeight: 1.08 },
  geometric: { font: "ui", base: 22, min: 11, weight: 600, charWidth: 0.56, lineHeight: 1.1 },
  organic: { font: "display", base: 26, min: 12, weight: 500, charWidth: 0.5, lineHeight: 1.08 },
  typographic: { font: "brand", base: 32, min: 12, weight: 800, charWidth: 0.6, lineHeight: 0.95 },
};

/** Greedy word wrap by an estimated character width. Never breaks or drops words. */
function wrap(title: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of title.trim().split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Starts from the length-based size and shrinks further until the title fits in `maxLines`. */
function fitTitle(title: string, style: TitleStyle, maxLines = MAX_LINES) {
  let size = titleFontSize(title, style.base, style.min);
  for (;;) {
    const lines = wrap(title, Math.max(4, Math.floor(SAFE_W / (size * style.charWidth))));
    if (lines.length <= maxLines || size <= 8) return { size, lines };
    size -= 1;
  }
}

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function art(design: CoverDesign): Shape[] {
  const { palette: p, direction, seed } = design;
  const r = rng(seed);
  switch (direction) {
    case "editorial":
      return [
        { kind: "line", attrs: { x1: PAD, x2: W - PAD, y1: 34, y2: 34, stroke: p.ink, strokeOpacity: 0.35 } },
        { kind: "circle", attrs: { cx: W - 40 - r() * 30, cy: 95 + r() * 20, r: 70 + r() * 30, fill: p.accent } },
        {
          kind: "circle",
          attrs: { cx: 40 + r() * 40, cy: 130 + r() * 20, r: 28 + r() * 14, fill: p.accent2, fillOpacity: 0.85 },
        },
      ];
    case "geometric": {
      const shapes: Shape[] = [];
      const size = 30;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          const v = r();
          shapes.push({
            kind: "rect",
            attrs: {
              x: PAD + col * (size + 4),
              y: 44 + row * (size + 4),
              width: size,
              height: size,
              rx: v > 0.85 ? size / 2 : 0,
              fill: v > 0.62 ? p.accent : v > 0.4 ? p.accent2 : "none",
              stroke: p.ink,
              strokeOpacity: 0.3,
            },
          });
        }
      }
      return shapes;
    }
    case "organic":
      return [
        {
          kind: "ellipse",
          attrs: {
            cx: 70 + r() * 30,
            cy: 90 + r() * 20,
            rx: 70,
            ry: 52,
            fill: p.accent2,
            transform: `rotate(${(r() * 40 - 20).toFixed(2)} 100 100)`,
          },
        },
        {
          kind: "ellipse",
          attrs: {
            cx: 120 + r() * 30,
            cy: 110 + r() * 20,
            rx: 50,
            ry: 40,
            fill: p.accent,
            fillOpacity: 0.75,
            transform: `rotate(${(r() * 60 - 30).toFixed(2)} 130 120)`,
          },
        },
        { kind: "circle", attrs: { cx: 50 + r() * 100, cy: 50 + r() * 20, r: 10, fill: p.ink, fillOpacity: 0.15 } },
      ];
    case "typographic":
      return [
        { kind: "rect", attrs: { x: 0, y: H - 64, width: W, height: 64, fill: p.accent } },
        { kind: "rect", attrs: { x: PAD, y: H - 40, width: 44 + r() * 30, height: 8, fill: p.accent2 } },
      ];
  }
}

/* Photo covers: one serif title style and fixed paper / ink colors, whatever the photo. */
const PHOTO_TITLE: TitleStyle = { font: "display", base: 24, min: 10, weight: 500, charWidth: 0.5, lineHeight: 1.08 };
const { paper: PAPER, ink: INK, light: LIGHT } = photoColors;

type PhotoFrame = {
  bg: string;
  photo: Box;
  scrims: Omit<Scrim, "color">[];
  author: string;
  text: string;
  maxLines: number;
};

/**
 * Full bleed: the photo fills the cover, darkened at the top and bottom so light text always reads.
 * Band: the photo fills the top, the title sits on paper below. Framed: a photo inset on paper.
 * Band and framed titles get at most three lines, so they never run into the photo.
 */
const photoFrames: Record<PhotoLayout, PhotoFrame> = {
  full: {
    bg: INK,
    photo: { x: 0, y: 0, width: W, height: H },
    scrims: [
      { x: 0, y: 0, width: W, height: 70, from: 0.45, to: 0 },
      { x: 0, y: H * 0.4, width: W, height: H * 0.6, from: 0, to: 0.88 },
    ],
    author: LIGHT,
    text: LIGHT,
    maxLines: MAX_LINES,
  },
  band: {
    bg: PAPER,
    photo: { x: 0, y: 0, width: W, height: 150 },
    scrims: [{ x: 0, y: 0, width: W, height: 50, from: 0.4, to: 0 }],
    author: LIGHT,
    text: INK,
    maxLines: 3,
  },
  framed: {
    bg: PAPER,
    photo: { x: PAD, y: 32, width: SAFE_W, height: 118 },
    scrims: [],
    author: INK,
    text: INK,
    maxLines: 3,
  },
};

export function coverScene(
  design: CoverDesign,
  title: string,
  opts?: { author?: string; subtitle?: string },
): CoverScene {
  const frame = design.photo ? photoFrames[design.photo.layout] : undefined;
  const style = frame ? PHOTO_TITLE : titleStyles[design.direction];
  const { size, lines } = fitTitle(title || "Untitled book", style, frame?.maxLines);
  const lineGap = size * style.lineHeight;
  const typographic = !frame && design.direction === "typographic";
  const subtitle = opts?.subtitle?.trim();
  const subLines = subtitle ? wrapSubtitle(subtitle) : [];
  const subtitleSpace = subLines.length ? 16 + subLines.length * SUBTITLE_GAP : 0;
  const y = typographic ? PAD + 30 + size : H - PAD - subtitleSpace - (lines.length - 1) * lineGap;
  const ink = frame ? frame.text : design.palette.ink;
  const authorInk = frame ? frame.author : ink;

  return {
    width: W,
    height: H,
    bg: frame ? frame.bg : design.palette.bg,
    shapes: frame ? [] : art(design),
    photo: frame && design.photo ? { ...frame.photo, src: design.photo.src } : undefined,
    scrims: frame ? frame.scrims.map((s) => ({ ...s, color: INK })) : [],
    title: { lines, x: PAD, y, size, lineGap, font: style.font, weight: style.weight, color: ink, tight: typographic },
    author: opts?.author?.trim()
      ? { text: opts.author.trim(), x: PAD, y: PAD + 8, size: 7, color: authorInk }
      : undefined,
    subtitle: subLines.length
      ? {
          lines: subLines,
          x: PAD,
          y: H - PAD - (subLines.length - 1) * SUBTITLE_GAP,
          lineGap: SUBTITLE_GAP,
          size: SUBTITLE_SIZE,
          color: ink,
          opacity: 0.8,
        }
      : undefined,
  };
}
