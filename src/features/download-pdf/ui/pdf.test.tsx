// @vitest-environment node
import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { getCoverDesign, coverScene, sampleBooks } from "@/entities/book";
import { BookPdf } from "./BookPdf";
import { slugify } from "@/shared/lib";
import { scrimStrips, titleTspans } from "./PdfCover";

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

  it("puts a photo on the cover in every layout", async () => {
    // A 10 × 14 px JPEG, as an uploaded photo is stored.
    const src =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACBAQExATFhYWFhYWGhgaGxsbGhoaGhsbGx0dHSIiIh0dHRsbHR0gICIiJSYlIyMiIyYmKCgoMDAuLjg4OkVFU//EAEwAAQEAAAAAAAAAAAAAAAAAAAAEAQEBAAAAAAAAAAAAAAAAAAAEBRABAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/AABEIAA4ACgMBIgACEQADEQD/2gAMAwEAAhEDEQA/AIgE89//2Q==";
    for (const layout of ["full", "band", "framed"] as const) {
      const cover = {
        ...book.cover,
        artwork: "photo" as const,
        photo: { kind: "upload" as const, src, name: "tiny.jpg" },
        layout,
      };
      const buf = await renderToBuffer(<BookPdf book={{ ...book, cover }} fonts="standard" />);
      expect(buf.subarray(0, 4).toString()).toBe("%PDF");
      expect(buf.includes("/Subtype /Image")).toBe(true);
    }
  });

  it("layers scrim strips so each band gets the gradient's opacity", () => {
    for (const scrim of [
      { x: 0, y: 100, width: 200, height: 180, color: "#000", from: 0, to: 0.88 },
      { x: 0, y: 0, width: 200, height: 70, color: "#000", from: 0.45, to: 0 },
    ]) {
      const strips = scrimStrips(scrim);
      // Opacity over a band = 1 − Π(1 − a) of the strips covering it.
      const at = (y: number) =>
        1 - strips.filter((r) => r.y <= y && y < r.y + r.height).reduce((p, r) => p * (1 - r.fillOpacity), 1);
      const top = scrim.y + 0.5;
      const bottom = scrim.y + scrim.height - 0.5;
      expect(at(top)).toBeCloseTo(scrim.from, 1);
      expect(at(bottom)).toBeCloseTo(scrim.to, 1);
    }
  });

  it("puts the same title lines on the PDF cover as on screen", () => {
    const scene = coverScene(getCoverDesign({ title: book.title, mood: "practical" }), book.title);
    const spans = titleTspans(scene);
    expect(spans.map((s) => s.text)).toEqual(scene.title.lines);
    expect(spans[1].y - spans[0].y).toBeCloseTo(scene.title.lineGap);
  });

  it("links the contents to the chapters, bookmarks them, and makes the last page's link clickable", async () => {
    const buf = await renderToBuffer(
      <BookPdf book={{ ...book, ctaUrl: "lindstudio.com/call", brand: "Lind Studio" }} fonts="standard" />,
    );
    const pdf = buf.toString("latin1");
    expect(pdf).toContain("(https://lindstudio.com/call)");
    // One internal link per contents row, each to its chapter's destination.
    for (let i = 1; i <= book.chapters.length; i++) expect(pdf).toContain(`chapter-${i}`);
    expect((pdf.match(/\/Outlines/g) ?? []).length).toBeGreaterThan(0);
  });

  it("makes a safe file name", () => {
    expect(slugify("Design Systems for Small Teams!")).toBe("design-systems-for-small-teams");
    expect(slugify("  Ünïcode & Co.  ")).toBe("unicode-co");
    expect(slugify("")).toBe("my-book");
  });
});
