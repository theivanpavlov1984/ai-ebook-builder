// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { getCoverDesign } from "@/components/book/cover-design";
import { coverScene } from "@/components/book/cover-scene";
import { demoChapter, demoOutline } from "@/lib/ai/content/demo";
import type { Book } from "@/lib/book/types";
import { BookPdf } from "./BookPdf";
import { slugify } from "./slugify";
import { titleTspans } from "./PdfCover";

const book: Book = {
  id: "1",
  createdAt: 0,
  updatedAt: 0,
  stage: "final",
  topic: "Design systems for small teams",
  audience: "Founders",
  mood: "practical",
  cta: "Book a free 20-minute call at example.com",
  title: "Design Systems for Small Teams",
  subtitle: "A practical guide",
  author: "Ivan Pavlov",
  chapters: demoOutline.map((c, i) => ({ id: `c${i}`, ...c, body: demoChapter(i), status: "done", versions: [] })),
  cover: { direction: "editorial", variant: 0, status: "done" },
};

describe("PDF export", () => {
  it("renders a real PDF document", async () => {
    const buf = await renderToBuffer(<BookPdf book={book} fonts="standard" />);
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");
    expect(buf.length).toBeGreaterThan(5000);
  });

  it("works for every cover style", async () => {
    for (const direction of ["editorial", "geometric", "organic", "typographic"] as const) {
      const buf = await renderToBuffer(
        <BookPdf book={{ ...book, cover: { ...book.cover, direction } }} fonts="standard" />,
      );
      expect(buf.subarray(0, 4).toString()).toBe("%PDF");
    }
  });

  it("puts the same title lines on the PDF cover as on screen", () => {
    const scene = coverScene(getCoverDesign({ title: book.title, mood: "practical" }), book.title);
    const spans = titleTspans(scene);
    expect(spans.map((s) => s.text)).toEqual(scene.title.lines);
    expect(spans[1].y - spans[0].y).toBeCloseTo(scene.title.lineGap);
  });

  it("makes a safe file name", () => {
    expect(slugify("Design Systems for Small Teams!")).toBe("design-systems-for-small-teams");
    expect(slugify("  Ünïcode & Co.  ")).toBe("unicode-co");
    expect(slugify("")).toBe("my-book");
  });
});
