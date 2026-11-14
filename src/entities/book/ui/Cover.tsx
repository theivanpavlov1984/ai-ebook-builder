import { createElement } from "react";
import { cn } from "@/shared/lib";
import type { CoverDesign } from "../model/cover-design";
import { coverScene, type FontRole, type Scrim } from "../model/cover-scene";

const fontFamily: Record<FontRole, string> = {
  display: "var(--font-newsreader), Georgia, serif",
  ui: "var(--font-geist), system-ui, sans-serif",
  brand: "var(--font-bricolage), system-ui, sans-serif",
};

/** Same scrim, same gradient – so an id built from its values can be shared safely by covers on one page. */
export const scrimId = (s: Scrim) => `scrim-${s.from}-${s.to}`;

/** `none` leaves the width to `className` (no conflicting width utilities). */
const sizes = { sm: "w-24", md: "w-40", lg: "w-56", none: "" } as const;

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
  size?: keyof typeof sizes;
  className?: string;
}) {
  const scene = coverScene(design, title, { author, subtitle });
  const label = author ? `${title} by ${author}` : title;
  const t = scene.title;

  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      role="img"
      aria-label={label}
      data-direction={design.direction}
      data-artwork={scene.photo ? "photo" : "shapes"}
      className={cn("block h-auto rounded-l-[3px] rounded-r-sm shadow-book", sizes[size], className)}
    >
      <rect width={scene.width} height={scene.height} fill={scene.bg} />
      {scene.photo && (
        <>
          <defs>
            {scene.scrims.map((s) => (
              <linearGradient key={scrimId(s)} id={scrimId(s)} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity={s.from} />
                <stop offset="1" stopColor={s.color} stopOpacity={s.to} />
              </linearGradient>
            ))}
          </defs>
          <image
            href={scene.photo.src}
            x={scene.photo.x}
            y={scene.photo.y}
            width={scene.photo.width}
            height={scene.photo.height}
            preserveAspectRatio="xMidYMid slice"
          />
          {scene.scrims.map((s) => (
            <rect key={scrimId(s)} x={s.x} y={s.y} width={s.width} height={s.height} fill={`url(#${scrimId(s)})`} />
          ))}
        </>
      )}
      {scene.shapes.map((s, i) => createElement(s.kind, { key: i, ...s.attrs }))}
      {scene.author && (
        <text
          x={scene.author.x}
          y={scene.author.y}
          fill={scene.author.color}
          fontSize={scene.author.size}
          letterSpacing={1.2}
          style={{ fontFamily: fontFamily.ui, textTransform: "uppercase" }}
        >
          {scene.author.text}
        </text>
      )}
      <text
        data-role="title"
        x={t.x}
        y={t.y}
        fill={t.color}
        fontSize={t.size}
        fontWeight={t.weight}
        style={{ fontFamily: fontFamily[t.font], letterSpacing: t.tight ? "-0.02em" : undefined }}
      >
        {t.lines.map((line, i) => (
          <tspan key={i} x={t.x} dy={i === 0 ? 0 : t.lineGap}>
            {line}
          </tspan>
        ))}
      </text>
      {scene.subtitle && (
        <text
          x={scene.subtitle.x}
          y={scene.subtitle.y}
          fill={scene.subtitle.color}
          fillOpacity={scene.subtitle.opacity}
          fontSize={scene.subtitle.size}
          style={{ fontFamily: fontFamily.ui }}
        >
          {scene.subtitle.lines.map((line, i) => (
            <tspan key={i} x={scene.subtitle!.x} dy={i === 0 ? 0 : scene.subtitle!.lineGap}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </svg>
  );
}
