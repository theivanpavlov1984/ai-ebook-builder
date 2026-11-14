import { describe, expect, it } from "vitest";
import { changedParagraphs } from "./diff";

describe("changedParagraphs", () => {
  it("marks only paragraphs that are new", () => {
    expect(changedParagraphs(["One.", "Two."], ["A warm opening.", "One.", "Two."])).toEqual([true, false, false]);
  });

  it("ignores whitespace differences", () => {
    expect(changedParagraphs(["One  sentence. "], ["One sentence."])).toEqual([false]);
  });

  it("marks everything when the whole text changed", () => {
    expect(changedParagraphs(["One.", "Two."], ["Shorter."])).toEqual([true]);
  });
});
