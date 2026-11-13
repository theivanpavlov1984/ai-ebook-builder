import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { titleFontSize, type ArtDirection, type CoverDesign } from "./cover-design";

// Cover coordinate system: 200 × 280 (5:7), safe area 16 px from each edge.
const W = 200;
const H = 280;
const PAD = 16;
const SAFE_W = W - PAD * 2;
const MAX_LINES = 5;

type TitleStyle = { font: string; base: number; min: number; weight: number; charWidth: number; lineHeight: number };

const titleStyles: Record<ArtDirection, TitleStyle> = {
  editorial: { font: "var(--font-newsreader), Georgia, serif", base: 26, min: 12, weight: 500, charWidth: 0.5, lineHeight: 1.08 },
  geometric: { font: "var(--font-geist), system-ui, sans-serif", base: 22, min: 11, weight: 600, charWidth: 0.56, lineHeight: 1.1 },
  organic: { font: "var(--font-newsreader), Georgia, serif", base: 26, min: 12, weight: 500, charWidth: 0.5, lineHeight: 1.08 },
  typographic: { font: "var(--font-bricolage), system-ui, sans-serif", base: 32, min: 12, weight: 800, charWidth: 0.6, lineHeight: 0.95 },
};

/** Greedy word wrap by an estimated character width. Never breaks or drops words. */
function wrap(title: string, maxChars: number): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
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

/** Starts from the length-based size and shrinks further until the title fits in MAX_LINES. */
function fitTitle(title: string, style: TitleStyle) {
  let size = titleFontSize(title, style.base, style.min);
  for (;;) {
    const lines = wrap(title, Math.max(4, Math.floor(SAFE_W / (size * style.charWidth))));
    if (lines.length <= MAX_LINES || size <= 8) return { size, lines };
    size -= 1;
  }
}

/** Small deterministic PRNG (mulberry32) so compositions vary by seed but never between renders. */
function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Art({ design }: { design: CoverDesign }) {
  const { palette: p, direction, seed } = design;
  const r = rng(seed);
  switch (direction) {
    case "editorial": {
      const big = 70 + r() * 30;
      return (
        <>
          <line x1={PAD} x2={W - PAD} y1={34} y2={34} stroke={p.ink} strokeOpacity={0.35} />
          <circle cx={W - 40 - r() * 30} cy={95 + r() * 20} r={big} fill={p.accent} />
          <circle cx={40 + r() * 40} cy={130 + r() * 20} r={28 + r() * 14} fill={p.accent2} fillOpacity={0.85} />
        </>
      );
    }
    case "geometric": {
      const cells: ReactNode[] = [];
      const size = 30;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          const v = r();
          const x = PAD + col * (size + 4);
          const y = 44 + row * (size + 4);
          cells.push(
            <rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width={size}
              height={size}
              rx={v > 0.85 ? size / 2 : 0}
              fill={v > 0.62 ? p.accent : v > 0.4 ? p.accent2 : "none"}
              stroke={p.ink}
              strokeOpacity={0.3}
            />,
          );
        }
      }
      return <>{cells}</>;
    }
    case "organic": {
      return (
        <>
          <ellipse cx={70 + r() * 30} cy={90 + r() * 20} rx={70} ry={52} fill={p.accent2} transform={`rotate(${r() * 40 - 20} 100 100)`} />
          <ellipse cx={120 + r() * 30} cy={110 + r() * 20} rx={50} ry={40} fill={p.accent} fillOpacity={0.75} transform={`rotate(${r() * 60 - 30} 130 120)`} />
          <circle cx={50 + r() * 100} cy={50 + r() * 20} r={10} fill={p.ink} fillOpacity={0.15} />
        </>
      );
    }
    case "typographic":
      return (
        <>
          <rect x={0} y={H - 64} width={W} height={64} fill={p.accent} />
          <rect x={PAD} y={H - 40} width={44 + r() * 30} height={8} fill={p.accent2} />
        </>
      );
  }
}

const sizes = { sm: "w-24", md: "w-40", lg: "w-56" } as const;

export function Cover({
  design,
  title,
  subtitle,
  author,
  size = "md",
  className,
}: {
  design: CoverDesign;
  title: string;
  subtitle?: string;
  author?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const style = titleStyles[design.direction];
  const { size: fontSize, lines } = fitTitle(title, style);
  const lineGap = fontSize * style.lineHeight;
  const typographic = design.direction === "typographic";
  // Typographic covers put the title at the top; the rest anchor it above the bottom margin.
  const subtitleSpace = subtitle ? 26 : 0;
  const firstBaseline = typographic
    ? PAD + 30 + fontSize
    : H - PAD - subtitleSpace - (lines.length - 1) * lineGap;
  const label = author ? `${title} by ${author}` : title;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      data-direction={design.direction}
      className={cn("block h-auto rounded-r-sm rounded-l-[3px] shadow-book", sizes[size], className)}
    >
      <rect width={W} height={H} fill={design.palette.bg} />
      <Art design={design} />
      {author && (
        <text
          x={PAD}
          y={PAD + 8}
          fill={design.palette.ink}
          fontSize={7}
          letterSpacing={1.2}
          style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", textTransform: "uppercase" }}
        >
          {author}
        </text>
      )}
      <text
        data-role="title"
        x={PAD}
        y={firstBaseline}
        fill={design.palette.ink}
        fontSize={fontSize}
        fontWeight={style.weight}
        style={{ fontFamily: style.font, letterSpacing: typographic ? "-0.02em" : undefined }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={PAD} dy={i === 0 ? 0 : lineGap}>
            {line}
          </tspan>
        ))}
      </text>
      {subtitle && (
        <text
          x={PAD}
          y={H - PAD}
          fill={design.palette.ink}
          fillOpacity={0.8}
          fontSize={8}
          style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }}
        >
          {subtitle.length > 60 ? `${subtitle.slice(0, 57)}…` : subtitle}
        </text>
      )}
    </svg>
  );
}
