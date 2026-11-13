import { afterEach, describe, expect, it } from "vitest";
import { ctaText, draftOutline, shapeIdea, suggestAudiences, suggestTitles, writeChapter } from "./generate";
import { failuresFromUrl, setFailures, simulate, streamParagraphs, SimulatedFailure } from "./simulate";
import { validateTopic } from "./validate";

const custom = { topic: "Sourdough baking for busy parents", audience: "Parents with full-time jobs", mood: "calm" as const };
const words = (p: string[]) => p.join(" ").split(/\s+/).length;

describe("validateTopic", () => {
  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["design", "broad"],
    ["asdf qwer", "gibberish"],
    ["ux", "short"],
    ["better onboarding", "short"],
  ])("%j → %s", (topic, kind) => {
    const r = validateTopic(topic);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.kind).toBe(kind);
      expect(r.message.length).toBeGreaterThan(0);
    }
  });

  it("broad topics come with three narrower suggestions", () => {
    const r = validateTopic("marketing");
    expect(!r.ok && r.suggestions).toHaveLength(3);
  });

  it("accepts a specific topic", () => {
    expect(validateTopic("Morning routines for remote workers").ok).toBe(true);
    expect(validateTopic("Design systems for small teams").ok).toBe(true);
  });
});

describe("generation", () => {
  it("custom topics never leak demo content", () => {
    const outline = draftOutline(custom);
    const chapter = writeChapter(custom, outline[0]);
    const text = JSON.stringify([outline, chapter, suggestTitles(custom), suggestAudiences(custom.topic)]);
    expect(text).not.toMatch(/design system|token|component/i);
    expect(text).toMatch(/sourdough/i);
  });

  it("drafts six chapters with titles and summaries", () => {
    const outline = draftOutline(custom);
    expect(outline).toHaveLength(6);
    for (const c of outline) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.summary.length).toBeGreaterThan(0);
    }
    expect(new Set(outline.map((c) => c.title)).size).toBe(6);
  });

  it("is deterministic for the same input", () => {
    expect(draftOutline(custom)).toEqual(draftOutline(custom));
  });

  it("suggestTitles puts the user's wording first", () => {
    const t = suggestTitles(custom);
    expect(t[0]).toEqual({ style: "yours", title: "Sourdough Baking for Busy Parents" });
    expect(t.map((x) => x.style)).toEqual(["yours", "clear", "benefit", "bold", "playful"]);
  });

  it("more ideas change the AI titles but keep the user's wording", () => {
    const a = suggestTitles(custom, 0);
    const b = suggestTitles(custom, 1);
    expect(b[0]).toEqual(a[0]);
    expect(b.slice(1)).not.toEqual(a.slice(1));
  });

  it("rewrite directions change the text in the expected way", () => {
    const ch = draftOutline(custom)[1];
    const base = writeChapter(custom, ch);
    const shorter = writeChapter(custom, ch, { direction: "shorter" });
    const detailed = writeChapter(custom, ch, { direction: "detailed" });
    const practical = writeChapter(custom, ch, { direction: "practical" });
    expect(base.length).toBeGreaterThanOrEqual(4);
    expect(shorter.length).toBeLessThanOrEqual(3);
    expect(words(shorter)).toBeLessThan(words(base));
    expect(words(detailed)).toBeGreaterThan(words(base));
    expect(practical.join("\n")).toMatch(/^1\. /m);
  });

  it("a free instruction is addressed in the rewrite", () => {
    const ch = draftOutline(custom)[0];
    const text = writeChapter(custom, ch, { instruction: "Add an example for a family of four" }).join(" ");
    expect(text).toMatch(/family of four/i);
  });

  it("shapeIdea turns a rough idea into three specific topics", () => {
    const ideas = shapeIdea("pricing");
    expect(ideas).toHaveLength(3);
    for (const i of ideas) expect(i.toLowerCase()).toContain("pricing");
    expect(shapeIdea("")).toHaveLength(3);
  });

  it("suggestAudiences returns three options", () => {
    expect(suggestAudiences(custom.topic)).toHaveLength(3);
  });

  it("ctaText uses the author's call to action when given", () => {
    expect(ctaText({ cta: "Book a free 20-minute call at example.com", author: "Ivan Pavlov", title: "X" }).body).toMatch(
      /Book a free 20-minute call/,
    );
    expect(ctaText({ cta: "", author: "Ivan Pavlov", title: "X" }).heading.length).toBeGreaterThan(0);
  });
});

describe("simulate", () => {
  afterEach(() => setFailures([]));

  it("resolves with the produced value", async () => {
    await expect(simulate("outline", () => 42, { ms: 0 })).resolves.toBe(42);
  });

  it("a failure fires once, then the retry succeeds", async () => {
    setFailures(["ch2"]);
    await expect(simulate("ch2", () => 1, { ms: 0 })).rejects.toBeInstanceOf(SimulatedFailure);
    await expect(simulate("ch2", () => 1, { ms: 0 })).resolves.toBe(1);
  });

  it("fail=all fails every key once", async () => {
    setFailures(["all"]);
    await expect(simulate("ch1", () => 1, { ms: 0 })).rejects.toBeInstanceOf(SimulatedFailure);
    await expect(simulate("cover", () => 1, { ms: 0 })).rejects.toBeInstanceOf(SimulatedFailure);
    await expect(simulate("ch1", () => 1, { ms: 0 })).resolves.toBe(1);
  });

  it("failuresFromUrl parses the fail flag", () => {
    expect(failuresFromUrl("?fail=ch2,cover")).toEqual(["ch2", "cover"]);
    expect(failuresFromUrl("?x=1")).toEqual([]);
  });

  it("streamParagraphs ends with the full text", async () => {
    const chunks: string[] = [];
    await streamParagraphs(["One two three.", "Four five."], (t) => chunks.push(t), { cps: Infinity });
    expect(chunks.at(-1)).toBe("One two three.\n\nFour five.");
  });
});
