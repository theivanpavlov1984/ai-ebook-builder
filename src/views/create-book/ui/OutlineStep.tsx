"use client";

import { GripVertical, Info, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CreationLayout, NotFound } from "@/widgets/layout";
import { Button, focusRing, useToast, StepHeader } from "@/shared/ui";
import {
  alternativeChapter,
  draftOutline,
  estimate,
  useBooks,
  type Chapter,
  useBook,
  forwardStage,
  stageOrder,
} from "@/entities/book";
import { toChapter } from "../model/fastTrack";
import { DraftingOutline } from "./DraftingOutline";
import { simulate } from "@/shared/api";
import { cn } from "@/shared/lib";

const MIN_CHAPTERS = 3;
const MAX_PAGES = 20;

export function OutlineStep({ id }: { id: string }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <OutlineEditor id={id} />;
}

function OutlineEditor({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const undo = useBooks((s) => s.undo);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(book.chapters.length ? "ready" : "loading");
  const [rounds, setRounds] = useState<Record<string, number>>({});
  // What a screen reader hears after a change to the list – moving, swapping or adding a chapter.
  const [announcement, setAnnouncement] = useState("");
  // A freshly drafted outline arrives one chapter at a time; one the author comes back to is simply there.
  const [fresh, setFresh] = useState(false);
  const started = useRef(false);

  const draft = useCallback(async () => {
    setStatus("loading");
    try {
      const b = useBooks.getState().books[id];
      const outline = await simulate("outline", () => draftOutline(b), { ms: 900 });
      updateBook(id, { chapters: outline.map(toChapter) });
      setFresh(true);
      setStatus("ready");
      // Once the last chapter is in, later additions and moves just appear.
      setTimeout(() => setFresh(false), outline.length * 110 + 400);
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

  /**
   * Keyboard users keep their place: after a change, focus goes to the first of `labels` that exists and is
   * enabled (a chapter moved to the end has no "down" any more; a removed one has no buttons at all).
   */
  function focusAfterRender(labels: string[]) {
    setTimeout(() => {
      for (const label of labels) {
        const el = document.querySelector<HTMLElement>(`[aria-label="${label}"]`);
        if (el && !el.hasAttribute("disabled")) return el.focus();
      }
    });
  }

  /** Moves a chapter and briefly highlights it where it landed – the numbers stay put, the card is what moves. */
  function move(from: number, to: number, { focus = false } = {}) {
    if (to < 0 || to >= chapters.length || to === from) return;
    const next = [...chapters];
    const [c] = next.splice(from, 1);
    next.splice(to, 0, c);
    setChapters(next);
    setAnnouncement(`Moved “${c.title}” to position ${to + 1} of ${next.length}.`);
    setMoved(c.id);
    if (focus) focusAfterRender([`Reorder chapter ${to + 1}`]);
  }

  // Drag and drop by the handle. The dragged card follows the pointer, the others slide aside to show where it
  // will land, and the order is saved on release. The handle also takes the arrow keys, for keyboard users.
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [drag, setDrag] = useState<{ from: number; to: number; startY: number; dy: number; shift: number }>();
  const [moved, setMoved] = useState<string>();
  const mids = useRef<number[]>([]);

  useEffect(() => {
    if (!moved) return;
    const t = setTimeout(() => setMoved(undefined), 900);
    return () => clearTimeout(t);
  }, [moved]);

  function onGrab(e: PointerEvent<HTMLButtonElement>, i: number) {
    if (e.button !== 0) return;
    e.preventDefault();
    // Keeps the moves coming when the pointer leaves the handle. Optional: some pointers can't be captured.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const rects = items.current.map((el) => el?.getBoundingClientRect());
    mids.current = rects.map((r) => (r ? r.top + r.height / 2 : 0));
    const own = rects[i];
    const gap = rects[1] && rects[0] ? rects[1].top - rects[0].bottom : 8;
    setDrag({ from: i, to: i, startY: e.clientY, dy: 0, shift: (own?.height ?? 0) + gap });
  }

  function onDrag(e: PointerEvent<HTMLButtonElement>) {
    if (!drag) return;
    const dy = e.clientY - drag.startY;
    const center = mids.current[drag.from] + dy;
    let to = drag.from;
    mids.current.forEach((mid, j) => {
      if (j > drag.from && center > mid) to = j;
      if (j < drag.from && center < mid) to = Math.min(to, j);
    });
    setDrag({ ...drag, dy, to });
  }

  function onDrop() {
    if (!drag) return;
    setDrag(undefined);
    move(drag.from, drag.to);
  }

  function onHandleKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : undefined;
    if (to === undefined) return;
    e.preventDefault();
    move(i, to, { focus: true });
  }

  /** The number a card will have if the drag ends now – so the numbers follow the cards while dragging. */
  function numberAt(i: number): number {
    if (!drag) return i + 1;
    if (i === drag.from) return drag.to + 1;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return i;
    if (drag.to < drag.from && i >= drag.to && i < drag.from) return i + 2;
    return i + 1;
  }

  /** Where a card sits while another one is dragged: shifted by one slot if the dragged card passes it. */
  function offset(i: number): number {
    if (!drag) return 0;
    if (i === drag.from) return drag.dy;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return -drag.shift;
    if (drag.to < drag.from && i >= drag.to && i < drag.from) return drag.shift;
    return 0;
  }

  function remove(i: number) {
    setChapters(
      chapters.filter((_, j) => j !== i),
      true,
    );
    // The next chapter takes this place; after the last one, the one before it.
    const n = Math.min(i + 1, chapters.length - 1);
    focusAfterRender([`Remove chapter ${n}`, `Chapter ${n} title`]);
    show({
      tone: "info",
      message: `“${chapters[i].title}” removed`,
      action: { label: "Undo", onClick: () => undo(id) },
    });
  }

  function suggest(i: number) {
    const c = chapters[i];
    const round = (rounds[c.id] ?? 0) + 1;
    setRounds({ ...rounds, [c.id]: round });
    const alt = alternativeChapter(book, i, round);
    // A written chapter swapped for another idea no longer matches its text: it is written again on continue.
    const swapped = c.status === "done" ? { body: [], draft: undefined, status: "idle" as const } : {};
    setChapters(
      chapters.map((x, j) => (j === i ? { ...x, ...alt, ...swapped } : x)),
      true,
    );
    setAnnouncement(`Chapter ${i + 1} is now “${alt.title}”.`);
  }

  function add() {
    const chapter = toChapter(alternativeChapter(book, chapters.length, 1));
    setChapters([...chapters, chapter]);
    setAnnouncement(`Added chapter ${chapters.length + 1}: “${chapter.title}”.`);
    // Straight into the new chapter's title, ready to rename it.
    focusAfterRender([`Chapter ${chapters.length + 1} title`]);
  }

  // Back here once writing has started (the browser's Back during Build, or the stepper from Review): say what
  // happens to the chapters already written, and let the button continue instead of starting over.
  const writingStarted = stageOrder.indexOf(book.stage) >= stageOrder.indexOf("build");
  const written = chapters.filter((c) => c.status === "done").length;
  const pending = chapters.length - written;
  const reviewed = stageOrder.indexOf(book.stage) >= stageOrder.indexOf("review");

  function writeBook() {
    if (pending === 0 && reviewed) return router.push(`/book/${id}/review`);
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
        intro="This is the cheapest moment to steer the book. Rename, drag to reorder or swap chapters – or just continue."
        back={{ href: `/book/${id}/title`, label: "Back to title" }}
      />

      {status === "loading" && <DraftingOutline book={book} />}

      {status === "error" && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-danger bg-danger-subtle p-4"
        >
          <p className="text-base text-primary">We couldn’t draft the outline this time. Your answers are saved.</p>
          <Button variant="secondary" size="sm" onClick={() => void draft()}>
            Try again
          </Button>
        </div>
      )}

      {writingStarted && status === "ready" && (
        <p className="-mt-4 mb-6 flex items-start gap-2 rounded-md bg-subtle p-3 text-sm text-primary">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />
          <span>
            {pending > 0
              ? `Your book is being written – ${written} of ${chapters.length} chapters are done. Writing pauses while you’re here and picks up when you continue.`
              : "Your book is written."}{" "}
            Renamed or moved chapters keep their text; new or swapped ones get written when you continue.
          </span>
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === "ready" && (
        <div className="flex flex-col gap-6">
          <p id="reorder-hint" className="sr-only">
            Drag to reorder, or press the up and down arrow keys.
          </p>
          <ol className={cn("flex flex-col gap-2", drag && "select-none")}>
            {chapters.map((c, i) => (
              <li
                key={c.id}
                ref={(el) => {
                  items.current[i] = el;
                }}
                className={cn(
                  "relative flex items-start gap-2 rounded-md border border-default bg-surface p-3 transition-[box-shadow,border-color] duration-300",
                  fresh && "motion-safe:animate-[fade-in_350ms_var(--primer-ease)_both]",
                  // Only while dragging, so the cards don't animate back from their old slots on release.
                  drag && i !== drag.from && "motion-safe:transition-transform motion-safe:duration-150",
                  drag?.from === i && "z-10 border-strong shadow-book",
                  moved === c.id && "border-accent",
                )}
                style={{
                  ...(fresh ? { animationDelay: `${i * 110}ms` } : {}),
                  ...(drag ? { transform: `translateY(${offset(i)}px)` } : {}),
                }}
              >
                <button
                  type="button"
                  aria-label={`Reorder chapter ${i + 1}`}
                  aria-describedby="reorder-hint"
                  title="Drag to reorder"
                  onPointerDown={(e) => onGrab(e, i)}
                  onPointerMove={onDrag}
                  onPointerUp={onDrop}
                  onPointerCancel={() => setDrag(undefined)}
                  onKeyDown={(e) => onHandleKey(e, i)}
                  className={cn(
                    "mt-1.5 shrink-0 cursor-grab touch-none rounded-sm p-1 text-secondary hover:bg-subtle hover:text-primary active:cursor-grabbing",
                    focusRing,
                  )}
                >
                  <GripVertical aria-hidden className="size-4" />
                </button>
                <span className="mt-2 w-6 shrink-0 text-center font-display text-lg text-secondary">{numberAt(i)}</span>
                <div className="min-w-0 flex-1">
                  <input
                    aria-label={`Chapter ${i + 1} title`}
                    value={c.title}
                    onChange={(e) =>
                      setChapters(chapters.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)))
                    }
                    className={cn(
                      "w-full rounded-sm bg-transparent px-1 py-1 font-display text-lg font-medium",
                      focusRing,
                    )}
                  />
                  <p className="px-1 text-sm text-secondary">{c.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
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

          <div>
            <Button variant="secondary" size="sm" icon={<Plus aria-hidden className="size-4" />} onClick={add}>
              Add chapter
            </Button>
          </div>

          {atMinimum && <p className="text-sm text-secondary">A book needs at least 3 chapters.</p>}
          {tooLong && (
            <p className="rounded-md bg-warning-subtle p-3 text-sm text-primary">
              This is getting long. Lead magnets work best short – 10 to 20 pages. Consider removing a chapter.
            </p>
          )}

          {/* The next step stays in reach while a long outline scrolls under it. */}
          <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-default bg-canvas px-1 py-4">
            <Button onClick={writeBook}>
              {!writingStarted
                ? "Write my book"
                : pending > 0
                  ? "Continue writing"
                  : reviewed
                    ? "Back to review"
                    : "Continue"}
            </Button>
            <p className="text-sm text-secondary">
              {chapters.length} chapters · ~{pages} pages{minutes ? ` · ${minutes}-minute read` : ""} · ready in about a
              minute
            </p>
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
      className={cn(
        "rounded-sm p-1.5 text-secondary hover:bg-subtle hover:text-primary disabled:opacity-30",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}
