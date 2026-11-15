import { describe, expect, it } from "vitest";
import { estimate } from "./estimate";
import type { Chapter } from "./types";

const outlined = (n: number): Chapter[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    title: "t",
    summary: "",
    body: [],
    status: "idle",
    versions: [],
  }));

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("estimate", () => {
  it("6 outlined chapters ≈ 15 pages (2 each + cover, contents, CTA)", () => {
    expect(estimate({ chapters: outlined(6) }).pages).toBe(15);
  });

  it("counts written words the way the PDF lays them out, reading at 200 wpm", () => {
    const book = (n: number) => ({
      chapters: outlined(1).map((c) => ({ ...c, status: "done" as const, body: [words(n)] })),
    });
    // Measured in the exported PDF: 120 words fit on one page, 220 and 340 take two, 740 take three.
    expect(estimate(book(120)).pages).toBe(3 + 1);
    expect(estimate(book(220)).pages).toBe(3 + 2);
    expect(estimate(book(340)).pages).toBe(3 + 2);
    expect(estimate(book(740)).pages).toBe(3 + 3);
    expect(estimate(book(740)).minutes).toBe(4);
  });

  it("an empty book is just cover, contents and CTA", () => {
    expect(estimate({ chapters: [] })).toEqual({ pages: 3, minutes: 0 });
  });
});
