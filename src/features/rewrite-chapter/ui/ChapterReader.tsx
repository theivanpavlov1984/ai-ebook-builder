"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { useBooks, type Chapter } from "@/entities/book";
import { Button, focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { changedParagraphs } from "../model/diff";

/**
 * The chapter text in the reading view. Three states:
 * reading, rewriting (text dimmed), and a suggested rewrite to keep or discard.
 */
export function ChapterReader({ bookId, chapter }: { bookId: string; chapter: Chapter }) {
  const rewriting = useBooks((s) => Boolean(s.rewriting[chapter.id]));
  const acceptRewrite = useBooks((s) => s.acceptRewrite);
  const discardRewrite = useBooks((s) => s.discardRewrite);
  const [showOriginal, setShowOriginal] = useState(false);

  const draft = chapter.draft;
  if (!draft) {
    return (
      <div aria-busy={rewriting || undefined} className="mt-6">
        <p
          role="status"
          className={cn("mb-4 items-center gap-2 text-sm text-secondary", rewriting ? "flex" : "sr-only")}
        >
          {rewriting && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {rewriting ? "Rewriting this chapter…" : ""}
        </p>
        <Paragraphs body={chapter.body} className={cn("transition-opacity duration-200", rewriting && "opacity-40")} />
      </div>
    );
  }

  const changed = changedParagraphs(chapter.body, draft);
  const count = changed.filter(Boolean).length;
  const showing = showOriginal ? chapter.body : draft;

  return (
    <div className="mt-6">
      <section
        aria-label="Suggested rewrite"
        className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default bg-surface px-4 py-3 shadow-sm"
      >
        <div role="status">
          <p className="text-sm font-semibold">Suggested rewrite</p>
          <p className="text-sm text-secondary">
            {count === draft.length
              ? "Every paragraph is new"
              : `${count} of ${draft.length} paragraphs changed – highlighted below`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Compare" className="flex rounded-md border border-default p-0.5 text-sm">
            {[
              { label: "Original", on: showOriginal },
              { label: "Suggestion", on: !showOriginal },
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                aria-pressed={t.on}
                onClick={() => setShowOriginal(t.label === "Original")}
                className={cn(
                  "rounded px-2.5 py-1 transition-colors duration-150",
                  t.on ? "bg-subtle font-medium text-primary" : "text-secondary hover:text-primary",
                  focusRing,
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<X aria-hidden className="size-3.5" />}
            onClick={() => discardRewrite(bookId, chapter.id)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            icon={<Check aria-hidden className="size-3.5" />}
            onClick={() => {
              acceptRewrite(bookId, chapter.id);
              setShowOriginal(false);
            }}
          >
            Keep
          </Button>
        </div>
      </section>
      <Paragraphs body={showing} highlight={showOriginal ? undefined : changed} />
    </div>
  );
}

function Paragraphs({ body, highlight, className }: { body: string[]; highlight?: boolean[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 font-display text-reader", className)}>
      {body.map((p, i) =>
        highlight?.[i] ? (
          <p
            key={i}
            className="-mx-3 rounded-md border-l-2 border-accent bg-accent-subtle px-3 py-1 whitespace-pre-line"
          >
            <span className="sr-only">Changed: </span>
            {p}
          </p>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ),
      )}
    </div>
  );
}
