import { describe, expect, it } from "vitest";
import { buildFrame, builtFrame, countUp, heroExamples, heroFrame, rewriteFrame, signupCount } from "./demos";

describe("hero demo", () => {
  it("types a topic, holds it, erases it, then moves to the next one with its own tone", () => {
    const first = heroExamples[0];
    expect(heroFrame(0)).toMatchObject({ text: "", mood: first.mood, index: 0 });
    expect(heroFrame(55 * 7).text).toBe(first.topic.slice(0, 7));
    expect(heroFrame(55 * first.topic.length + 1000).text).toBe(first.topic);
    // Well past the first example: the second one, in its tone.
    const second = heroFrame(55 * first.topic.length + 2600 + 20 * first.topic.length + 350 + 55 * 5);
    expect(second).toMatchObject({ text: heroExamples[1].topic.slice(0, 5), mood: heroExamples[1].mood, index: 1 });
  });

  it("keeps the cover on a whole title: the previous book until a few letters are typed, the full one while erasing", () => {
    const [first, second] = heroExamples;
    const firstDone = 55 * first.topic.length + 2600 + 20 * first.topic.length + 350;
    expect(heroFrame(firstDone + 55).cover).toBe(first.topic);
    expect(heroFrame(firstDone + 55 * 6).cover).toBe(second.topic.slice(0, 6));
    expect(heroFrame(55 * first.topic.length + 2600 + 20 * 5).cover).toBe(first.topic);
  });

  it("loops", () => {
    const total = heroExamples.reduce((s, e) => s + e.topic.length * 75 + 2950, 0);
    expect(heroFrame(total + 55 * 3)).toEqual(heroFrame(55 * 3));
  });
});

describe("build demo", () => {
  const lengths = [150, 150];

  it("writes chapters one by one, streaming text, then the cover, then holds the finished book", () => {
    expect(buildFrame(0, lengths)).toMatchObject({ done: 0, active: 0, chars: 0, cover: "waiting" });
    expect(buildFrame(500, lengths)).toMatchObject({ active: 0, chars: 75 });
    expect(buildFrame(1500, lengths)).toMatchObject({ done: 1, active: 1 });
    expect(buildFrame(3000, lengths)).toMatchObject({ done: 2, active: -1, cover: "working", ready: false });
    expect(buildFrame(5000, lengths)).toEqual(builtFrame(2));
  });

  it("starts over after the finished book has been on screen for a while", () => {
    expect(buildFrame(2 * 1450 + 1800 + 3200 + 10, lengths)).toMatchObject({ active: 0, done: 0 });
  });
});

describe("tile demos", () => {
  it("a rewrite goes from reading to a suggestion to kept, and loops", () => {
    expect(rewriteFrame(0)).toBe("reading");
    expect(rewriteFrame(1500)).toBe("chosen");
    expect(rewriteFrame(2500)).toBe("rewriting");
    expect(rewriteFrame(4000)).toBe("suggested");
    expect(rewriteFrame(6500)).toBe("keeping");
    expect(rewriteFrame(8000)).toBe("kept");
    expect(rewriteFrame(9000 + 100)).toBe("reading");
  });

  it("sign-ups arrive one at a time", () => {
    expect(signupCount(0)).toBe(1);
    expect(signupCount(1900)).toBe(2);
    expect(signupCount(5800)).toBe(4);
  });

  it("counts up to its value and stays there", () => {
    expect(countUp(0, 15)).toBe(0);
    expect(countUp(450, 15)).toBeGreaterThan(7);
    expect(countUp(900, 15)).toBe(15);
    expect(countUp(5000, 15)).toBe(15);
  });
});
