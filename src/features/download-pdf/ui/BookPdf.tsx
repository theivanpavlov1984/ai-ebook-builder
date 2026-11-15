import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { bookDesign, chapterBlocks, coverScene, ctaText, type Book } from "@/entities/book";
import { family, type PdfFonts } from "../lib/fonts";
import { PdfCover } from "./PdfCover";

// Page = the cover's 5:7 proportion, roughly A5.
const PAGE: [number, number] = [420, 588];
// Print colors mirror the app's ink / secondary / accent primitives.
const INK = "#1F1B16";
const MUTED = "#6B6257";
const ACCENT = "#9A3B1C";
const RULE = "#E7DFD3";
const ACCENT_SUBTLE = "#F4DED3";

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
    footer: {
      position: "absolute",
      bottom: 30,
      left: 52,
      right: 52,
      flexDirection: "row",
      justifyContent: "space-between",
      fontFamily: ui,
      fontSize: 8,
      color: MUTED,
    },
    // "Try this today": the same box readers see on screen.
    action: {
      marginTop: 4,
      marginBottom: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: ACCENT_SUBTLE,
      borderRadius: 6,
    },
    actionLabel: {
      fontFamily: ui,
      fontSize: 7.5,
      letterSpacing: 1.2,
      color: ACCENT,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    actionRow: { flexDirection: "row", marginTop: 3 },
    actionNum: { width: 14, fontFamily: ui, fontSize: 9, color: ACCENT, paddingTop: 1.5 },
    actionText: { flex: 1, fontSize: 10.5, lineHeight: 1.45 },
    ctaBox: { marginTop: 8, padding: 20, borderLeftWidth: 2, borderLeftColor: ACCENT },
    ctaLink: { fontFamily: ui, fontSize: 11, color: ACCENT, textDecoration: "underline", marginBottom: 12 },
    made: { position: "absolute", bottom: 40, left: 52, fontFamily: ui, fontSize: 8, color: MUTED },
  });
}

/** `origin` turns the site-relative path of a library photo into a URL react-pdf can fetch. */
export function BookPdf({ book, fonts, origin = "" }: { book: Book; fonts: PdfFonts; origin?: string }) {
  const s = makeStyles(fonts);
  const title = book.title || book.topic;
  const scene = coverScene(bookDesign(book), title, { author: book.author, subtitle: book.subtitle });
  if (scene.photo?.src.startsWith("/")) scene.photo = { ...scene.photo, src: origin + scene.photo.src };
  const cta = ctaText(book);

  const footer = (
    <View style={s.footer} fixed>
      <Text>{title}</Text>
      <Text render={({ pageNumber }) => (pageNumber > 2 ? String(pageNumber) : "")} />
    </View>
  );

  return (
    <Document title={title} author={book.author.trim() || undefined} creator="Primer" producer="Primer">
      <Page size={PAGE} style={{ padding: 0 }}>
        <PdfCover scene={scene} width={PAGE[0]} height={PAGE[1]} fonts={fonts} />
      </Page>

      <Page size={PAGE} style={s.page}>
        <Text style={s.label}>Contents</Text>
        <Text style={s.h1}>{title}</Text>
        {/* Each row links to its chapter, so the contents work like a menu in any PDF reader. */}
        {book.chapters.map((c, i) => (
          <Link key={c.id} src={`#chapter-${i + 1}`} style={{ color: INK, textDecoration: "none" }}>
            <View style={s.tocRow} wrap={false}>
              <Text style={s.tocNum}>{String(i + 1).padStart(2, "0")}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.tocTitle}>{c.title}</Text>
                <Text style={s.tocSummary}>{c.summary}</Text>
              </View>
            </View>
          </Link>
        ))}
        {footer}
      </Page>

      {book.chapters.map((c, i) => (
        <Page key={c.id} size={PAGE} style={s.page} bookmark={c.title}>
          {/* The contents link here; the page's bookmark lists the chapter in the PDF reader's sidebar. */}
          <Text id={`chapter-${i + 1}`} style={s.label}>
            Chapter {i + 1}
          </Text>
          <Text style={s.h1}>{c.title}</Text>
          {chapterBlocks(c.body).map((b) =>
            b.kind === "action" ? (
              <View key={b.from} style={s.action} wrap={false}>
                <Text style={s.actionLabel}>{b.heading}</Text>
                {b.steps.map((step, n) => (
                  <View key={n} style={s.actionRow}>
                    <Text style={s.actionNum}>{n + 1}</Text>
                    <Text style={s.actionText}>{step}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text key={b.from} style={s.para}>
                {b.text}
              </Text>
            ),
          )}
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
          {cta.link && (
            <Link src={cta.link.href} style={s.ctaLink}>
              {cta.link.label}
            </Link>
          )}
          {cta.signature && <Text style={{ ...s.para, fontSize: 13 }}>{cta.signature}</Text>}
        </View>
        <Text style={s.made}>Made with Primer</Text>
      </Page>
    </Document>
  );
}
