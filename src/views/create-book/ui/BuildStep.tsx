"use client";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { bookDesign, Cover, forwardStage, isDemoTopic, useBook, useBooks } from "@/entities/book";
import { CreationLayout, NotFound } from "@/widgets/layout";
import { ProgressList, Button, focusRing, StepHeader } from "@/shared/ui";
import { failuresFromUrl, setFailures } from "@/shared/api";
import { cn } from "@/shared/lib";
import { defaultTiming, useGeneration, type Timing } from "../model/useGeneration";

export type { Timing };

export function buildTabTitle(finished: number, total: number, done: boolean): string {
  if (done) return "✓ Your book is ready · Primer";
  if (total > 0 && finished >= total) return "Designing the cover · Primer";
  return `Writing ${Math.min(finished + 1, Math.max(total, 1))} of ${total} · Primer`;
}

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
  // Progress in the tab title, so a user who switches tabs knows when to come back.
  // The browser shows the first <title> in <head>. Next.js renders the page title from metadata,
  // so we put our own element in front of it and remove it on leaving – Next's element is never touched.
  const tabTitle = buildTabTitle(finished.length, book.chapters.length, done);
  const titleEl = useRef<HTMLTitleElement | null>(null);
  useEffect(() => {
    const el = document.createElement("title");
    const keepFirst = () => {
      if (document.head.querySelector("title") !== el) document.head.prepend(el);
    };
    keepFirst();
    // React may re-insert the metadata <title> at the top of <head> after navigation; stay in front of it.
    const observer = new MutationObserver(keepFirst);
    observer.observe(document.head, { childList: true });
    titleEl.current = el;
    return () => {
      observer.disconnect();
      el.remove();
      titleEl.current = null;
    };
  }, []);
  useEffect(() => {
    if (titleEl.current) titleEl.current.textContent = tabTitle;
  }, [tabTitle]);

  const shownId = viewing ?? streaming?.id ?? finished.at(-1)?.id;
  const shown = book.chapters.find((c) => c.id === shownId);
  const shownIndex = book.chapters.findIndex((c) => c.id === shownId);
  const isStreaming = streaming && streaming.id === shownId && !viewing;
  const paragraphs = isStreaming ? streaming.text.split("\n\n") : (shown?.body ?? []);

  const aside = (
    <aside aria-label="Progress" className="sticky top-8 flex flex-col gap-6">
      <Cover
        design={bookDesign(book)}
        title={book.title}
        subtitle={book.subtitle}
        author={book.author}
        size="md"
        className={cn(
          "transition-[opacity,filter] duration-500",
          book.cover.status === "done" ? "opacity-100" : "opacity-40 grayscale",
        )}
      />
      <ProgressList items={items} onRetry={retry} />
    </aside>
  );

  return (
    <CreationLayout book={book} stage="build" aside={aside}>
      <StepHeader
        title={done ? "Your book is ready" : "Writing your book"}
        intro={
          resumed && !done
            ? "Picking up where you left off – finished chapters are kept."
            : "You can start reading as soon as the first chapter appears."
        }
      />

      {!isDemoTopic(book.topic) && (
        <p className="-mt-4 mb-6 flex items-start gap-2 text-sm text-secondary">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            Prototype note: the AI is simulated, so chapters for your own topic follow a template. For a fully written
            sample, start a book about “Design systems for small teams”.
          </span>
        </p>
      )}

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
                  c.id === shownId
                    ? "border-inverse bg-inverse text-on-inverse"
                    : "border-default bg-surface text-secondary hover:text-primary",
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
                  {isStreaming && i === paragraphs.length - 1 && (
                    <span aria-hidden className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-accent align-middle" />
                  )}
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
