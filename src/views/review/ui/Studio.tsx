"use client";

import { ArrowRight, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { bookDesign, Cover, coverPhoto, forwardStage, estimate, useBooks, useBook } from "@/entities/book";
import { AppShell, NotFound } from "@/widgets/layout";
import { Button, Dialog, focusRing, Stepper } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { ChapterPanel, ChapterReader } from "@/features/rewrite-chapter";
import { ChapterEditor } from "@/features/edit-chapter";
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
  // The chapter being edited by hand, if any. Choosing another chapter closes the editor.
  const [editing, setEditing] = useState<string>();
  // Unsaved hand edits: leaving the chapter asks first instead of dropping them.
  const [dirty, setDirty] = useState(false);
  const [leaving, setLeaving] = useState<string>();
  const rewriting = useBooks((s) => Boolean(s.rewriting[selected]));

  const chapter = book.chapters.find((c) => c.id === selected);
  const chapterIndex = book.chapters.findIndex((c) => c.id === selected);
  const { pages, minutes } = estimate(book);

  function finalize() {
    updateBook(id, { stage: forwardStage(book, "final") });
    router.push(`/book/${id}/final`);
  }

  /** Go to a chapter, the cover ("cover") or the final step ("final"), closing the editor on the way. */
  function leaveTo(target: string) {
    setLeaving(undefined);
    setEditing(undefined);
    setDirty(false);
    if (target === "final") finalize();
    else setSelected(target);
  }

  function go(target: string) {
    if (target === selected && target !== "final") return;
    if (editing && dirty) setLeaving(target);
    else leaveTo(target);
  }

  const title = book.title || book.topic;

  const navItem = (active: boolean) =>
    cn(
      "flex w-48 shrink-0 items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150 sm:w-56 xl:w-full",
      active ? "bg-surface font-semibold text-primary shadow-sm" : "text-secondary hover:bg-surface hover:text-primary",
      focusRing,
    );

  return (
    <AppShell active="new">
      <div className="flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-default px-5 py-4 lg:px-8">
          <Stepper steps={["Describe", "Title", "Outline", "Build", "Review"]} current={4} />
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-secondary sm:block">
              ~{pages} pages · {minutes}-minute read
            </p>
            <Button
              icon={<ArrowRight aria-hidden className="size-4" />}
              className="flex-row-reverse"
              onClick={() => go("final")}
            >
              Finalize
            </Button>
          </div>
        </header>

        {/* Three columns from xl (1280 px). Below that the structure becomes a scrolling row on top; the adjust
            panel stays beside the chapter from lg and drops under it on phones. */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <nav
            aria-label="Book structure"
            className="flex gap-1 overflow-x-auto border-b border-default bg-subtle p-2 lg:col-span-2 xl:col-span-1 xl:flex-col xl:overflow-visible xl:border-r xl:border-b-0 xl:p-4"
          >
            <button
              type="button"
              aria-label="Cover"
              aria-current={selected === "cover" ? "true" : undefined}
              onClick={() => go("cover")}
              className={navItem(selected === "cover")}
            >
              <Cover design={bookDesign(book)} title={title} size="none" className="w-8 shadow-sm" />
              <span className="pt-1">Cover</span>
            </button>
            <p className="mt-4 mb-1 hidden px-3 text-xs font-medium tracking-wider text-secondary uppercase xl:block">
              Chapters
            </p>
            {book.chapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-current={c.id === selected ? "true" : undefined}
                onClick={() => go(c.id)}
                className={navItem(c.id === selected)}
              >
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

          <section aria-label="Reading view" className="min-w-0 overflow-y-auto px-5 py-6 sm:px-8 lg:py-10 xl:px-12">
            {chapter ? (
              <article className="mx-auto max-w-[640px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-wider text-secondary uppercase">
                      Chapter {chapterIndex + 1}
                    </p>
                    {editing !== chapter.id && (
                      <h2 className="mt-1 font-display text-xl font-medium sm:text-2xl">{chapter.title}</h2>
                    )}
                  </div>
                  {/* A suggested rewrite has to be kept or discarded first, so its comparison stays honest. */}
                  {editing !== chapter.id && !chapter.draft && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-1 shrink-0"
                      disabled={rewriting}
                      icon={<PenLine aria-hidden className="size-3.5" />}
                      onClick={() => setEditing(chapter.id)}
                    >
                      Edit text
                    </Button>
                  )}
                </div>
                {editing === chapter.id ? (
                  <ChapterEditor
                    key={chapter.id}
                    bookId={id}
                    chapter={chapter}
                    onDone={() => setEditing(undefined)}
                    onDirtyChange={setDirty}
                  />
                ) : (
                  <ChapterReader key={chapter.id} bookId={id} chapter={chapter} />
                )}
              </article>
            ) : (
              <div className="flex flex-col items-center gap-4 pt-6">
                <Cover
                  design={bookDesign(book)}
                  title={title}
                  subtitle={book.subtitle}
                  author={book.author}
                  size="none"
                  className="w-56 sm:w-72"
                />
                {coverPhoto(book.cover)?.credit && (
                  <p className="text-xs text-secondary">{coverPhoto(book.cover)?.credit}</p>
                )}
              </div>
            )}
          </section>

          <section
            aria-label="Adjust"
            className="border-t border-default bg-surface p-5 lg:border-t-0 lg:border-l lg:p-6"
          >
            {chapter ? (
              <ChapterPanel key={chapter.id} book={book} chapter={chapter} rewriteMs={rewriteMs} />
            ) : (
              <CoverPanel book={book} />
            )}
          </section>
        </div>
      </div>

      <Dialog
        open={leaving !== undefined}
        onOpenChange={(open) => !open && setLeaving(undefined)}
        title="Discard your changes?"
        description={`Your edits to “${chapter?.title ?? "this chapter"}” aren’t saved yet.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaving(undefined)}>
              Keep editing
            </Button>
            <Button onClick={() => leaving && leaveTo(leaving)}>Discard changes</Button>
          </>
        }
      />
    </AppShell>
  );
}
