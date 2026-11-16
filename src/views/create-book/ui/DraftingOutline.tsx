"use client";

import { useEffect, useState } from "react";
import type { Book } from "@/entities/book";
import { ProgressList, type ProgressItem } from "@/shared/ui";

/** How long each stage shows before the next one starts – three of them fill the outline's ~900 ms. */
export const STAGE_MS = 300;

/**
 * While the outline is drafted: the author's own request, echoed back, then the stages of the work ticking off. It answers
 * "what is happening?" with their own words instead of grey bars. Mounted only while drafting, so every draft
 * starts from the first stage.
 */
export function DraftingOutline({ book }: { book: Pick<Book, "topic" | "audience"> }) {
  const [stage, setStage] = useState(0);
  const audience = book.audience.trim();

  useEffect(() => {
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, 2)), STAGE_MS);
    return () => clearInterval(timer);
  }, []);

  const labels = [
    "Reading your topic",
    audience ? `Choosing chapters for ${midSentence(audience)}` : "Choosing the chapters",
    "Putting them in order",
  ];
  const items: ProgressItem[] = labels.map((label, i) => ({
    id: String(i),
    label,
    status: i < stage ? "done" : i === stage ? "working" : "waiting",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-default bg-subtle p-4">
        <p className="text-xs font-semibold tracking-[0.08em] text-secondary uppercase">You asked for</p>
        <p className="mt-1 text-base">“{book.topic.trim()}”</p>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-base font-medium">Drafting your outline…</p>
        <ProgressList items={items} />
      </div>
    </div>
  );
}

/** "Founders of startups" reads mid-sentence as "founders of startups"; "UX writers" keeps its acronym. */
function midSentence(text: string): string {
  return /^[A-Z][A-Z]/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
}
