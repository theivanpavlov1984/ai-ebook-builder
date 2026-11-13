import { describe, expect, it } from "vitest";
import { estimate } from "./estimate";
import type { Chapter } from "./types";

const outlined = (n: number): Chapter[] =>
  Array.from({ length: n }, (_, i) => ({ id: `c${i}`, title: "t", summary: "", body: [], status: "idle", versions: [] }));

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("estimate", () => {
  it("6 outlined chapters ≈ 15 pages (2 each + cover, contents, CTA)", () => {
    expect(estimate({ chapters: outlined(6) }).pages).toBe(15);
  });

  it("counts written words: 750 words = 3 pages, reading at 200 wpm", () => {
    const chapters = outlined(2).map((c) => ({ ...c, status: "done" as const, body: [words(750)] }));
    const e = estimate({ chapters });
    expect(e.pages).toBe(3 + 3 + 3);
    expect(e.minutes).toBe(8);
  });

  it("an empty book is just cover, contents and CTA", () => {
    expect(estimate({ chapters: [] })).toEqual({ pages: 3, minutes: 0 });
  });
});
