"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { bookDesign, Cover, forwardStage, estimate, useBooks, useBook } from "@/entities/book";
import { AppShell, NotFound } from "@/widgets/layout";
import { Button, focusRing, Stepper } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { ChapterPanel, ChapterReader } from "@/features/rewrite-chapter";
import { CoverPanel } from "@/features/change-cover";

export function Studio({ id, rewriteMs = 1200 }: { id: string; rewriteMs?: number }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <StudioView id={id} rewriteMs={rewriteMs} />;
}

function StudioView({ id, rewriteMs }: { id: string; rewriteMs: number }) {
  const router = useRouter();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const [selected, setSelected] = useState<string>(book.chapters[0]?.id ?? "cover");

  const chapter = book.chapters.find((c) => c.id === selected);
  const chapterIndex = book.chapters.findIndex((c) => c.id === selected);
  const { pages, minutes } = estimate(book);
  const title = book.title || book.topic;

  const navItem = (active: boolean) =>
    cn(
      "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150",
      active ? "bg-surface font-semibold text-primary shadow-sm" : "text-secondary hover:bg-surface hover:text-primary",
      focusRing,
    );

  return (
    <AppShell active="new">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-6 border-b border-default px-8 py-4">
          <Stepper steps={["Describe", "Title", "Outline", "Build", "Review"]} current={4} />
          <div className="flex items-center gap-4">
            <p className="text-sm text-secondary">
              ~{pages} pages · {minutes}-minute read
            </p>
            <Button
              icon={<ArrowRight aria-hidden className="size-4" />}
              className="flex-row-reverse"
              onClick={() => {
                updateBook(id, { stage: forwardStage(book, "final") });
                router.push(`/book/${id}/final`);
              }}
            >
              Finalize
            </Button>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-[260px_minmax(0,1fr)_320px]">
          <nav aria-label="Book structure" className="flex flex-col gap-1 border-r border-default bg-subtle p-4">
            <button
              type="button"
              aria-label="Cover"
              onClick={() => setSelected("cover")}
              className={navItem(selected === "cover")}
            >
              <Cover design={bookDesign(book)} title={title} size="none" className="w-8 shadow-sm" />
              <span className="pt-1">Cover</span>
            </button>
            <p className="mt-4 mb-1 px-3 text-xs font-medium tracking-wider text-secondary uppercase">Chapters</p>
            {book.chapters.map((c, i) => (
              <button key={c.id} type="button" onClick={() => setSelected(c.id)} className={navItem(c.id === selected)}>
                <span className="w-4 shrink-0 text-secondary">{i + 1}</span>
                <span className="flex-1">{c.title}</span>
                {c.draft ? (
                  <span className="text-xs font-normal text-accent-strong">to review</span>
                ) : (
                  c.versions.length > 0 && <span className="text-xs font-normal text-accent-strong">edited</span>
                )}
              </button>
            ))}
          </nav>

          <main className="min-w-0 overflow-y-auto px-12 py-10">
            {chapter ? (
              <article className="mx-auto max-w-[640px]">
                <p className="text-xs font-medium tracking-wider text-secondary uppercase">
                  Chapter {chapterIndex + 1}
                </p>
                <h2 className="mt-1 font-display text-2xl font-medium">{chapter.title}</h2>
                <ChapterReader key={chapter.id} bookId={id} chapter={chapter} />
              </article>
            ) : (
              <div className="flex justify-center pt-6">
                <Cover
                  design={bookDesign(book)}
                  title={title}
                  subtitle={book.subtitle}
                  author={book.author}
                  size="none"
                  className="w-72"
                />
              </div>
            )}
          </main>

          <section aria-label="Adjust" className="border-l border-default bg-surface p-6">
            {chapter ? (
              <ChapterPanel key={chapter.id} book={book} chapter={chapter} rewriteMs={rewriteMs} />
            ) : (
              <CoverPanel book={book} />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
