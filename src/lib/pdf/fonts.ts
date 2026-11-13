import { Font } from "@react-pdf/renderer";
import type { FontRole } from "@/components/book/cover-scene";

export type PdfFonts = "embedded" | "standard";

/** Font family per role. "standard" uses built-in PDF fonts (no network) – used in tests. */
export function family(role: FontRole, fonts: PdfFonts): string {
  if (fonts === "standard") return role === "display" ? "Times-Roman" : role === "brand" ? "Helvetica-Bold" : "Helvetica";
  return role === "display" ? "Newsreader" : role === "brand" ? "Bricolage" : "Geist";
}

let registered = false;

/** Registers the embedded fonts once; `baseUrl` is the site origin serving /fonts. */
export function registerPdfFonts(baseUrl: string): void {
  if (registered) return;
  const f = (file: string) => `${baseUrl}/fonts/${file}`;
  Font.register({
    family: "Newsreader",
    fonts: [
      { src: f("newsreader-latin-400-normal.woff"), fontWeight: 400 },
      { src: f("newsreader-latin-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
      { src: f("newsreader-latin-500-normal.woff"), fontWeight: 500 },
    ],
  });
  Font.register({
    family: "Geist",
    fonts: [
      { src: f("geist-latin-400-normal.woff"), fontWeight: 400 },
      { src: f("geist-latin-600-normal.woff"), fontWeight: 600 },
    ],
  });
  Font.register({ family: "Bricolage", fonts: [{ src: f("bricolage-grotesque-latin-800-normal.woff"), fontWeight: 800 }] });
  // Keep words whole – no automatic hyphenation in a lead magnet.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
