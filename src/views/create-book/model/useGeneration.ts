"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { directionsForMood, writeChapter, useBooks, type ChapterStatus } from "@/entities/book";
import type { ProgressItem, StepStatus } from "@/shared/ui";
import { simulate, streamParagraphs } from "@/shared/api";

export type Timing = { chapterMs: number; coverMs: number; cps: number };
export const defaultTiming: Timing = { chapterMs: 1800, coverMs: 1500, cps: 1400 };

const toStep: Record<ChapterStatus, StepStatus> = {
  idle: "waiting",
  writing: "working",
  done: "done",
  failed: "failed",
};
const SECONDS_PER_CHAPTER = 6;

type Token = { cancelled: boolean };

/**
 * Runs the simulated generation for a book: chapters in order (streamed), then the cover.
 * State lives in the persisted store, so a reload resumes from the first unfinished chapter.
 */
export function useGeneration(bookId: string, timing: Timing = defaultTiming) {
  const book = useBooks((s) => s.books[bookId]);
  const updateChapter = useBooks((s) => s.updateChapter);
  const updateBook = useBooks((s) => s.updateBook);
  const [streaming, setStreaming] = useState<{ id: string; text: string } | null>(null);
  const [resumed] = useState(() => {
    const b = useBooks.getState().books[bookId];
    return !!b && b.chapters.some((c) => c.status === "done") && b.chapters.some((c) => c.status !== "done");
  });
  const token = useRef<Token>({ cancelled: false });

  const get = useCallback(() => useBooks.getState().books[bookId], [bookId]);

  const writeOne = useCallback(
    async (chapterId: string, t: Token) => {
      const b = get();
      const index = b.chapters.findIndex((c) => c.id === chapterId);
      if (index < 0) return;
      const chapter = b.chapters[index];
      updateChapter(bookId, chapterId, { status: "writing" });
      try {
        const body = await simulate(`ch${index + 1}`, () => writeChapter(b, chapter), { ms: timing.chapterMs });
        if (t.cancelled) return;
        await streamParagraphs(body, (text) => !t.cancelled && setStreaming({ id: chapterId, text }), {
          cps: timing.cps,
          signal: t,
        });
        if (t.cancelled) return;
        updateChapter(bookId, chapterId, { body, status: "done" });
      } catch {
        if (!t.cancelled) updateChapter(bookId, chapterId, { status: "failed" });
      } finally {
        if (!t.cancelled) setStreaming(null);
      }
    },
    [bookId, get, timing.chapterMs, timing.cps, updateChapter],
  );

  const makeCover = useCallback(
    async (t: Token) => {
      const b = get();
      updateBook(bookId, { cover: { ...b.cover, status: "working" } });
      try {
        await simulate("cover", () => null, { ms: timing.coverMs });
        if (!t.cancelled) updateBook(bookId, { cover: { ...get().cover, status: "done" } });
      } catch {
        if (t.cancelled) return;
        // Fall back to the mood's next art direction automatically.
        const options = directionsForMood(b.mood);
        const next = options[(options.indexOf(b.cover.direction) + 1) % options.length];
        updateBook(bookId, { cover: { ...get().cover, direction: next, variant: 0, status: "working" } });
        try {
          await simulate("cover", () => null, { ms: timing.coverMs });
          if (!t.cancelled) updateBook(bookId, { cover: { ...get().cover, status: "done" } });
        } catch {
          if (!t.cancelled) updateBook(bookId, { cover: { ...get().cover, status: "failed" } });
        }
      }
    },
    [bookId, get, timing.coverMs, updateBook],
  );

  useEffect(() => {
    const t: Token = { cancelled: false };
    token.current = t;
    (async () => {
      for (const c of get().chapters) {
        if (t.cancelled) return;
        if (c.status === "idle" || c.status === "writing") await writeOne(c.id, t);
      }
      if (!t.cancelled && get().cover.status !== "done") await makeCover(t);
    })();
    return () => {
      t.cancelled = true;
    };
  }, [get, makeCover, writeOne]);

  const retry = useCallback(
    (id: string) => {
      const t = token.current;
      if (id === "cover") void makeCover(t);
      else void writeOne(id, t);
    },
    [makeCover, writeOne],
  );

  const chapters = book?.chapters ?? [];
  const items: ProgressItem[] = [
    ...chapters.map((c, i) => ({ id: c.id, label: `${i + 1}. ${c.title}`, status: toStep[c.status] })),
    {
      id: "cover",
      label: "Cover",
      status: book
        ? book.cover.status === "idle"
          ? "waiting"
          : book.cover.status === "working"
            ? "working"
            : book.cover.status
        : "waiting",
    },
  ];

  const activeIndex = chapters.findIndex((c) => c.status === "writing");
  const remaining = chapters.filter((c) => c.status === "idle" || c.status === "writing").length;
  const failed = chapters.filter((c) => c.status === "failed").length + (book?.cover.status === "failed" ? 1 : 0);
  const done = !!book && chapters.every((c) => c.status === "done") && book.cover.status === "done";

  let progressText = "";
  if (done) progressText = "Your book is ready.";
  else if (activeIndex >= 0)
    progressText = `Writing chapter ${activeIndex + 1} of ${chapters.length} · about ${remaining * SECONDS_PER_CHAPTER} seconds left`;
  else if (book?.cover.status === "working") progressText = "Designing your cover…";
  else if (failed) progressText = failed === 1 ? "One part needs another try." : `${failed} parts need another try.`;

  return { items, streaming, resumed, done, failed, progressText, retry };
}
