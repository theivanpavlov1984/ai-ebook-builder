"use client";

import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreationLayout } from "@/components/book/CreationLayout";
import { Button, focusRing } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { alternativeChapter, draftOutline } from "@/lib/ai/generate";
import { simulate } from "@/lib/ai/simulate";
import { estimate } from "@/lib/book/estimate";
import { useBooks } from "@/lib/book/store";
import type { Chapter } from "@/lib/book/types";
import { useBook } from "@/lib/book/useHydrated";
import { cn } from "@/lib/cn";
import { forwardStage, newChapterId, NotFound, StepHeader } from "./shared";

const MIN_CHAPTERS = 3;
const MAX_PAGES = 20;

export function OutlineStep({ id }: { id: string }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <OutlineEditor id={id} />;
}

const toChapter = (c: { title: string; summary: string }): Chapter => ({
  id: newChapterId(),
  title: c.title,
  summary: c.summary,
  body: [],
  status: "idle",
  versions: [],
});

function OutlineEditor({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const undo = useBooks((s) => s.undo);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(book.chapters.length ? "ready" : "loading");
  const [rounds, setRounds] = useState<Record<string, number>>({});
  const started = useRef(false);

  const draft = useCallback(async () => {
    setStatus("loading");
    try {
      const b = useBooks.getState().books[id];
      const outline = await simulate("outline", () => draftOutline(b), { ms: 900 });
      updateBook(id, { chapters: outline.map(toChapter) });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [id, updateBook]);

  useEffect(() => {
    if (started.current || book.chapters.length) return;
    started.current = true;
    void draft();
  }, [book.chapters.length, draft]);

  const chapters = book.chapters;
  const setChapters = (next: Chapter[], snapshot = false) => updateBook(id, { chapters: next }, { snapshot });

  function move(i: number, delta: number) {
    const next = [...chapters];
    const [c] = next.splice(i, 1);
    next.splice(i + delta, 0, c);
    setChapters(next);
  }

  function remove(i: number) {
    setChapters(chapters.filter((_, j) => j !== i), true);
    show({ tone: "info", message: `“${chapters[i].title}” removed`, action: { label: "Undo", onClick: () => undo(id) } });
  }

  function suggest(i: number) {
    const c = chapters[i];
    const round = (rounds[c.id] ?? 0) + 1;
    setRounds({ ...rounds, [c.id]: round });
    const alt = alternativeChapter(book, i, round);
    setChapters(chapters.map((x, j) => (j === i ? { ...x, ...alt } : x)), true);
  }

  function add() {
    setChapters([...chapters, toChapter(alternativeChapter(book, chapters.length, 1))]);
  }

  function writeBook() {
    updateBook(id, {
      stage: forwardStage(book, "build"),
      chapters: chapters.map((c) => (c.status === "done" ? c : { ...c, status: "idle" })),
    });
    router.push(`/book/${id}/build`);
  }

  const { pages, minutes } = estimate({ chapters });
  const tooLong = pages > MAX_PAGES;
  const atMinimum = chapters.length <= MIN_CHAPTERS;

  return (
    <CreationLayout book={book} stage="outline">
      <StepHeader
        title="Your outline"
        intro="This is the cheapest moment to steer the book. Rename, reorder or swap chapters – or just continue."
        back={{ href: `/book/${id}/title`, label: "Back to title" }}
      />

      {status === "loading" && (
        <div aria-live="polite" className="flex flex-col gap-3">
          <p className="text-base text-secondary">Drafting your outline…</p>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-subtle" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-md border border-danger bg-danger-subtle p-4">
          <p className="text-base text-primary">We couldn’t draft the outline this time. Your answers are saved.</p>
          <Button variant="secondary" size="sm" onClick={() => void draft()}>
            Try again
          </Button>
        </div>
      )}

      {status === "ready" && (
        <div className="flex flex-col gap-6">
          <ol className="flex flex-col gap-2">
            {chapters.map((c, i) => (
              <li key={c.id} className="flex items-start gap-3 rounded-md border border-default bg-surface p-3">
                <span className="mt-2 w-6 shrink-0 text-center font-display text-lg text-secondary">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <input
                    aria-label={`Chapter ${i + 1} title`}
                    value={c.title}
                    onChange={(e) => setChapters(chapters.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)))}
                    className={cn("w-full rounded-sm bg-transparent px-1 py-1 font-display text-lg font-medium", focusRing)}
                  />
                  <p className="px-1 text-sm text-secondary">{c.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton label={`Move chapter ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton label={`Move chapter ${i + 1} down`} disabled={i === chapters.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton label={`Suggest another idea for chapter ${i + 1}`} onClick={() => suggest(i)}>
                    <Sparkles aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton label={`Remove chapter ${i + 1}`} disabled={atMinimum} onClick={() => remove(i)}>
                    <Trash2 aria-hidden className="size-4" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" icon={<Plus aria-hidden className="size-4" />} onClick={add}>
              Add chapter
            </Button>
            <p className="text-sm text-secondary">
              {chapters.length} chapters · ~{pages} pages{minutes ? ` · ${minutes}-minute read` : ""} · ready in about a minute
            </p>
          </div>

          {atMinimum && <p className="text-sm text-secondary">A book needs at least 3 chapters.</p>}
          {tooLong && (
            <p className="rounded-md bg-warning-subtle p-3 text-sm text-primary">
              This is getting long. Lead magnets work best short – 10 to 20 pages. Consider removing a chapter.
            </p>
          )}

          <div>
            <Button onClick={writeBook}>Write my book</Button>
          </div>
        </div>
      )}
    </CreationLayout>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("rounded-sm p-1.5 text-secondary hover:bg-subtle hover:text-primary disabled:opacity-30", focusRing)}
    >
      {children}
    </button>
  );
}
