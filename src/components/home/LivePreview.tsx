"use client";

import { Shuffle } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Cover } from "@/components/book/Cover";
import { getCoverDesign, type ArtDirection } from "@/components/book/cover-design";
import { focusRing } from "@/components/ui/Button";
import { draftOutline, titleCase } from "@/lib/ai/generate";
import { cn } from "@/lib/cn";

const EXAMPLE = "Design systems for small teams";
const directions: ArtDirection[] = ["editorial", "organic", "typographic", "geometric"];

/** The visitor's book, drawn live from what they type – before they've clicked anything. */
export function LivePreview({ topic }: { topic: string }) {
  const deferred = useDeferredValue(topic.trim());
  const isExample = deferred.length < 3;
  const source = isExample ? EXAMPLE : deferred;
  const [styleIndex, setStyleIndex] = useState(0);
  const direction = directions[styleIndex % directions.length];

  const title = titleCase(source.replace(/[.!?]+$/, ""));
  const design = getCoverDesign({ title, mood: "practical", direction });
  const chapters = useMemo(() => draftOutline({ topic: source, audience: "", mood: "practical" }).slice(0, 3), [source]);

  return (
    <section aria-label="Preview of your book" className="relative w-[420px]">
      <p className="mb-4 text-sm text-secondary" aria-live="polite">
        {isExample ? "Example – start typing and this becomes your book" : "Your book, as you type"}
      </p>

      <div className="relative h-[420px]">
        <div key={direction} className="absolute top-0 left-0 animate-[fade-in_400ms_var(--primer-ease)]">
          <Cover design={design} title={title} author="You" size="none" className="w-[260px] -rotate-2" />
        </div>

        <div className="absolute top-2 right-0 w-[210px] rotate-2 rounded-sm bg-surface p-5 shadow-md">
          <p className="font-display text-sm text-secondary italic">Contents</p>
          <ol className="mt-3 flex flex-col gap-2.5">
            {chapters.map((c, i) => (
              <li key={c.title} className="flex gap-2 font-display text-sm leading-snug">
                <span className="text-accent-strong">{i + 1}</span>
                <span>{c.title}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-secondary">and 3 more chapters</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStyleIndex(styleIndex + 1)}
        className={cn("mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-secondary hover:text-primary", focusRing)}
      >
        <Shuffle aria-hidden className="size-4" /> Try another style
      </button>
    </section>
  );
}
