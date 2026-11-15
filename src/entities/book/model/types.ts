import type { ArtDirection, Mood } from "./cover-design";
import type { PhotoChoice, PhotoLayout } from "./cover-photos";

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
  /** The address the closing page links to ("mysite.com/call"), clickable in the PDF. */
  ctaUrl?: string;
  /** A business or brand name, signed on the closing page after the author's name. */
  brand?: string;
  title: string;
  subtitle: string;
  author: string;
  chapters: Chapter[];
  cover: {
    direction: ArtDirection;
    variant: number;
    status: "idle" | "working" | "done" | "failed";
    /** Shapes (the default) or a photo. The shape style is kept, so switching back restores it. */
    artwork?: "shapes" | "photo";
    photo?: PhotoChoice;
    layout?: PhotoLayout;
  };
  finalizedAt?: number;
};

export const stageOrder: Stage[] = ["describe", "title", "outline", "build", "review", "final"];
