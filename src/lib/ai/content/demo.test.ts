import { describe, expect, it } from "vitest";
import { draftOutline, writeChapter } from "../generate";
import { demoChapter, demoOutline, isDemoTopic } from "./demo";

const count = (p: string[]) => p.join(" ").split(/\s+/).filter(Boolean).length;

describe("demo book", () => {
  it("has six chapters with titles and summaries", () => {
    expect(demoOutline).toHaveLength(6);
    for (const c of demoOutline) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.summary.length).toBeGreaterThan(0);
    }
  });

  it("chapter 1 is fully written (700–900 words); the rest are 300–500", () => {
    expect(count(demoChapter(0))).toBeGreaterThanOrEqual(700);
    expect(count(demoChapter(0))).toBeLessThanOrEqual(900);
    for (let i = 1; i < 6; i++) {
      expect(count(demoChapter(i))).toBeGreaterThanOrEqual(300);
      expect(count(demoChapter(i))).toBeLessThanOrEqual(500);
    }
  });

  it("never repeats a paragraph", () => {
    const all = demoOutline.flatMap((_, i) => demoChapter(i));
    expect(new Set(all).size).toBe(all.length);
  });

  it("recognises the demo topic only", () => {
    expect(isDemoTopic("Design systems for small teams")).toBe(true);
    expect(isDemoTopic("Sourdough")).toBe(false);
  });

  it("is what generation returns for the demo topic", () => {
    const b = { topic: "Design systems for small teams", audience: "Founders", mood: "practical" as const };
    expect(draftOutline(b)).toEqual(demoOutline);
    expect(writeChapter(b, demoOutline[0])).toEqual(demoChapter(0));
  });
});
