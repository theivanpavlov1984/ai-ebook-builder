import { shapeIdea } from "./generate";

export type TopicCheck =
  | { ok: true }
  | { ok: false; kind: "empty" | "short" | "gibberish" | "broad"; message: string; suggestions: string[] };

const BROAD = ["business", "marketing", "health", "design", "money", "life", "fitness", "productivity", "sales", "cooking"];
const NARROWER: Record<string, string[]> = {
  design: ["Design systems for small teams", "Designing your first landing page", "Design feedback for non-designers"],
  marketing: ["Email marketing for solo founders", "LinkedIn marketing for consultants", "Marketing a local bakery"],
  business: ["Starting a side business while employed", "Pricing your freelance services", "Hiring your first employee"],
  health: ["Healthy lunches for busy office workers", "Better sleep for new parents", "Desk stretches for remote workers"],
  money: ["Budgeting for freelancers with irregular income", "Saving for your first home", "Money talks for couples"],
  fitness: ["Strength training for beginners over 40", "A 20-minute home workout plan", "Running your first 5K"],
};

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

function looksLikeKeyboardMash(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length < 4) return false;
  if (/(.)\1{3,}/.test(w)) return true;
  if (!/[aeiouy]/.test(w)) return true;
  return ROWS.some((row) => row.includes(w) || [...row].reverse().join("").includes(w));
}

export function validateTopic(topic: string): TopicCheck {
  const text = topic.trim();
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return { ok: false, kind: "empty", message: "What's your book about? One sentence is enough.", suggestions: shapeIdea("") };
  }

  const mashed = words.filter(looksLikeKeyboardMash).length;
  if (mashed > 0 && mashed >= words.length / 2) {
    return {
      ok: false,
      kind: "gibberish",
      message: "I couldn't make sense of that – here are some ideas to start from.",
      suggestions: shapeIdea(""),
    };
  }

  if (words.length === 1 && BROAD.includes(words[0].toLowerCase())) {
    const w = words[0].toLowerCase();
    return {
      ok: false,
      kind: "broad",
      message: "That's a big topic. Let's narrow it down – who is it for, and what will they be able to do?",
      suggestions: NARROWER[w] ?? shapeIdea(w),
    };
  }

  if (words.length < 3) {
    return {
      ok: false,
      kind: "short",
      message: "Tell us a bit more – what should the reader learn?",
      suggestions: shapeIdea(text),
    };
  }

  return { ok: true };
}
