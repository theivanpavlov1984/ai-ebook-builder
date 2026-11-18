"use client";

import { Check, LoaderCircle, MailPlus } from "lucide-react";
import { bookDesign, Cover, type Book } from "@/entities/book";
import { focusRing } from "@/shared/ui";
import { cn, useDemo } from "@/shared/lib";
import { readerFrame } from "../model/readerDemo";

/**
 * The page the share link opens, in a browser frame, with a reader signing up on a loop – so the author sees
 * what the book is for before sharing it: an email form, then a subscriber. The whole frame opens the real page.
 * Off screen or with reduced motion it rests on the empty form.
 */
export function ReaderPagePreview({ book, link }: { book: Book; link: string }) {
  const { ref, t } = useDemo<HTMLDivElement>();
  const frame = readerFrame(t);
  const unlocked = frame.phase === "unlocked";
  const title = book.title || book.topic;
  const pitch = book.subtitle || book.chapters[0]?.summary || "";
  const host = safeHost(link);

  return (
    <section aria-labelledby="reader-page" className="mt-8">
      <h2 id="reader-page" className="font-brand text-xl font-bold tracking-tight">
        The page your readers see
      </h2>
      <p className="mt-1 max-w-[560px] text-sm text-secondary">
        Your share link opens this page. A reader leaves an email and gets the book – and you get a subscriber.
      </p>

      <div ref={ref} className="relative mt-5 pb-6">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          aria-label="Open the page your readers see (opens in a new tab)"
          className={cn(
            "group block overflow-hidden rounded-lg border border-default bg-canvas shadow-md transition-shadow hover:shadow-book",
            focusRing,
          )}
        >
          <div aria-hidden className="flex items-center gap-3 border-b border-default bg-subtle px-3 py-2">
            <span className="flex gap-1.5">
              <span className="size-2 rounded-full bg-strong" />
              <span className="size-2 rounded-full bg-strong" />
              <span className="size-2 rounded-full bg-strong" />
            </span>
            <span className="min-w-0 flex-1 truncate rounded-full bg-surface px-3 py-0.5 text-xs text-secondary">
              {host}/b · {title}
            </span>
          </div>

          <div aria-hidden className="grid grid-cols-[96px_minmax(0,1fr)] gap-5 p-5 sm:grid-cols-[120px_minmax(0,1fr)]">
            <Cover
              design={bookDesign(book)}
              title={title}
              subtitle={book.subtitle}
              author={book.author}
              size="none"
              className="w-full"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wider text-accent-strong uppercase">Free eBook</p>
              <p className="mt-1 font-display text-lg leading-snug font-medium">{title}</p>
              {pitch && <p className="mt-1 line-clamp-2 text-xs text-secondary">{pitch}</p>}
              {book.author.trim() && <p className="mt-1 text-xs text-secondary">by {book.author.trim()}</p>}

              {unlocked ? (
                <p className="mt-4 flex animate-[fade-in_300ms_var(--primer-ease)] items-center gap-2 rounded-md border border-default bg-surface px-3 py-2 text-xs font-medium">
                  <Check className="size-3.5 shrink-0 text-success" /> It’s yours – start reading below.
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <span className="flex h-8 min-w-0 items-center truncate rounded-md border border-input bg-surface px-2.5 text-xs sm:flex-1">
                    {frame.email ? (
                      <>
                        {frame.email}
                        {frame.phase === "typing" && <span className="ml-px h-3.5 w-px animate-pulse bg-primary" />}
                      </>
                    ) : (
                      <span className="text-placeholder">you@example.com</span>
                    )}
                  </span>
                  <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-inverse px-3 text-xs font-medium text-on-inverse">
                    {frame.phase === "sending" && <LoaderCircle className="size-3 animate-spin" />}
                    Get the eBook
                  </span>
                </div>
              )}
            </div>
          </div>
        </a>

        {/* What the author's inbox gets – outside the page, because the reader never sees it. */}
        {unlocked && (
          <div
            aria-hidden
            key={frame.reader}
            className="absolute right-4 bottom-0 flex w-[260px] max-w-[calc(100%-32px)] animate-[fade-in_400ms_var(--primer-ease)] items-start gap-2.5 rounded-md border border-default bg-surface p-2.5 shadow-md"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent-strong">
              <MailPlus className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 text-xs">
              <span className="flex justify-between gap-2">
                <span className="font-semibold">New subscriber</span>
                <span className="text-secondary">just now</span>
              </span>
              <span className="block truncate text-secondary">
                {frame.email} got “{title}”
              </span>
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-secondary">Example sign-up. In this prototype no email is sent or stored.</p>
    </section>
  );
}

function safeHost(link: string): string {
  try {
    return new URL(link).host;
  } catch {
    return "primer";
  }
}
