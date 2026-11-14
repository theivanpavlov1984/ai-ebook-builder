"use client";

import { useDeferredValue } from "react";
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
export function LivePreview({ topic, mood = "practical" }: { topic: string; mood?: Mood }) {
  const deferred = useDeferredValue(topic.trim());
  const isExample = deferred.length < 3;
  const title = titleCase((isExample ? EXAMPLE : deferred).replace(/[.!?]+$/, ""));
  const design = getCoverDesign({ title, mood, direction: directionsForMood(mood)[0] });

  const shelf = (from: number, to: number) => (
    <div aria-hidden className="flex items-end gap-6">
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
        {/* Fades in on a new tone only – re-animating on every keystroke made the cover flicker. */}
        <div key={mood} className="animate-[fade-in_400ms_var(--primer-ease)]">
          <Cover design={design} title={title} author="You" size="none" className="w-[150px] -translate-y-2" />
        </div>
        {shelf(2, 4)}
      </div>
      <p className="text-sm text-secondary" aria-live="polite">
        {isExample ? "Example – type above and this becomes your book" : "Your book, as you type"}
      </p>
    </section>
  );
}
