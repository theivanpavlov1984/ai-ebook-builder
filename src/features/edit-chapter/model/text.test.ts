import { describe, expect, it } from "vitest";
import { bodyToText, textToBody } from "./text";

describe("chapter text in the editor", () => {
  it("round-trips paragraphs, including a numbered list", () => {
    const body = ["Intro.", "Try this today:", "1. Write it down.\n2. Pick one result."];
    expect(textToBody(bodyToText(body))).toEqual(body);
  });

  it("splits on empty lines and drops the extra space people leave around them", () => {
    expect(textToBody("  One.\r\n\r\n\n  Two.  \n   \nThree.")).toEqual(["One.", "Two.", "Three."]);
    expect(textToBody("   \n\n  ")).toEqual([]);
  });
});
