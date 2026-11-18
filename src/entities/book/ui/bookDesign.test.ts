import { describe, expect, it } from "vitest";
import { bookDesign } from "./BookPanel";

const base = {
  id: "b1",
  title: "",
  mood: "practical" as const,
  cover: { direction: "editorial" as const, variant: 0, status: "idle" as const },
};

describe("bookDesign", () => {
  it("keeps an untitled cover still while the topic is typed", () => {
    expect(bookDesign({ ...base, topic: "P" } as typeof base)).toEqual(
      bookDesign({ ...base, topic: "Pricing" } as typeof base),
    );
  });

  it("changes with the title once there is one", () => {
    expect(bookDesign({ ...base, title: "Pricing" })).not.toEqual(bookDesign(base));
  });
});
