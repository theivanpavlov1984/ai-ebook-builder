"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type PointerEvent, type ReactNode, type Ref } from "react";
import { Cover, getCoverDesign, type Mood } from "@/entities/book";
import { focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { Sweep } from "./demos";
import { box, Eyebrow, SectionTitle } from "./parts";

/* ── Reviews (sample content) ────────────────────────────────────────────────
 * One story at a time, the ones beside it shrunk to a mark: the book the reviewer made, so the section shows
 * covers as well as words. */
type Story = {
  name: string;
  role: string;
  avatar: string;
  book: string;
  mood: Mood;
  context: string;
  quote: string;
  stats: { value: string; label: string }[];
};

const stories: Story[] = [
  {
    name: "Amara Okafor",
    role: "Nutrition coach",
    avatar: "amara",
    book: "Small-Batch Meals for Busy Parents",
    mood: "practical",
    context: "Amara had been about to write her meal-prep guide for two years.",
    quote: "Primer got me a first draft over lunch – I spent the afternoon making it sound like me.",
    stats: [
      { value: "38 min", label: "from idea to PDF" },
      { value: "6", label: "chapters, all kept" },
      { value: "214", label: "sign-ups in the first week" },
    ],
  },
  {
    name: "Marcus Bell",
    role: "Fitness coach",
    avatar: "marcus",
    book: "The 20-Minute Strength Habit",
    mood: "bold",
    context: "Marcus swapped his webinar funnel for a free book.",
    quote: "From idea to sign-up page in one sitting. My list grew faster than with any webinar I’ve run.",
    stats: [
      { value: "1", label: "sitting, start to share" },
      { value: "412", label: "emails in 14 days" },
      { value: "3×", label: "his best webinar" },
    ],
  },
  {
    name: "Hanna Berg",
    role: "UX writer",
    avatar: "hanna",
    book: "Microcopy That Earns Trust",
    mood: "calm",
    context: "Hanna rewrote every chapter in her own voice, one suggestion at a time.",
    quote:
      "Rewrites come as suggestions, so I can see exactly what changed before I keep it. That’s what made me trust it.",
    stats: [
      { value: "23", label: "suggestions reviewed" },
      { value: "0", label: "chapters started over" },
      { value: "1", label: "afternoon in all" },
    ],
  },
  {
    name: "Daniel Reyes",
    role: "Freelance designer",
    avatar: "daniel",
    book: "Pricing Your Design Work",
    mood: "practical",
    context: "Daniel kept his book to six short chapters on purpose.",
    quote: "Six short chapters is exactly the right size. People actually finish it – and reply to the last page.",
    stats: [
      { value: "14", label: "pages, a 20-minute read" },
      { value: "19", label: "replies to the last page" },
      { value: "4", label: "new projects booked" },
    ],
  },
  {
    name: "Sofia Marin",
    role: "Career coach",
    avatar: "sofia",
    book: "Changing Careers After 35",
    mood: "inspiring",
    context: "Sofia had tried two other generators before Primer.",
    quote: "This is the first one that asked who the book was for – and it shows in every chapter.",
    stats: [
      { value: "5 min", label: "to a first outline" },
      { value: "8", label: "calls booked from the book" },
      { value: "2", label: "tools she stopped using" },
    ],
  },
  {
    name: "Lukas Novak",
    role: "Agency founder",
    avatar: "lukas",
    book: "Launch a Brand Site in a Week",
    mood: "bold",
    context: "Lukas sent the PDF to clients the day he made it.",
    quote: "The cover looked designed, not generated. I sent it to clients the same afternoon.",
    stats: [
      { value: "Same day", label: "made and sent" },
      { value: "12", label: "clients received it" },
      { value: "0", label: "hours on the cover" },
    ],
  },
];

const covers = stories.map((s) => getCoverDesign({ title: s.book, mood: s.mood }));

/**
 * The track is centred on the active story: its left edge sits at the middle of the section, then shifts back by
 * half a card and by every narrow card before it. Card and side widths live in CSS variables, so the sum works at
 * every breakpoint without measuring the DOM.
 */
const track =
  "[--gap:8px] [--side:24px] sm:[--gap:12px] sm:[--side:56px] lg:[--gap:20px] lg:[--side:120px] xl:[--side:220px] " +
  "[--card:min(880px,calc(100vw_-_2*(var(--side)_+_var(--gap))_-_8px))]";

export function Reviews() {
  const [active, setActive] = useState(1);
  const last = stories.length - 1;
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swipeFrom = useRef<number | null>(null);

  const go = (i: number) => setActive(Math.max(0, Math.min(last, i)));

  /** A side card is a way to its story; once it is the story, its button goes away, so focus moves to an arrow. */
  function open(i: number) {
    go(i);
    (i < active ? prevRef : nextRef).current?.focus();
  }

  // Touch and pen swipe; a mouse drag stays a text selection.
  function onPointerDown(e: PointerEvent) {
    swipeFrom.current = e.pointerType === "mouse" ? null : e.clientX;
  }
  function onPointerUp(e: PointerEvent) {
    if (swipeFrom.current === null) return;
    const dx = e.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1));
  }

  return (
    <section aria-labelledby="reviews" className="overflow-hidden py-16 lg:py-28">
      <div className={cn(box, "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12")}>
        <div>
          <Eyebrow>What people say</Eyebrow>
          <SectionTitle id="reviews" className="max-w-[620px]">
            Finished books, <Sweep>not abandoned drafts</Sweep>
          </SectionTitle>
        </div>
        <p className="max-w-[280px] text-sm text-secondary lg:text-right">Sample reviews – Primer is a prototype.</p>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Reviews"
        className={cn(track, "mt-10 touch-pan-y lg:mt-14")}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
      >
        <ul
          className="relative left-1/2 flex gap-(--gap) transition-transform duration-500 ease-standard motion-reduce:transition-none"
          style={{ transform: `translateX(calc(var(--card) / -2 - ${active} * (var(--side) + var(--gap))))` }}
        >
          {stories.map((s, i) => (
            <Slide
              key={s.name}
              story={s}
              index={i}
              active={i === active}
              near={Math.abs(i - active) === 1}
              onOpen={() => open(i)}
            />
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center justify-center gap-5">
        <ArrowButton ref={prevRef} label="Previous review" disabled={active === 0} onClick={() => go(active - 1)}>
          <ArrowLeft aria-hidden className="size-4.5" />
        </ArrowButton>
        <div aria-hidden className="flex items-center gap-1.5">
          {stories.map((s, i) => (
            <span
              key={s.name}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
                i === active ? "w-6 bg-accent" : "w-1.5 bg-strong",
              )}
            />
          ))}
        </div>
        <ArrowButton ref={nextRef} label="Next review" disabled={active === last} onClick={() => go(active + 1)}>
          <ArrowRight aria-hidden className="size-4.5" />
        </ArrowButton>
      </div>
      <p aria-live="polite" className="sr-only">
        Review {active + 1} of {stories.length}: {stories[active].name}
      </p>
    </section>
  );
}

function ArrowButton({
  ref,
  label,
  disabled,
  onClick,
  children,
}: {
  ref: Ref<HTMLButtonElement>;
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full border border-default bg-surface text-primary hover:border-strong disabled:opacity-40 disabled:hover:border-default",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}

function Slide({
  story: s,
  index,
  active,
  near,
  onOpen,
}: {
  story: Story;
  index: number;
  active: boolean;
  near: boolean;
  onOpen: () => void;
}) {
  return (
    <li
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${stories.length}`}
      aria-hidden={!active && !near}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[20px] border border-default",
        "transition-[width,margin,background-color,box-shadow] duration-500 ease-standard motion-reduce:transition-none",
        active ? "w-(--card) bg-surface shadow-md" : "my-5 w-(--side) bg-subtle hover:bg-surface lg:my-8",
      )}
    >
      {/* Laid out at full card width even while narrow, so the text never reflows as the card opens. */}
      <div
        inert={!active}
        className={cn(
          "h-full w-(--card) transition-opacity motion-reduce:transition-none",
          active ? "opacity-100 delay-150 duration-300" : "opacity-0 duration-150",
        )}
      >
        <div className="grid h-full gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_180px] lg:gap-12 lg:p-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <Cover
                design={covers[index]}
                title={s.book}
                author={s.name}
                size="none"
                className="w-14 shrink-0 shadow-book"
              />
              <p className="text-sm text-secondary">{s.context}</p>
            </div>
            <blockquote className="relative mt-7 pl-5 font-brand text-lg leading-snug font-medium tracking-tight lg:text-xl">
              <span
                aria-hidden
                className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-(image:--primer-gradient-rule)"
              />
              “{s.quote}”
            </blockquote>
            <div className="mt-auto flex items-center gap-3 pt-8">
              <Image
                src={`/landing/avatars/${s.avatar}.webp`}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <span className="flex flex-col">
                <span className="text-base font-semibold">{s.name}</span>
                <span className="text-sm text-secondary">{s.role}</span>
              </span>
            </div>
          </div>
          <dl className="grid gap-3 border-t border-default pt-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-1 lg:content-center lg:gap-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            {s.stats.map((st) => (
              <div
                key={st.label}
                className="flex flex-row-reverse items-baseline justify-end gap-3 sm:flex-col-reverse sm:items-start sm:justify-start sm:gap-1"
              >
                <dt className="text-sm text-secondary">{st.label}</dt>
                <dd className="font-brand text-xl font-bold tracking-tight lg:text-2xl">{st.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Narrow, the card is just the book – and a way to its story. */}
      <button
        type="button"
        inert={active || !near}
        tabIndex={active || !near ? -1 : 0}
        aria-label={`Show ${s.name}’s review`}
        onClick={onOpen}
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-[20px] transition-opacity motion-reduce:transition-none",
          active ? "opacity-0 duration-150" : "opacity-100 delay-150 duration-300",
          focusRing,
        )}
      >
        <Cover
          design={covers[index]}
          title={s.book}
          author={s.name}
          size="none"
          className="hidden w-[min(7.5rem,calc(100%_-_16px))] shadow-book sm:block"
        />
      </button>
    </li>
  );
}
