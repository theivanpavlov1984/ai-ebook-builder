import { estimate } from "../model/estimate";
import type { Book } from "../model/types";
import { Cover } from "./Cover";
import { getCoverDesign } from "../model/cover-design";
import { coverPhoto } from "../model/cover-photos";

const moodLabel = {
  practical: "Practical",
  inspiring: "Inspiring",
  calm: "Calm",
  bold: "Bold",
  playful: "Playful",
} as const;

/**
 * The cover's palette and shapes are seeded by the title. Before there is one, the seed is the book's id, not
 * the topic: seeding by the topic redrew the shapes on every keystroke on Describe.
 */
export function bookDesign(book: Pick<Book, "title" | "mood" | "cover"> & { id?: string }) {
  const photo = coverPhoto(book.cover);
  return getCoverDesign({
    title: book.title || book.id || "",
    mood: book.mood,
    direction: book.cover.direction,
    variant: book.cover.variant,
    photo: photo && { src: photo.src, layout: photo.layout },
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
    <aside
      aria-label="Your book"
      className="flex items-center gap-4 rounded-lg border border-default bg-surface p-3 lg:sticky lg:top-8 lg:flex-col lg:items-stretch lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
    >
      <p className="hidden text-xs font-medium tracking-wider text-secondary uppercase lg:block">Your book</p>
      <Cover
        design={bookDesign(book)}
        title={title}
        subtitle={book.subtitle}
        author={book.author}
        size="none"
        className="w-20 shrink-0 lg:w-56"
      />
      <div className="flex min-w-0 flex-col gap-1 text-sm">
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
