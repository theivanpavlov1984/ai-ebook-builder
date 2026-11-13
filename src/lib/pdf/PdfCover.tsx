import { Circle, Ellipse, Line, Rect, Svg, Text, Tspan } from "@react-pdf/renderer";
import type { ComponentProps } from "react";
import type { CoverScene, Shape } from "@/components/book/cover-scene";
import { family, type PdfFonts } from "./fonts";

/** Title lines with absolute positions (react-pdf has no reliable dy on tspans). */
export function titleTspans(scene: CoverScene): { text: string; x: number; y: number }[] {
  return scene.title.lines.map((text, i) => ({ text, x: scene.title.x, y: scene.title.y + i * scene.title.lineGap }));
}

function ShapeEl({ shape }: { shape: Shape }) {
  // Scene attrs are built per kind in cover-scene.ts, so each cast matches its element.
  switch (shape.kind) {
    case "rect":
      return <Rect {...(shape.attrs as unknown as ComponentProps<typeof Rect>)} />;
    case "circle":
      return <Circle {...(shape.attrs as unknown as ComponentProps<typeof Circle>)} />;
    case "ellipse":
      return <Ellipse {...(shape.attrs as unknown as ComponentProps<typeof Ellipse>)} />;
    case "line":
      return <Line {...(shape.attrs as unknown as ComponentProps<typeof Line>)} />;
  }
}

export function PdfCover({ scene, width, height, fonts }: { scene: CoverScene; width: number; height: number; fonts: PdfFonts }) {
  const t = scene.title;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${scene.width} ${scene.height}`}>
      <Rect x={0} y={0} width={scene.width} height={scene.height} fill={scene.bg} />
      {scene.shapes.map((s, i) => (
        <ShapeEl key={i} shape={s} />
      ))}
      {scene.author && (
        <Text x={scene.author.x} y={scene.author.y} fill={scene.author.color} style={{ fontFamily: family("ui", fonts), fontSize: scene.author.size, letterSpacing: 1.2 }}>
          {scene.author.text.toUpperCase()}
        </Text>
      )}
      <Text x={t.x} y={t.y} fill={t.color} style={{ fontFamily: family(t.font, fonts), fontSize: t.size, fontWeight: t.weight }}>
        {titleTspans(scene).map((s, i) => (
          <Tspan key={i} x={s.x} y={s.y}>
            {s.text}
          </Tspan>
        ))}
      </Text>
      {scene.subtitle && (
        <Text
          x={scene.subtitle.x}
          y={scene.subtitle.y}
          fill={scene.subtitle.color}
          fillOpacity={scene.subtitle.opacity}
          style={{ fontFamily: family("ui", fonts), fontSize: scene.subtitle.size }}
        >
          {scene.subtitle.text}
        </Text>
      )}
    </Svg>
  );
}
