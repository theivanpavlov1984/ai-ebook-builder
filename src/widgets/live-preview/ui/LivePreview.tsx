"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  bookDesign,
  Cover,
  directionsForMood,
  getCoverDesign,
  sampleBooks,
  titleCase,
  type CoverDesign,
  type Mood,
} from "@/entities/book";
import { cn } from "@/shared/lib";

/** Not one of the example books, so the row never shows the same title twice. */
const EXAMPLE = "Morning routines for remote workers";

type Shelved = { key: string; design: CoverDesign; title: string; author: string };

/** The three real example books plus one more, so the visitor's book sits in the middle of four. */
const others: Shelved[] = [
  ...sampleBooks().map((b) => ({ key: b.id, design: bookDesign(b), title: b.title, author: b.author })),
  {
    key: "newsletter",
    design: getCoverDesign({ title: "The Two-Hour Newsletter", mood: "playful" }),
    title: "The Two-Hour Newsletter",
    author: "Ana Costa",
  },
];

/** Small tilts so the row reads as books on a table, not a grid of tiles. */
const tilt = ["-rotate-4 translate-y-3", "-rotate-[1.5deg]", "rotate-[1.5deg]", "rotate-4 translate-y-3"];

/**
 * A row of covers under the landing hero. The middle one is the visitor's book, drawn live from what they type
 * and in the style of the tone they picked; the others are example books.
 */
export function LivePreview({
  topic,
  mood = "practical",
  demo = false,
  designFrom,
}: {
  topic: string;
  mood?: Mood;
  /** The landing is playing example topics: name the book as given, and say the visitor can type their own. */
  demo?: boolean;
  /** The title the cover's colours come from – the whole example topic while the demo types it. */
  designFrom?: string;
}) {
  const deferred = useDeferredValue(topic.trim());
  const isExample = !demo && deferred.length < 3;
  const title = titleCase((isExample ? EXAMPLE : deferred).replace(/[.!?]+$/, ""));
  // The palette is picked from the title, so a new one per letter made the cover strobe. The letters update
  // live; the colours follow once typing pauses (or come from the whole example topic in the demo).
  const settled = useSettled(title, 600);
  const colourTitle = designFrom ? titleCase(designFrom) : settled;
  const design = getCoverDesign({ title: colourTitle, mood, direction: directionsForMood(mood)[0] });

  const shelf = (from: number, to: number) => (
    // The example books flank the visitor's cover on wide screens; a phone shows only the visitor's book.
    <div aria-hidden className="hidden items-end gap-6 lg:flex">
      {others.slice(from, to).map((o, i) => (
        <Cover
          key={o.key}
          design={o.design}
          title={o.title}
          author={o.author}
          size="none"
          className={cn("w-[128px] shrink-0", tilt[from + i])}
        />
      ))}
    </div>
  );

  return (
    <section aria-label="Preview of your book" className="flex flex-col items-center gap-4">
      <div className="flex items-end justify-center gap-6">
        {shelf(0, 2)}
        {/* Fades in when the look changes (a new tone or new colours), never on a single letter. */}
        <div key={`${mood}:${colourTitle}`} className="animate-[fade-in_400ms_var(--primer-ease)]">
          <Cover design={design} title={title} author="You" size="none" className="w-[150px] -translate-y-2" />
        </div>
        {shelf(2, 4)}
      </div>
      <p className="text-sm text-secondary" aria-live="polite">
        {demo
          ? "Example – type your own topic above"
          : isExample
            ? "Example – type above and this becomes your book"
            : "Your book, as you type"}
      </p>
    </section>
  );
}

/** `value` once it has stopped changing for `ms`. */
function useSettled<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return settled;
}
