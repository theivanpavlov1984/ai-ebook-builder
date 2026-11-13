import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { getCoverDesign } from "@/components/book/cover-design";
import { coverScene } from "@/components/book/cover-scene";
import { ctaText } from "@/lib/ai/generate";
import type { Book } from "@/lib/book/types";
import { family, type PdfFonts } from "./fonts";
import { PdfCover } from "./PdfCover";

// Page = the cover's 5:7 proportion, roughly A5.
const PAGE: [number, number] = [420, 588];
// Print colors mirror the app's ink / secondary / accent primitives.
const INK = "#1F1B16";
const MUTED = "#7A7166";
const ACCENT = "#9A3B1C";
const RULE = "#E7DFD3";

function makeStyles(fonts: PdfFonts) {
  const display = family("display", fonts);
  const ui = family("ui", fonts);
  return StyleSheet.create({
    page: { paddingTop: 56, paddingBottom: 64, paddingHorizontal: 52, color: INK, fontFamily: display, fontSize: 11 },
    label: { fontFamily: ui, fontSize: 8, letterSpacing: 1.4, color: MUTED, textTransform: "uppercase" },
    h1: { fontFamily: display, fontSize: 24, fontWeight: 500, marginTop: 6, marginBottom: 22, lineHeight: 1.15 },
    para: { fontSize: 11, lineHeight: 1.55, marginBottom: 9 },
    tocRow: { flexDirection: "row", paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: RULE },
    tocNum: { width: 24, fontFamily: ui, fontSize: 9, color: ACCENT, paddingTop: 2 },
    tocTitle: { fontSize: 12.5, lineHeight: 1.3 },
    tocSummary: { fontFamily: ui, fontSize: 8.5, color: MUTED, marginTop: 3, lineHeight: 1.4 },
    footer: { position: "absolute", bottom: 30, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", fontFamily: ui, fontSize: 8, color: MUTED },
    ctaBox: { marginTop: 8, padding: 20, borderLeftWidth: 2, borderLeftColor: ACCENT },
    made: { position: "absolute", bottom: 40, left: 52, fontFamily: ui, fontSize: 8, color: MUTED },
  });
}

export function BookPdf({ book, fonts }: { book: Book; fonts: PdfFonts }) {
  const s = makeStyles(fonts);
  const title = book.title || book.topic;
  const scene = coverScene(
    getCoverDesign({ title, mood: book.mood, direction: book.cover.direction, variant: book.cover.variant }),
    title,
    { author: book.author, subtitle: book.subtitle },
  );
  const cta = ctaText(book);

  const footer = (
    <View style={s.footer} fixed>
      <Text>{title}</Text>
      <Text render={({ pageNumber }) => (pageNumber > 2 ? String(pageNumber) : "")} />
    </View>
  );

  return (
    <Document title={title} author={book.author} creator="Primer" producer="Primer">
      <Page size={PAGE} style={{ padding: 0 }}>
        <PdfCover scene={scene} width={PAGE[0]} height={PAGE[1]} fonts={fonts} />
      </Page>

      <Page size={PAGE} style={s.page}>
        <Text style={s.label}>Contents</Text>
        <Text style={s.h1}>{title}</Text>
        {book.chapters.map((c, i) => (
          <View key={c.id} style={s.tocRow} wrap={false}>
            <Text style={s.tocNum}>{String(i + 1).padStart(2, "0")}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.tocTitle}>{c.title}</Text>
              <Text style={s.tocSummary}>{c.summary}</Text>
            </View>
          </View>
        ))}
        {footer}
      </Page>

      {book.chapters.map((c, i) => (
        <Page key={c.id} size={PAGE} style={s.page}>
          <Text style={s.label}>Chapter {i + 1}</Text>
          <Text style={s.h1}>{c.title}</Text>
          {c.body.map((p, j) => (
            <Text key={j} style={s.para}>
              {p}
            </Text>
          ))}
          {footer}
        </Page>
      ))}

      <Page size={PAGE} style={s.page}>
        <Text style={s.label}>{cta.heading}</Text>
        <View style={s.ctaBox}>
          {cta.body.split("\n\n").map((p, j) => (
            <Text key={j} style={{ ...s.para, fontSize: 13 }}>
              {p}
            </Text>
          ))}
        </View>
        <Text style={s.made}>Made with Primer</Text>
      </Page>
    </Document>
  );
}
