// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { getCoverDesign, coverScene, sampleBooks } from "@/entities/book";
import { BookPdf } from "./BookPdf";
import { slugify } from "@/shared/lib";
import { titleTspans } from "./PdfCover";

// The demo book from the landing page: long chapters and real cover data.
const book = sampleBooks()[0];

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
