/*
 * Timelines for the landing page's live demos: pure "time → frame" functions, so the components only draw
 * and the timing can be tested. Every timeline loops; `t` is play time in milliseconds.
 */
import type { Mood } from "@/entities/book";

/* ── Hero: the prompt types example topics, and the tone follows ─────────── */

export const heroExamples: { topic: string; mood: Mood }[] = [
  { topic: "Morning routines for remote workers", mood: "calm" },
  { topic: "Pricing your freelance services", mood: "bold" },
  { topic: "Sourdough baking for busy parents", mood: "playful" },
  { topic: "Design systems for small teams", mood: "practical" },
];

const TYPE_MS = 55;
const HOLD_MS = 2600;
const ERASE_MS = 20;
const GAP_MS = 350;

const exampleLength = (topic: string) => topic.length * TYPE_MS + HOLD_MS + topic.length * ERASE_MS + GAP_MS;

/**
 * What the prompt shows at `t`: a topic being typed, held, then erased; the tone switches with each topic.
 * `cover` is the title the live cover shows: it follows the typing, keeps the full title while the prompt is
 * erased, and holds the previous book until the next topic has a few letters – so the cover never flickers.
 */
export function heroFrame(t: number): { text: string; cover: string; mood: Mood; index: number } {
  const total = heroExamples.reduce((sum, e) => sum + exampleLength(e.topic), 0);
  let rest = t % total;
  for (let index = 0; index < heroExamples.length; index++) {
    const { topic, mood } = heroExamples[index];
    const length = exampleLength(topic);
    if (rest < length) {
      const typing = topic.length * TYPE_MS;
      const erasing = topic.length * ERASE_MS;
      let chars = topic.length;
      if (rest < typing) chars = Math.floor(rest / TYPE_MS);
      else if (rest >= typing + HOLD_MS)
        chars = Math.max(0, topic.length - Math.ceil((rest - typing - HOLD_MS) / ERASE_MS));
      if (rest >= typing + HOLD_MS + erasing) chars = 0;
      const previous = heroExamples[(index + heroExamples.length - 1) % heroExamples.length].topic;
      const cover = rest < typing ? (chars >= 3 ? topic.slice(0, chars) : previous) : topic;
      return { text: topic.slice(0, chars), cover, mood, index };
    }
    rest -= length;
  }
  return { text: "", cover: heroExamples[0].topic, mood: heroExamples[0].mood, index: 0 };
}

/* ── Watch: a book being written, chapter by chapter, then its cover ─────── */

const CHARS_PER_SECOND = 150;
const CHAPTER_GAP_MS = 450;
const COVER_MS = 1800;
const READY_HOLD_MS = 3200;

export type BuildFrame = {
  /** Chapters finished so far. */
  done: number;
  /** The chapter being written, or -1. */
  active: number;
  /** How much of the active chapter's text is on screen. */
  chars: number;
  cover: "waiting" | "working" | "done";
  ready: boolean;
};

const chapterMs = (length: number) => (length / CHARS_PER_SECOND) * 1000 + CHAPTER_GAP_MS;

/** The finished state – what a visitor who prefers reduced motion sees. */
export const builtFrame = (count: number): BuildFrame => ({
  done: count,
  active: -1,
  chars: 0,
  cover: "done",
  ready: true,
});

/** `lengths` – the characters streamed for each chapter. */
export function buildFrame(t: number, lengths: number[]): BuildFrame {
  const writing = lengths.reduce((sum, n) => sum + chapterMs(n), 0);
  const total = writing + COVER_MS + READY_HOLD_MS;
  let rest = t % total;
  for (let i = 0; i < lengths.length; i++) {
    const length = chapterMs(lengths[i]);
    if (rest < length) {
      const chars = Math.min(lengths[i], Math.floor((rest / 1000) * CHARS_PER_SECOND));
      return { done: i, active: i, chars, cover: "waiting", ready: false };
    }
    rest -= length;
  }
  if (rest < COVER_MS) return { done: lengths.length, active: -1, chars: 0, cover: "working", ready: false };
  return builtFrame(lengths.length);
}

/* ── What you get: a rewrite arriving as a suggestion, then kept ─────────── */

export type RewritePhase = "reading" | "chosen" | "rewriting" | "suggested" | "keeping" | "kept";

const rewritePhases: [RewritePhase, number][] = [
  ["reading", 1200],
  ["chosen", 700],
  ["rewriting", 1300],
  ["suggested", 3200],
  ["keeping", 500],
  ["kept", 2100],
];

export function rewriteFrame(t: number): RewritePhase {
  const total = rewritePhases.reduce((sum, [, ms]) => sum + ms, 0);
  let rest = t % total;
  for (const [phase, ms] of rewritePhases) {
    if (rest < ms) return phase;
    rest -= ms;
  }
  return "reading";
}

/* ── What you get: sign-ups arriving on the book's landing page ──────────── */

export const signups = ["Mara L.", "Tom K.", "Priya S.", "Jonas W.", "Elena R.", "Sam O."];

/** How long ago each visible sign-up arrived, newest first – tied to its place in the list, not to the name. */
export const signupAges = ["just now", "2 min ago", "5 min ago"];

const SIGNUP_MS = 1900;

/** How many sign-ups have arrived at `t` (the list loops through `signups`). */
export function signupCount(t: number): number {
  return Math.floor(t / SIGNUP_MS) + 1;
}

/* ── Small helpers ───────────────────────────────────────────────────────── */

/** A value counting up from 0 to `to` over `ms`, easing out. */
export function countUp(t: number, to: number, ms = 900): number {
  if (t >= ms) return to;
  const p = t / ms;
  return Math.round(to * (1 - (1 - p) ** 3));
}
