import { describe, expect, it } from "vitest";
import { getCoverDesign } from "./cover-design";
import { coverScene } from "./cover-scene";

const TITLE = "Design Systems for Small Teams";
const LONG = "Design Systems for Small Teams: A Practical Field Guide for Founders and First Hires";

describe("coverScene", () => {
  it("is deterministic", () => {
    const d = getCoverDesign({ title: TITLE, mood: "playful" });
    expect(coverScene(d, TITLE, { author: "Ivan Pavlov" })).toEqual(coverScene(d, TITLE, { author: "Ivan Pavlov" }));
  });

  it("keeps the whole title in at most five lines", () => {
    for (const direction of ["editorial", "geometric", "organic", "typographic"] as const) {
      const s = coverScene(getCoverDesign({ title: LONG, mood: "calm", direction }), LONG);
      expect(s.title.lines.join(" ")).toBe(LONG);
      expect(s.title.lines.length).toBeLessThanOrEqual(5);
    }
  });

  it("has a 200 × 280 frame, a background and shapes", () => {
    const s = coverScene(getCoverDesign({ title: TITLE, mood: "practical" }), TITLE);
    expect([s.width, s.height]).toEqual([200, 280]);
    expect(s.bg).toMatch(/^#/);
    expect(s.shapes.length).toBeGreaterThan(0);
  });

  it("includes author and subtitle only when given", () => {
    const d = getCoverDesign({ title: TITLE, mood: "practical" });
    expect(coverScene(d, TITLE).author).toBeUndefined();
    expect(coverScene(d, TITLE, { author: "Ivan Pavlov", subtitle: "A guide" }).author?.text).toBe("Ivan Pavlov");
  });
});
