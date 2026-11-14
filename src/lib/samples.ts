/** Example books for the landing page – complete enough to open and read ("Peek inside"). */
import type { ArtDirection, Mood } from "@/components/book/cover-design";
import { demoChapter, demoOutline } from "./ai/content/demo";
import { draftOutline, writeChapter } from "./ai/generate";
import type { Book } from "./book/types";

type Sample = {
  topic: string;
  audience: string;
  mood: Mood;
  direction: ArtDirection;
  title: string;
  subtitle: string;
  author: string;
  cta: string;
};

const samples: Sample[] = [
  {
    topic: "Design systems for small teams",
    audience: "Founders and product teams of 3–10 people",
    mood: "practical",
    direction: "editorial",
    title: "Design Systems for Small Teams",
    subtitle: "A practical guide for founders and product teams",
    author: "Ivan Pavlov",
    cta: "Want a second pair of eyes on your design system? Book a free 20-minute review call.",
  },
  {
    topic: "Calm morning routines for busy founders",
    audience: "Founders of early-stage startups",
    mood: "calm",
    direction: "organic",
    title: "Calm Mornings for Busy Founders",
    subtitle: "Start the day on purpose, not on email",
    author: "Mara Lind",
    cta: "Join my weekly newsletter for one small habit every Sunday.",
  },
  {
    topic: "Pricing your freelance services",
    audience: "Freelancers and solo founders",
    mood: "bold",
    direction: "typographic",
    title: "The Freelance Pricing Playbook",
    subtitle: "Charge what you're worth – and keep the client",
    author: "Sam Okafor",
    cta: "Get my pricing calculator template at the link in my bio.",
  },
];

function toBook(s: Sample, i: number): Book {
  const brief = { topic: s.topic, audience: s.audience, mood: s.mood };
  const outline = i === 0 ? demoOutline : draftOutline(brief);
  return {
    id: `sample-${i}`,
    createdAt: 0,
    updatedAt: 0,
    stage: "final",
    ...brief,
    cta: s.cta,
    title: s.title,
    subtitle: s.subtitle,
    author: s.author,
    chapters: outline.map((c, j) => ({
      id: `s${i}-${j}`,
      ...c,
      body: i === 0 ? demoChapter(j) : writeChapter(brief, c),
      status: "done",
      versions: [],
    })),
    cover: { direction: s.direction, variant: 0, status: "done" },
  };
}

export function sampleBooks(): Book[] {
  return samples.map(toBook);
}
