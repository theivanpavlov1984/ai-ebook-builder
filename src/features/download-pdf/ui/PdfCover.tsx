import { Circle, Ellipse, Image, Line, Rect, Svg, Text, Tspan, View } from "@react-pdf/renderer";
import type { ComponentProps } from "react";
import type { CoverScene, Scrim, Shape } from "@/entities/book";
import { family, type PdfFonts } from "../lib/fonts";

/** Title lines with absolute positions (react-pdf has no reliable dy on tspans). */
export function titleTspans(scene: CoverScene): { text: string; x: number; y: number }[] {
  return scene.title.lines.map((text, i) => ({ text, x: scene.title.x, y: scene.title.y + i * scene.title.lineGap }));
}

const STRIPS = 48;

/**
 * react-pdf drops gradient stop opacity, so a scrim is drawn as nested strips instead. Each strip runs from
 * its band to the scrim's dark end, and its opacity is chosen so the layers over a band add up to the gradient
 * there – no gaps and no overlapping lines between bands.
 */
export function scrimStrips(s: Scrim) {
  const rising = s.to >= s.from;
  const h = s.height / STRIPS;
  const target = (i: number) => s.from + ((s.to - s.from) * (i + 0.5)) / STRIPS;
  const bands = Array.from({ length: STRIPS }, (_, i) => i);
  let covered = 0;
  return (rising ? bands : bands.reverse()).map((i) => {
    const t = target(i);
    const fillOpacity = Math.max(0, 1 - (1 - t) / (1 - covered));
    covered = t;
    return {
      x: s.x,
      y: rising ? s.y + i * h : s.y,
      width: s.width,
      height: rising ? s.height - i * h : (i + 1) * h,
      fill: s.color,
      fillOpacity,
    };
  });
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

export function PdfCover({
  scene,
  width,
  height,
  fonts,
}: {
  scene: CoverScene;
  width: number;
  height: number;
  fonts: PdfFonts;
}) {
  const t = scene.title;
  const k = width / scene.width;
  const photo = scene.photo;
  // The photo is a page-level Image under the SVG: react-pdf crops it with objectFit, which SVG images lack.
  return (
    <View style={{ width, height, backgroundColor: scene.bg }}>
      {photo && (
        // react-pdf's Image, not an HTML img: a PDF has no alt text, the cover title is real text above it.
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          src={photo.src}
          style={{
            position: "absolute",
            left: photo.x * k,
            top: photo.y * k,
            width: photo.width * k,
            height: photo.height * k,
            objectFit: "cover",
          }}
        />
      )}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {!photo && <Rect x={0} y={0} width={scene.width} height={scene.height} fill={scene.bg} />}
        {scene.scrims
          .flatMap((s) => scrimStrips(s))
          .map((r, i) => (
            <Rect key={`scrim${i}`} {...r} />
          ))}
        {scene.shapes.map((s, i) => (
          <ShapeEl key={i} shape={s} />
        ))}
        {scene.author && (
          <Text
            x={scene.author.x}
            y={scene.author.y}
            fill={scene.author.color}
            style={{ fontFamily: family("ui", fonts), fontSize: scene.author.size, letterSpacing: 1.2 }}
          >
            {scene.author.text.toUpperCase()}
          </Text>
        )}
        <Text
          x={t.x}
          y={t.y}
          fill={t.color}
          style={{ fontFamily: family(t.font, fonts), fontSize: t.size, fontWeight: t.weight }}
        >
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
            {scene.subtitle.lines.map((line, i) => (
              <Tspan key={i} x={scene.subtitle!.x} y={scene.subtitle!.y + i * scene.subtitle!.lineGap}>
                {line}
              </Tspan>
            ))}
          </Text>
        )}
      </Svg>
    </View>
  );
}
