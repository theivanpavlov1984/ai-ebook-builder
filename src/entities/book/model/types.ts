import type { ArtDirection, Mood } from "./cover-design";

export type Stage = "describe" | "title" | "outline" | "build" | "review" | "final";
export type ChapterStatus = "idle" | "writing" | "done" | "failed";

export type Chapter = {
  id: string;
  title: string;
  summary: string;
  /** Paragraphs. */
  body: string[];
  status: ChapterStatus;
  /** Previous bodies, oldest first (for undo). */
  versions: string[][];
  /** A rewrite waiting for the user to keep or discard it. The body stays unchanged until then. */
  draft?: string[];
};

export type Book = {
  id: string;
  createdAt: number;
  updatedAt: number;
  stage: Stage;
  topic: string;
  audience: string;
  mood: Mood;
  /** What readers should do after reading – becomes the closing page. */
  cta: string;
  title: string;
  subtitle: string;
  author: string;
  chapters: Chapter[];
  cover: { direction: ArtDirection; variant: number; status: "idle" | "working" | "done" | "failed" };
  finalizedAt?: number;
};

export const stageOrder: Stage[] = ["describe", "title", "outline", "build", "review", "final"];
