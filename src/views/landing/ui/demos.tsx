"use client";

import { Check, LoaderCircle, MailPlus } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { bookDesign, Cover, getCoverDesign, sampleBooks, type ArtDirection } from "@/entities/book";
import { ProgressList } from "@/shared/ui";
import { cn, useDemo, useInView, usePlayClock, usePrefersReducedMotion } from "@/shared/lib";
import { buildFrame, builtFrame, countUp, rewriteFrame, signupAges, signupCount, signups } from "../model/demos";

/*
 * The landing's live demos. Each one is drawn from the product's own pieces – the real cover, the real
 * progress list – not a recording, so it stays sharp at any size. They play only on screen, and a visitor
 * who prefers reduced motion sees the finished frame.
 */

const demoBook = sampleBooks()[0];

/** About two lines of each chapter, cut at a word, so a chapter streams in a couple of seconds. */
const streamed = demoBook.chapters.map((c) => {
  const text = c.body[0] ?? c.summary;
  return text.length <= 230 ? text : `${text.slice(0, text.lastIndexOf(" ", 230))}…`;
});
const lengths = streamed.map((s) => s.length);

/* ── Watch: the book being written ───────────────────────────────────────── */

export function BuildDemo() {
  const { ref, playing, t } = useDemo<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();
  // Before it first plays (and for reduced motion), show the finished book.
  const frame = playing || t > 0 ? buildFrame(t, lengths) : builtFrame(lengths.length);
  const shown = frame.active >= 0 ? frame.active : lengths.length - 1;
  const text = frame.active >= 0 ? streamed[shown].slice(0, frame.chars) : streamed[shown];

  const tab = frame.ready
    ? "✓ Your book is ready · Primer"
    : frame.cover === "working"
      ? "Designing the cover · Primer"
      : `Writing ${frame.active + 1} of ${lengths.length} · Primer`;

  const items = [
    ...demoBook.chapters.map((c, i) => ({
      id: c.id,
      label: `${i + 1}. ${c.title}`,
      status: (i < frame.done ? "done" : i === frame.active ? "working" : "waiting") as "done" | "working" | "waiting",
    })),
    {
      id: "cover",
      label: "Cover",
      status: (frame.cover === "done" ? "done" : frame.cover === "working" ? "working" : "waiting") as
        "done" | "working" | "waiting",
    },
  ];

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Primer writing a book: chapters appear one by one and can be read straight away, then the cover is designed"
      className="overflow-hidden rounded-lg border border-default bg-canvas shadow-book"
    >
      <div aria-hidden className="flex h-9 items-center gap-1.5 border-b border-default bg-subtle px-3.5">
        <span className="size-2.5 rounded-full bg-strong" />
        <span className="size-2.5 rounded-full bg-strong" />
        <span className="size-2.5 rounded-full bg-strong" />
        <span className="ml-3.5 flex h-5.5 w-full max-w-[360px] items-center rounded-sm border border-default bg-surface px-2.5 text-xs text-secondary">
          {tab}
        </span>
      </div>
      <div aria-hidden className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_190px]">
        <div className="flex min-w-0 flex-col">
          <p className="font-brand text-lg font-bold tracking-tight">
            {frame.ready ? "Your book is ready" : "Writing your book"}
          </p>
          <p className="mt-1 text-sm text-secondary">
            {frame.ready
              ? `${lengths.length} chapters and a cover`
              : frame.cover === "working"
                ? "Designing your cover…"
                : `Writing chapter ${frame.active + 1} of ${lengths.length}`}
          </p>
          {/* Every chapter sits in the same grid cell, invisible, so the card is as tall as the longest one
              from the start – the text streams in without pushing the page down. */}
          <article className="mt-4 grid flex-1 rounded-md border border-default bg-surface p-4">
            {demoBook.chapters.map((c, i) => {
              const current = i === shown;
              return (
                <div key={c.id} className={cn("col-start-1 row-start-1", !current && "invisible")}>
                  <p className="text-xs font-medium tracking-wider text-secondary uppercase">Chapter {i + 1}</p>
                  <p className="mt-1 font-display text-lg leading-snug font-medium">{c.title}</p>
                  <p className="mt-2 font-display text-md leading-relaxed">
                    {current ? text : streamed[i]}
                    {current && frame.active >= 0 && !reduced && (
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle" />
                    )}
                  </p>
                </div>
              );
            })}
          </article>
        </div>
        <div className="hidden flex-col gap-4 sm:flex">
          {/* The cover fades in from a sketch, as it does in the product. */}
          <Cover
            design={bookDesign(demoBook)}
            title={demoBook.title}
            author={demoBook.author}
            size="none"
            className={cn(
              "w-28 self-center transition-[opacity,filter] duration-500",
              frame.cover === "done" ? "opacity-100" : "opacity-40 grayscale",
            )}
          />
          <div className="origin-top-left scale-90 [&_p]:text-xs">
            <ProgressList items={items} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── What you get: a cover made for your topic – styles trading places ──── */

const directions: ArtDirection[] = ["editorial", "geometric", "organic", "typographic"];
const COVER_SWAP_MS = 2600;

export function CoverStylesDemo({ className }: { className?: string }) {
  const { ref, t } = useDemo<HTMLDivElement>();
  const books = sampleBooks();
  const step = Math.floor(t / COVER_SWAP_MS);
  return (
    <div ref={ref} aria-hidden className={cn("flex items-end justify-center gap-3", className)}>
      {books.map((b, i) => {
        // Each book moves on to the next style in turn, so only one cover changes at a time.
        const turns = Math.floor((step + books.length - 1 - i) / books.length);
        const start = directions.indexOf(b.cover.direction);
        const direction = directions[(start + turns) % directions.length];
        const design = turns === 0 ? bookDesign(b) : getCoverDesign({ title: b.title, mood: b.mood, direction });
        return (
          <div
            key={`${b.id}-${direction}`}
            className={cn(
              "shrink-0 animate-[fade-in_500ms_var(--primer-ease)]",
              i === 0 && "-rotate-3",
              i === 1 && "-translate-y-2.5",
              i === 2 && "rotate-3",
            )}
          >
            <Cover
              design={design}
              title={b.title}
              author={b.author}
              size="none"
              className="w-[88px] sm:w-[120px] lg:w-[140px]"
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── What you get: fix it without starting over ──────────────────────────── */

const before =
  "Most teams don't need a big system on day one. They need a short list of decisions everyone follows, written down once.";
const after = "Start with a short list of decisions, written down once.";

export function RewriteDemo() {
  const { ref, playing, t } = useDemo<HTMLDivElement>();
  const phase = playing || t > 0 ? rewriteFrame(t) : "kept";
  const chosen = phase !== "reading";
  const suggested = phase === "suggested" || phase === "keeping";
  const rewritten = suggested || phase === "kept";

  return (
    <div ref={ref} aria-hidden className="flex h-full flex-col gap-3 p-4 text-left">
      <div className="flex flex-wrap gap-1.5">
        {["Simpler", "Shorter", "Warmer"].map((d) => (
          <span
            key={d}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs transition-colors duration-200",
              d === "Shorter" && chosen
                ? "border-inverse bg-inverse text-on-inverse"
                : "border-default bg-surface text-secondary",
            )}
          >
            {d}
          </span>
        ))}
      </div>
      {suggested ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-default bg-surface px-2.5 py-1.5">
          <span className="text-xs font-semibold">Suggested rewrite · 1 change</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-sm bg-inverse px-2 py-0.5 text-xs text-on-inverse transition-transform duration-150",
              phase === "keeping" && "scale-90",
            )}
          >
            <Check className="size-3" /> Keep
          </span>
        </div>
      ) : (
        <p className="flex h-7 items-center gap-1.5 text-xs text-secondary">
          {phase === "rewriting" && <LoaderCircle className="size-3 animate-spin" />}
          {phase === "rewriting"
            ? "Rewriting this chapter…"
            : phase === "kept"
              ? "Version 2 · earlier version kept"
              : ""}
        </p>
      )}
      <div
        className={cn(
          "flex flex-col gap-2 font-display text-sm leading-snug transition-opacity duration-300",
          phase === "rewriting" && "opacity-40",
        )}
      >
        <p>Every hour spent re-deciding a button is an hour not spent on the product.</p>
        <p
          className={cn(
            "rounded-sm transition-colors duration-300",
            suggested && "-mx-1.5 border-l-2 border-accent bg-accent-subtle px-1.5",
          )}
        >
          {rewritten ? after : before}
        </p>
        <p className="text-secondary">Agree on the list together, then build from it.</p>
      </div>
    </div>
  );
}

/* ── What you get: a page that collects emails ───────────────────────────── */

export function SignupsDemo() {
  const { ref, playing, t } = useDemo<HTMLDivElement>();
  const count = playing || t > 0 ? signupCount(t) : 3;
  // Newest first; three on screen at a time.
  const visible = Array.from({ length: Math.min(3, count) }, (_, i) => count - 1 - i);

  return (
    <div ref={ref} aria-hidden className="flex h-full flex-col gap-2 p-4">
      <p className="text-xs text-secondary">Example – what your inbox gets</p>
      {visible.map((n, place) => {
        const name = signups[n % signups.length];
        return (
          <div
            key={n}
            className="flex animate-[fade-in_400ms_var(--primer-ease)] items-start gap-2.5 rounded-md border border-default bg-surface p-2.5 shadow-sm"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent-strong">
              <MailPlus className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 text-xs">
              <span className="flex justify-between gap-2">
                <span className="font-semibold">New subscriber</span>
                <span className="text-secondary">{signupAges[place]}</span>
              </span>
              <span className="block truncate text-secondary">
                {name} got “{demoBook.title}”
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Small pieces ────────────────────────────────────────────────────────── */

/** A number that counts up once, the first time it comes on screen. */
export function CountUp({ to, prefix = "" }: { to: number; prefix?: string }) {
  const reduced = usePrefersReducedMotion();
  const [ref, seen] = useInView<HTMLSpanElement>({ once: true, threshold: 0.6 });
  const t = usePlayClock(seen && !reduced);
  const value = reduced || !seen ? to : countUp(t, to);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value}
    </span>
  );
}

/**
 * A block that rises in the first time it comes on screen. Anything already visible on load stays put,
 * and without IntersectionObserver nothing is hidden – so content never depends on the effect.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!first) setState("shown");
          observer.disconnect();
        } else if (first) setState("hidden");
        first = false;
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={state === "static" ? undefined : state}
      style={delay && state !== "static" ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * The end of a headline, arriving as a sweep of the ember gradient that cools to the text colour – once, when
 * it comes on screen. `immediate` plays it on load (the hero). Without IntersectionObserver, or for reduced
 * motion, it is plain text.
 */
export function Sweep({ children, immediate = false }: { children: ReactNode; immediate?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"plain" | "wait" | "on">(immediate ? "on" : "plain");

  useEffect(() => {
    const el = ref.current;
    if (immediate || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("on");
          observer.disconnect();
        } else if (first) setState("wait");
        first = false;
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <span ref={ref} data-sweep={state === "plain" ? undefined : state} className="text-sweep -mr-[0.06em] pr-[0.06em]">
      {children}
    </span>
  );
}
