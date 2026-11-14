/**
 * Share links without a backend: the readable part of the book is compressed into the URL hash.
 * The hash never reaches a server. Anything that doesn't decode into a valid book returns null.
 */
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { ArtDirection, Mood } from "../model/cover-design";
import type { Book } from "../model/types";

type Packed = {
  v: 1;
  t: string;
  s: string;
  a: string;
  m: Mood;
  cta: string;
  topic: string;
  c: [ArtDirection, number];
  ch: [string, string, string[]][];
};

const MOODS: Mood[] = ["practical", "inspiring", "calm", "bold", "playful"];
const DIRECTIONS: ArtDirection[] = ["editorial", "geometric", "organic", "typographic"];

export function encodeBook(book: Book): string {
  const packed: Packed = {
    v: 1,
    t: book.title,
    s: book.subtitle,
    a: book.author,
    m: book.mood,
    cta: book.cta,
    topic: book.topic,
    c: [book.cover.direction, book.cover.variant],
    ch: book.chapters.map((c) => [c.title, c.summary, c.body]),
  };
  return compressToEncodedURIComponent(JSON.stringify(packed));
}

const isStr = (x: unknown): x is string => typeof x === "string";

function isPacked(x: unknown): x is Packed {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return (
    p.v === 1 &&
    isStr(p.t) &&
    isStr(p.s) &&
    isStr(p.a) &&
    isStr(p.cta) &&
    isStr(p.topic) &&
    MOODS.includes(p.m as Mood) &&
    Array.isArray(p.c) &&
    DIRECTIONS.includes(p.c[0] as ArtDirection) &&
    Number.isInteger(p.c[1]) &&
    Array.isArray(p.ch) &&
    p.ch.length > 0 &&
    p.ch.every((c) => Array.isArray(c) && isStr(c[0]) && isStr(c[1]) && Array.isArray(c[2]) && c[2].every(isStr))
  );
}

export function decodeBook(hash: string): Book | null {
  const code = hash.replace(/^#/, "").trim();
  if (!code) return null;
  let parsed: unknown;
  try {
    const json = decompressFromEncodedURIComponent(code);
    if (!json) return null;
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!isPacked(parsed)) return null;
  const p = parsed;
  return {
    id: "shared",
    createdAt: 0,
    updatedAt: 0,
    stage: "final",
    topic: p.topic,
    audience: "",
    mood: p.m,
    cta: p.cta,
    title: p.t,
    subtitle: p.s,
    author: p.a,
    chapters: p.ch.map(([title, summary, body], i) => ({
      id: `s${i}`,
      title,
      summary,
      body,
      status: "done",
      versions: [],
    })),
    cover: { direction: p.c[0], variant: p.c[1], status: "done" },
  };
}

export function shareUrl(book: Book, origin: string): string {
  return `${origin}/b#${encodeBook(book)}`;
}
