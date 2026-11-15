import { describe, expect, it } from "vitest";
import { chapterBlocks } from "./chapter-blocks";

describe("chapterBlocks", () => {
  it("turns the to-do list at the end of a chapter into one block", () => {
    const blocks = chapterBlocks(["Intro.", "Try this today:", "1. Write it down.\n2. Pick one result.", "Outro."]);
    expect(blocks).toEqual([
      { kind: "text", text: "Intro.", from: 0 },
      { kind: "action", heading: "Try this today", steps: ["Write it down.", "Pick one result."], from: 1 },
      { kind: "text", text: "Outro.", from: 3 },
    ]);
  });

  it("leaves a heading without a numbered list – or a list without the heading – as plain text", () => {
    expect(chapterBlocks(["Try this today:", "Just a sentence."]).map((b) => b.kind)).toEqual(["text", "text"]);
    expect(chapterBlocks(["1. A step on its own."]).map((b) => b.kind)).toEqual(["text"]);
    expect(chapterBlocks(["Try this today:"]).map((b) => b.kind)).toEqual(["text"]);
  });
});
