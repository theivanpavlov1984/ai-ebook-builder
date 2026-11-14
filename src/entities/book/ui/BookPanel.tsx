import { estimate } from "../model/estimate";
import type { Book } from "../model/types";
import { Cover } from "./Cover";
import { getCoverDesign } from "../model/cover-design";

const moodLabel = {
  practical: "Practical",
  inspiring: "Inspiring",
  calm: "Calm",
  bold: "Bold",
  playful: "Playful",
} as const;

export function bookDesign(book: Pick<Book, "title" | "topic" | "mood" | "cover">) {
  return getCoverDesign({
    title: book.title || book.topic,
    mood: book.mood,
    direction: book.cover.direction,
    variant: book.cover.variant,
  });
}

export function BookPanel({ book }: { book: Book }) {
  const title = book.title || "Untitled book";
  const chapters = book.chapters.length || 6;
  // Before the outline exists, estimate a typical 6-chapter book.
  const { pages, minutes } = book.chapters.length
    ? estimate(book)
    : { pages: estimate({ chapters: [] }).pages + chapters * 2, minutes: 0 };

  return (
    <aside aria-label="Your book" className="sticky top-8 flex flex-col gap-4">
      <p className="text-xs font-medium tracking-wider text-secondary uppercase">Your book</p>
      <Cover design={bookDesign(book)} title={title} subtitle={book.subtitle} author={book.author} size="lg" />
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-display text-lg leading-snug font-medium">{title}</p>
        {book.audience && (
          <p className="text-secondary">For {book.audience.charAt(0).toLowerCase() + book.audience.slice(1)}</p>
        )}
        <p className="text-secondary">
          {moodLabel[book.mood]} · {chapters} chapters · ~{pages} pages{minutes ? ` · ${minutes}-minute read` : ""}
        </p>
      </div>
    </aside>
  );
}
