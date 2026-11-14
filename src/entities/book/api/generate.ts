/**
 * Simulated generation. Same shape as real model calls would have, but deterministic:
 * the demo topic uses hand-written content, anything else uses templates seeded by the topic.
 */
import { hashSeed, type Mood } from "../model/cover-design";
import type { Book, Chapter } from "../model/types";
import { demoAudiences, demoChapter, demoOutline, demoTitles, isDemoTopic } from "./content/demo";
import { audiencePool, exampleTopics, moodOpeners, slots, titlePools } from "./content/templates";

type Brief = { topic: string; audience: string; mood: Mood };
export type RewriteDirection = "simpler" | "detailed" | "shorter" | "practical" | "warmer";
export type TitleStyle = "yours" | "clear" | "benefit" | "bold" | "playful";

const SMALL = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);

export function titleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && SMALL.has(w.toLowerCase())
        ? w.toLowerCase()
        : w.replace(/(^|-)(\p{Ll})/gu, (_, dash: string, ch: string) => dash + ch.toUpperCase()),
    )
    .join(" ");
}

const lowerFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);
const upperFirst = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const sentences = (p: string) => p.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [p];

/**
 * Splits a topic into what it's about and who it's for:
 * "Sourdough baking for busy parents" → { subject: "sourdough baking", forWhom: "busy parents" }.
 */
export function parseTopic(topic: string): { subject: string; forWhom: string } {
  const t = topic.trim().replace(/[.!?]+$/, "");
  const m = t.match(/^(.+?)\s+for\s+(.+)$/i);
  const [subject, forWhom] = m && m[1].split(/\s+/).length >= 2 ? [m[1], m[2]] : [t, ""];
  return { subject, forWhom };
}

function fill(text: string, b: Pick<Brief, "topic" | "audience">): string {
  const topic = b.topic.trim().replace(/[.!?]+$/, "");
  const { subject, forWhom } = parseTopic(topic);
  const audience = lowerFirst(b.audience.trim() || forWhom || "readers like you");
  return text
    .replace(/\{T\}/g, titleCase(topic))
    .replace(/\{S\}/g, titleCase(subject))
    .replace(/\{subject\}/g, lowerFirst(subject))
    .replace(/\{audience\}/g, audience)
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());
}

function pick<T>(list: T[], seed: number, offset = 0): T {
  return list[(seed + offset) % list.length];
}

export function shapeIdea(roughIdea: string): string[] {
  const t = roughIdea.trim().replace(/[.!?]+$/, "");
  if (!t) return [...exampleTopics];
  const lower = lowerFirst(t);
  return [
    `${upperFirst(t)} for complete beginners`,
    `${upperFirst(t)}: a 30-day plan for busy people`,
    `Common ${lower} mistakes and how to fix them`,
  ];
}

export function suggestAudiences(topic: string): string[] {
  if (isDemoTopic(topic)) return [...demoAudiences];
  const seed = hashSeed(topic.toLowerCase());
  const out: string[] = [];
  for (let i = 0; out.length < 3; i++) {
    const a = pick(audiencePool, seed, i * 3);
    if (!out.includes(a)) out.push(a);
  }
  return out;
}

export function suggestTitles(b: Brief, round = 0): { style: TitleStyle; title: string }[] {
  const yours = titleCase(b.topic.replace(/[.!?]+$/, ""));
  const pools = isDemoTopic(b.topic)
    ? {
        clear: [...demoTitles.clear, ...titlePools.clear],
        benefit: [...demoTitles.benefit, ...titlePools.benefit],
        bold: [...demoTitles.bold, ...titlePools.bold],
        playful: [...demoTitles.playful, ...titlePools.playful],
      }
    : titlePools;
  const styles = ["clear", "benefit", "bold", "playful"] as const;
  return [
    { style: "yours", title: yours },
    ...styles.map((style) => ({ style, title: fill(pools[style][round % pools[style].length], b) })),
  ];
}

export function draftOutline(b: Brief): { title: string; summary: string }[] {
  if (isDemoTopic(b.topic) && demoOutline.length) return demoOutline.map((c) => ({ ...c }));
  const seed = hashSeed(b.topic.toLowerCase());
  return slots.map((slot, i) => ({
    title: upperFirst(fill(pick(slot.titles, seed, i), b)),
    summary: fill(slot.summary, b),
  }));
}

/** An alternative idea for one chapter slot ("Suggest another idea"). */
export function alternativeChapter(b: Brief, index: number, round: number): { title: string; summary: string } {
  const slot = slots[index % slots.length];
  const seed = hashSeed(b.topic.toLowerCase());
  return { title: upperFirst(fill(pick(slot.titles, seed, index + round), b)), summary: fill(slot.summary, b) };
}

function slotFor(b: Brief, chapter: Pick<Chapter, "title">): number {
  const outline = draftOutline(b);
  const i = outline.findIndex((c) => c.title === chapter.title);
  return i >= 0 ? i : hashSeed(chapter.title) % slots.length;
}

function baseParagraphs(b: Brief, chapter: Pick<Chapter, "title" | "summary">): string[] {
  if (isDemoTopic(b.topic)) {
    const i = demoOutline.findIndex((c) => c.title === chapter.title);
    const demo = i >= 0 ? demoChapter(i) : [];
    if (demo.length) return demo;
  }
  const slot = slots[slotFor(b, chapter)];
  const [first, ...rest] = slot.body.map((p) => fill(p, b));
  return [`${moodOpeners[b.mood]} ${first}`, ...rest];
}

export function writeChapter(
  b: Brief,
  chapter: Pick<Chapter, "title" | "summary">,
  opts?: { direction?: RewriteDirection; instruction?: string },
): string[] {
  const base = baseParagraphs(b, chapter);
  const slot = slots[slotFor(b, chapter)];
  let out = base;

  switch (opts?.direction) {
    case "shorter":
      out = [
        sentences(base[0]).slice(0, 2).join(" "),
        sentences(base[Math.floor(base.length / 2)])[0],
        sentences(base[base.length - 1])[0],
      ];
      break;
    case "simpler":
      out = base.map((p, i) => (i === 0 ? "In short: " : "") + sentences(p).slice(0, 2).join(" "));
      break;
    case "detailed":
      out = [...base.slice(0, -1), ...slot.deeper.map((p) => fill(p, b)), base[base.length - 1]];
      break;
    case "practical":
      out = [...base, "Try this:", slot.steps.map((s, i) => `${i + 1}. ${fill(s, b)}`).join("\n")];
      break;
    case "warmer":
      out = [
        `If this feels like a lot, that's completely normal – most ${lowerFirst(b.audience || "readers")} feel the same at first. Go one step at a time.`,
        ...base,
      ];
      break;
  }

  if (opts?.instruction?.trim()) {
    const ask = opts.instruction.trim().replace(/[.!?]+$/, "");
    out = [
      ...out,
      `${upperFirst(ask)}: here's how that looks in practice. Start small, keep the same steps, and adjust the amount to fit your situation – the method doesn't change, only the scale does.`,
    ];
  }
  return out;
}

export function ctaText(b: Pick<Book, "cta" | "author" | "title">): { heading: string; body: string } {
  if (b.cta.trim()) return { heading: "What's next", body: `${b.cta.trim()}\n\n– ${b.author}` };
  return {
    heading: "Thanks for reading",
    body: `I hope ${b.title || "this guide"} gave you a clear first step. If it helped, I'd love to hear what you try first.\n\n– ${b.author}`,
  };
}
