import { ChevronDown } from "lucide-react";
import { chapterBlocks, ctaText, estimate, type Book, type Mood } from "@/entities/book";
import { focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";

const voice: Record<Mood, string> = {
  practical: "Practical",
  inspiring: "Inspiring",
  calm: "Calm",
  bold: "Bold",
  playful: "Playful",
};

/**
 * What Primer built the book from, in one place: who it's for, the voice, the shape and where it ends.
 * Everything here is what the author chose or Primer derived from it – so the result is explainable
 * ("why does it sound like this?") and each item says where to change it.
 */
export function BookPlan({ book }: { book: Book }) {
  const { pages, minutes } = estimate(book);
  const withActions = book.chapters.filter((c) => chapterBlocks(c.body).some((b) => b.kind === "action")).length;
  const cta = ctaText(book);
  const items = [
    {
      label: "Written for",
      value: book.audience.trim() || "Anyone new to the topic",
      note: book.audience.trim() ? "Every chapter speaks to them." : "No audience was given in the first step.",
    },
    {
      label: "Voice",
      value: voice[book.mood],
      note: "Sets how each chapter opens and the cover's style.",
    },
    {
      label: "Shape",
      value: `${book.chapters.length} chapters · ~${pages} pages`,
      note:
        withActions === book.chapters.length
          ? `About ${minutes} minutes to read. Each chapter ends with “Try this today”.`
          : `About ${minutes} minutes to read.`,
    },
    {
      label: "Ends with",
      value: book.cta.trim() || "A thank-you note",
      note: cta.link ? `Links to ${cta.link.label}.` : "Add a call to action and a link under Last page.",
    },
  ];

  // Folded on Final: it answers "why does it sound like this?", which only some authors ask.
  return (
    <details className="group mt-8 rounded-lg border border-default bg-surface [&_summary::-webkit-details-marker]:hidden">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-5 py-4 text-sm font-semibold",
          focusRing,
        )}
      >
        How Primer planned your book
        <ChevronDown aria-hidden className="size-4 text-secondary transition-transform group-open:rotate-180" />
      </summary>
      <section aria-label="How Primer planned your book" className="px-5 pb-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.label} className="min-w-0">
              <dt className="text-xs font-medium tracking-wider text-secondary uppercase">{i.label}</dt>
              <dd className="mt-1 truncate text-md font-medium" title={i.value}>
                {i.value}
              </dd>
              <dd className="mt-0.5 text-sm text-secondary">{i.note}</dd>
            </div>
          ))}
        </dl>
      </section>
    </details>
  );
}
