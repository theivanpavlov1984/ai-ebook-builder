"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { bookDesign } from "@/components/book/BookPanel";
import { Cover } from "@/components/book/Cover";
import { CreationLayout } from "@/components/book/CreationLayout";
import { ProgressList } from "@/components/book/ProgressList";
import { Button, focusRing } from "@/components/ui/Button";
import { failuresFromUrl, setFailures } from "@/lib/ai/simulate";
import { useBooks } from "@/lib/book/store";
import { useBook } from "@/lib/book/useHydrated";
import { cn } from "@/lib/cn";
import { forwardStage, NotFound, StepHeader } from "./shared";
import { defaultTiming, useGeneration, type Timing } from "./useGeneration";

export type { Timing };

export function BuildStep({ id, timing = defaultTiming }: { id: string; timing?: Timing }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <Builder id={id} timing={timing} />;
}

function Builder({ id, timing }: { id: string; timing: Timing }) {
  const router = useRouter();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const { items, streaming, resumed, done, progressText, retry } = useGeneration(id, timing);
  const [viewing, setViewing] = useState<string>();

  useEffect(() => {
    const fromUrl = failuresFromUrl(window.location.search);
    if (fromUrl.length) setFailures(fromUrl);
  }, []);

  const finished = book.chapters.filter((c) => c.status === "done");
  const shownId = viewing ?? streaming?.id ?? finished.at(-1)?.id;
  const shown = book.chapters.find((c) => c.id === shownId);
  const shownIndex = book.chapters.findIndex((c) => c.id === shownId);
  const isStreaming = streaming && streaming.id === shownId && !viewing;
  const paragraphs = isStreaming ? streaming.text.split("\n\n") : shown?.body ?? [];

  const aside = (
    <aside aria-label="Progress" className="sticky top-8 flex flex-col gap-6">
      <Cover
        design={bookDesign(book)}
        title={book.title}
        subtitle={book.subtitle}
        author={book.author}
        size="md"
        className={cn("transition-[opacity,filter] duration-500", book.cover.status === "done" ? "opacity-100" : "opacity-40 grayscale")}
      />
      <ProgressList items={items} onRetry={retry} />
    </aside>
  );

  return (
    <CreationLayout book={book} stage="build" aside={aside}>
      <StepHeader
        title={done ? "Your book is ready" : "Writing your book"}
        intro={resumed && !done ? "Picking up where you left off – finished chapters are kept." : "You can start reading as soon as the first chapter appears."}
      />

      <div className="mb-6 flex min-h-10 items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm font-medium text-secondary">
          {progressText}
        </p>
        {done && (
          <Button
            onClick={() => {
              updateBook(id, { stage: forwardStage(book, "review") });
              router.push(`/book/${id}/review`);
            }}
          >
            Review your book
          </Button>
        )}
      </div>

      {finished.length > 0 && (
        <nav aria-label="Finished chapters" className="mb-6 flex flex-wrap gap-2">
          {book.chapters.map((c, i) =>
            c.status === "done" ? (
              <button
                key={c.id}
                type="button"
                aria-current={c.id === shownId ? "true" : undefined}
                onClick={() => setViewing(c.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  c.id === shownId ? "border-inverse bg-inverse text-on-inverse" : "border-default bg-surface text-secondary hover:text-primary",
                  focusRing,
                )}
              >
                Chapter {i + 1}
              </button>
            ) : null,
          )}
        </nav>
      )}

      <article className="min-h-[360px] rounded-lg border border-default bg-surface px-10 py-8">
        {shown ? (
          <>
            <p className="text-xs font-medium tracking-wider text-secondary uppercase">Chapter {shownIndex + 1}</p>
            <h2 className="mt-1 font-display text-xl font-medium">{shown.title}</h2>
            <div className="mt-5 flex flex-col gap-4 font-display text-reader">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                  {isStreaming && i === paragraphs.length - 1 && <span aria-hidden className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-accent align-middle" />}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 text-center">
            <p className="font-display text-xl font-medium">Your first chapter is on its way</p>
            <p className="text-base text-secondary">It will appear here as it&rsquo;s written.</p>
          </div>
        )}
      </article>
    </CreationLayout>
  );
}
