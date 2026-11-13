import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  directionsForMood,
  getCoverDesign,
  hashSeed,
  palettes,
  titleFontSize,
  type ArtDirection,
} from "./cover-design";

const LONG = "Design Systems for Small Teams: A Practical Field Guide for Founders and First Hires";

describe("hashSeed", () => {
  it("is deterministic and non-negative", () => {
    expect(hashSeed("Primer")).toBe(hashSeed("Primer"));
    expect(hashSeed("Primer")).not.toBe(hashSeed("Primer!"));
    expect(hashSeed("Primer")).toBeGreaterThanOrEqual(0);
    expect(hashSeed("")).toBeGreaterThanOrEqual(0);
  });
});

describe("directionsForMood", () => {
  it("maps each mood to three directions, spec order", () => {
    expect(directionsForMood("practical")).toEqual(["editorial", "geometric", "typographic"]);
    expect(directionsForMood("inspiring")).toEqual(["organic", "editorial", "typographic"]);
    expect(directionsForMood("calm")).toEqual(["organic", "editorial", "geometric"]);
    expect(directionsForMood("bold")).toEqual(["typographic", "geometric", "editorial"]);
    expect(directionsForMood("playful")).toEqual(["geometric", "organic", "typographic"]);
  });
});

describe("getCoverDesign", () => {
  it("returns the same design for the same input", () => {
    const a = getCoverDesign({ title: "Design Systems for Small Teams", mood: "practical" });
    const b = getCoverDesign({ title: "Design Systems for Small Teams", mood: "practical" });
    expect(a).toEqual(b);
  });

  it("changes when the variant changes (shuffle)", () => {
    expect(getCoverDesign({ title: "X", mood: "calm", variant: 1 }).seed).not.toBe(
      getCoverDesign({ title: "X", mood: "calm" }).seed,
    );
  });

  it("uses the mood's first direction by default and honours an explicit one", () => {
    expect(getCoverDesign({ title: "X", mood: "bold" }).direction).toBe("typographic");
    expect(getCoverDesign({ title: "X", mood: "bold", direction: "organic" }).direction).toBe("organic");
  });

  it("picks the palette from the chosen direction", () => {
    const d = getCoverDesign({ title: "X", mood: "calm", direction: "geometric" });
    expect(palettes.geometric).toContainEqual(d.palette);
  });
});

describe("titleFontSize", () => {
  it("shrinks long titles but never below the minimum", () => {
    const short = titleFontSize("Design Systems", 28, 14);
    const long = titleFontSize(LONG, 28, 14);
    expect(short).toBe(28);
    expect(long).toBeLessThan(short);
    expect(long).toBeGreaterThanOrEqual(14);
    expect(titleFontSize("x".repeat(500), 28, 14)).toBe(14);
  });

  it("never grows as the title gets longer", () => {
    let prev = Infinity;
    for (let n = 1; n <= 120; n++) {
      const size = titleFontSize("a".repeat(n), 28, 14);
      expect(size).toBeLessThanOrEqual(prev);
      prev = size;
    }
  });
});

describe("palettes", () => {
  it("has three palettes per direction, each with readable title contrast (≥ 4.5:1)", () => {
    const directions: ArtDirection[] = ["editorial", "geometric", "organic", "typographic"];
    for (const d of directions) {
      expect(palettes[d]).toHaveLength(3);
      for (const p of palettes[d]) expect(contrastRatio(p.bg, p.ink)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("computes WCAG contrast correctly", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });
});
