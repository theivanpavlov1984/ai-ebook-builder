/**
 * Simulated generation. Same shape as real model calls would have, but deterministic:
 * the demo topic uses hand-written content, anything else uses templates seeded by the topic.
 */
import { hashSeed, type Mood } from "../model/cover-design";
import type { Book, Chapter } from "../model/types";
import { demoAudiences, demoChapter, demoOutline, demoTitles, isDemoTopic } from "./content/demo";
import { audienceHints, audiencePool, exampleTopics, moodOpeners, slots, titlePools } from "./content/templates";

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

/** "junior designer" → "junior designers", "coach" → "coaches", "nanny" → "nannies". Naive, but enough here. */
function plural(phrase: string): string {
  if (/s$/i.test(phrase)) return phrase;
  if (/(ch|sh|x|z)$/i.test(phrase)) return `${phrase}es`;
  if (/[^aeiou]y$/i.test(phrase)) return `${phrase.slice(0, -1)}ies`;
  return `${phrase}s`;
}

/**
 * Splits a topic into what it's about and who it's for:
 * "Sourdough baking for busy parents" → { subject: "sourdough baking", forWhom: "busy parents" };
 * "Negotiating your first salary as a junior designer" → { subject: "negotiating your first salary",
 * forWhom: "junior designers" }. Without the split the whole sentence would land in every title and chapter.
 */
export function parseTopic(topic: string): { subject: string; forWhom: string } {
  const t = topic.trim().replace(/[.!?]+$/, "");
  const longEnough = (s: string) => s.split(/\s+/).length >= 2;
  const forMatch = t.match(/^(.+?)\s+for\s+(.+)$/i);
  if (forMatch && longEnough(forMatch[1])) return { subject: forMatch[1], forWhom: forMatch[2] };
  const asMatch = t.match(/^(.+?)\s+as\s+an?\s+(.+)$/i);
  if (asMatch && longEnough(asMatch[1])) return { subject: asMatch[1], forWhom: plural(asMatch[2]) };
  return { subject: t, forWhom: "" };
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

/**
 * Three readers for the topic: the one the topic names ("… for busy parents"), then readers matched by keyword,
 * then the general pool – so "Negotiating your first salary as a junior designer" suggests junior designers and
 * graduates, not "Busy professionals".
 */
export function suggestAudiences(topic: string): string[] {
  if (isDemoTopic(topic)) return [...demoAudiences];
  const out: string[] = [];
  const add = (a: string) => {
    if (a && out.length < 3 && !out.some((o) => o.toLowerCase() === a.toLowerCase())) out.push(a);
  };
  const { forWhom } = parseTopic(topic);
  add(upperFirst(forWhom));
  const topicWords = topic.toLowerCase().match(/[a-z]+/g) ?? [];
  for (const hint of audienceHints)
    if (hint.stems.some((stem) => topicWords.some((w) => w.startsWith(stem)))) hint.audiences.forEach(add);
  const seed = hashSeed(topic.toLowerCase());
  for (let i = 0; out.length < 3; i++) add(pick(audiencePool, seed, i * 3));
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

/**
 * A chapter is its prose plus a short to-do list at the end ("Try this today"), so every chapter ends with
 * something the reader can do the same day – as chapter 1 promises. The hand-written demo chapters are prose only.
 */
function baseChapter(b: Brief, chapter: Pick<Chapter, "title" | "summary">): { prose: string[]; action: string[] } {
  if (isDemoTopic(b.topic)) {
    const i = demoOutline.findIndex((c) => c.title === chapter.title);
    const demo = i >= 0 ? demoChapter(i) : [];
    if (demo.length) return { prose: demo, action: [] };
  }
  const slot = slots[slotFor(b, chapter)];
  const [first, ...rest] = slot.body.map((p) => fill(p, b));
  const steps = slot.steps.map((step, i) => `${i + 1}. ${fill(step, b)}`).join("\n");
  return { prose: [`${moodOpeners[b.mood]} ${first}`, ...rest], action: ["Try this today:", steps] };
}

export function writeChapter(
  b: Brief,
  chapter: Pick<Chapter, "title" | "summary">,
  opts?: { direction?: RewriteDirection; instruction?: string },
): string[] {
  const { prose, action } = baseChapter(b, chapter);
  const slot = slots[slotFor(b, chapter)];
  let out = [...prose, ...action];

  switch (opts?.direction) {
    case "shorter":
      out = [
        sentences(prose[0]).slice(0, 2).join(" "),
        sentences(prose[Math.floor(prose.length / 2)])[0],
        sentences(prose[prose.length - 1])[0],
      ];
      break;
    case "simpler":
      out = [...prose.map((p, i) => (i === 0 ? "In short: " : "") + sentences(p).slice(0, 2).join(" ")), ...action];
      break;
    case "detailed":
      out = [...prose.slice(0, -1), ...slot.deeper.map((p) => fill(p, b)), prose[prose.length - 1], ...action];
      break;
    case "practical":
      // Less reasoning, more doing: the opening, the to-do list, and how to make it stick.
      out = [
        prose[0],
        ...(action.length
          ? action
          : ["Try this today:", slot.steps.map((st, i) => `${i + 1}. ${fill(st, b)}`).join("\n")]),
        "Give each step a time and a place in your calendar, and tick it off when it's done. A finished list is the best motivation there is.",
        prose[prose.length - 1],
      ];
      break;
    case "warmer":
      out = [
        `If this feels like a lot, that's completely normal – most ${lowerFirst(b.audience || "readers")} feel the same at first. Go one step at a time.`,
        ...out,
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
  // Signed only when the author gave a name.
  const signature = b.author.trim() ? `\n\n– ${b.author.trim()}` : "";
  if (b.cta.trim()) return { heading: "What's next", body: `${b.cta.trim()}${signature}` };
  return {
    heading: "Thanks for reading",
    body: `I hope ${b.title || "this guide"} gave you a clear first step. If it helped, I'd love to hear what you try first.${signature}`,
  };
}
