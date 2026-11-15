import { chapterBlocks, ctaText, estimate, type Book, type Mood } from "@/entities/book";

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

  return (
    <section aria-label="How Primer planned your book" className="mt-6 rounded-lg border border-default bg-surface p-5">
      <p className="text-sm font-semibold">How Primer planned your book</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
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
  );
}
