import { describe, expect, it } from "vitest";
import { loopLength, readerFrame, readers } from "./readerDemo";

describe("readerFrame", () => {
  it("rests on the empty form, then types, sends and unlocks", () => {
    expect(readerFrame(0)).toEqual({ email: "", phase: "idle", reader: 0 });
    expect(readerFrame(1300)).toMatchObject({ email: "ma", phase: "typing" });
    const typed = 1200 + readers[0].length * 80;
    expect(readerFrame(typed + 100)).toMatchObject({ email: readers[0], phase: "sending" });
    expect(readerFrame(typed + 700)).toMatchObject({ email: readers[0], phase: "unlocked" });
  });

  it("moves to the next reader each loop and wraps around", () => {
    const first = loopLength(readers[0]);
    expect(readerFrame(first)).toEqual({ email: "", phase: "idle", reader: 1 });
    const cycle = readers.reduce((sum, r) => sum + loopLength(r), 0);
    expect(readerFrame(cycle + 10)).toEqual(readerFrame(10));
  });
});
