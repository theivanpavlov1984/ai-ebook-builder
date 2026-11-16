"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { ExampleShelf } from "@/widgets/example-shelf";
import { focusRing, Wordmark } from "@/shared/ui";
import { cn, useScrollProgress } from "@/shared/lib";
import { BuildDemo, CountUp, CoverStylesDemo, Reveal, RewriteDemo, SignupsDemo, Sweep } from "./demos";
import { box, Eyebrow, ScreenCrop, SectionTitle } from "./parts";

/* ── Watch it write ──────────────────────────────────────────────────────── */
function Dot() {
  return <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-accent" />;
}

export function WatchSection() {
  return (
    <section aria-labelledby="watch" className="border-t border-default bg-surface py-16 lg:py-28">
      <div className={cn(box, "grid items-center gap-10 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-18")}>
        <div>
          <Eyebrow>About a minute</Eyebrow>
          <SectionTitle id="watch">
            Watch your book <Sweep>being written</Sweep>
          </SectionTitle>
          <p className="mt-5 text-md text-secondary lg:text-lg">
            Chapters appear as they’re written. Start reading chapter one while the rest is on its way – no spinner, no
            blank page.
          </p>
          <ul className="mt-7 flex flex-col gap-3.5 text-md">
            <li className="flex gap-3">
              <Dot /> An honest “about 40 seconds left”
            </li>
            <li className="flex gap-3">
              <Dot /> The cover fades in from a sketch
            </li>
            <li className="flex gap-3">
              <Dot /> Switch tabs – the tab title tells you when it’s done
            </li>
          </ul>
        </div>
        {/* The product itself writing a book, on a loop – not a recording. */}
        <Reveal>
          <BuildDemo />
        </Reveal>
      </div>
    </section>
  );
}

/* ── Ideas shelf ─────────────────────────────────────────────────────────────
 * Decorative covers for range ("what could yours be?"), not output: Primer draws its own covers. */
const ideas = [
  [
    "small-batch-sundays",
    "the-quiet-grid",
    "midnight-ramen",
    "a-map-of-tides",
    "winter-pears",
    "snowline-diary",
    "one-apricot-summer",
  ],
  [
    "soft-machines",
    "borrowed-light",
    "the-blue-stair",
    "two-seats-left",
    "the-unfolded-crane",
    "where-moss-sleeps",
    "the-glass-orbit",
  ],
];

function ShelfRow({ covers, direction }: { covers: string[]; direction: "left" | "right" }) {
  // Four copies: wide enough for any screen, and the −50% loop lands on an identical frame.
  const row = [...covers, ...covers, ...covers, ...covers];
  return (
    <div
      className={cn(
        "flex w-max gap-5.5",
        direction === "left" ? "animate-[shelf-left_90s_linear_infinite]" : "animate-[shelf-right_90s_linear_infinite]",
      )}
    >
      {row.map((c, i) => (
        <Image
          key={`${c}-${i}`}
          src={`/landing/covers/${c}.webp`}
          alt=""
          width={150}
          height={225}
          className="h-[180px] w-[120px] rounded-l-[4px] rounded-r-sm object-cover shadow-book lg:h-[225px] lg:w-[150px]"
        />
      ))}
    </div>
  );
}

export function IdeasShelf() {
  return (
    <section aria-labelledby="ideas" className="overflow-hidden pt-16 pb-16 text-center lg:pt-26 lg:pb-28">
      <Reveal className={box}>
        <Eyebrow>Any topic you know</Eyebrow>
        <SectionTitle id="ideas">
          What will yours <Sweep>be about?</Sweep>
        </SectionTitle>
        <p className="mx-auto mt-4 max-w-[560px] text-md text-secondary lg:text-lg">
          Recipes, travel notes, design, gardening, money – if you can explain it to a friend, it can be a book.
        </p>
      </Reveal>
      <div aria-hidden className="mt-13 flex flex-col gap-5.5">
        <ShelfRow covers={ideas[0]} direction="left" />
        <ShelfRow covers={ideas[1]} direction="right" />
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────────────────────── */
const steps: { title: string; text: string; shot: ReactNode; screen: string; tab: string }[] = [
  {
    title: "Tell us your idea",
    text: "One sentence, who it’s for, and the tone. Or skip the rest with “Write it now”.",
    shot: <ScreenCrop src="/landing/screens/describe.webp" scale={0.56} x={180} y={70} className="h-full" />,
    screen: "/landing/screens/describe.webp",
    tab: "Primer – turn what you know into a book",
  },
  {
    title: "Shape it your way",
    text: "Make a chapter simpler, shorter or warmer. Every rewrite is a suggestion you keep or discard.",
    shot: <ScreenCrop src="/landing/screens/review.webp" scale={0.56} x={262} y={36} className="h-full" />,
    screen: "/landing/screens/review.webp",
    tab: "Primer – turn what you know into a book",
  },
  {
    title: "Share and grow your list",
    text: "Download the PDF, or share one link: readers leave their email to get the book.",
    shot: <ScreenCrop src="/landing/screens/share.webp" scale={0.56} x={150} y={30} className="h-full" />,
    screen: "/landing/screens/share.webp",
    tab: "Design Systems for Small Teams by Ivan Pavlov",
  },
];

/**
 * On desktop the section is a scroll story: it stays in place while the page scrolls through its three
 * steps; the active step's line fills as you go and its screen takes the stage. On phones the steps stack.
 */
export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref);
  const active = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  const within = progress * steps.length - active;

  return (
    <section ref={ref} aria-label="How it works" className="border-t border-default lg:h-[260vh]">
      <div className="py-16 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0">
        <div className={box}>
          <Eyebrow>How it works</Eyebrow>
          <div className="mt-3.5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h2
              id="how"
              className="max-w-[640px] font-brand text-2xl leading-[1.05] font-bold tracking-tight lg:text-3xl"
            >
              From one sentence to a page that <Sweep>collects emails</Sweep>
            </h2>
            <p className="max-w-[380px] text-md text-secondary">
              Three steps, about five minutes. Every step can be changed later – nothing is final until you share.
            </p>
          </div>

          <ol className="mt-10 grid gap-10 lg:hidden">
            {steps.map((s, i) => (
              <li key={s.title} className="flex min-w-0 flex-col gap-4.5">
                <div aria-hidden className="h-[250px] overflow-hidden rounded-lg border border-default bg-subtle">
                  {s.shot}
                </div>
                <div className="flex gap-3.5">
                  <span className="font-brand text-xl font-bold text-accent">{i + 1}</span>
                  <div>
                    <p className="font-brand text-lg font-bold tracking-tight">{s.title}</p>
                    <p className="mt-1.5 text-md text-secondary">{s.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 hidden items-center gap-12 lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
            <ol className="flex flex-col gap-1">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  aria-current={i === active ? "step" : undefined}
                  className={cn(
                    "flex gap-3.5 rounded-md px-4 py-4 transition-opacity duration-300",
                    i === active ? "opacity-100" : "opacity-45",
                  )}
                >
                  <span className="w-5 shrink-0 font-brand text-xl font-bold text-accent">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-brand text-lg font-bold tracking-tight">{s.title}</p>
                    <p className="mt-1.5 text-md text-secondary">{s.text}</p>
                    <span aria-hidden className="mt-4 block h-0.5 overflow-hidden rounded-full bg-default">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${(i < active ? 1 : i === active ? within : 0) * 100}%` }}
                      />
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            {/* The whole screen in a browser frame at its own 16:10 shape – nothing cropped. */}
            <div aria-hidden className="overflow-hidden rounded-lg border border-default bg-canvas shadow-book">
              <div className="flex h-9 items-center gap-1.5 border-b border-default bg-subtle px-3.5">
                <span className="size-2.5 rounded-full bg-strong" />
                <span className="size-2.5 rounded-full bg-strong" />
                <span className="size-2.5 rounded-full bg-strong" />
                <span className="ml-3.5 flex h-5.5 w-full max-w-[300px] items-center rounded-sm border border-default bg-surface px-2.5 text-xs text-secondary">
                  {steps[active].tab}
                </span>
              </div>
              <div className="relative aspect-[16/10]">
                {steps.map((s, i) => (
                  <Image
                    key={s.title}
                    src={s.screen}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 760px, 100vw"
                    className={cn(
                      "object-cover object-top transition-[opacity,transform] duration-500 ease-standard",
                      i === active ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── What you get (bento) ────────────────────────────────────────────────── */
const tile = "min-w-0 overflow-hidden rounded-[20px] border border-default bg-surface";

function ShotTile({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className={cn(tile, "flex h-[340px] flex-col gap-4.5 px-6 pt-6 lg:h-auto lg:px-7 lg:pt-7")}>
      <div>
        <p className="font-brand text-lg font-bold tracking-tight">{title}</p>
        <p className="mt-2 text-base text-secondary">{text}</p>
      </div>
      <div aria-hidden className="flex-1 overflow-hidden rounded-t-md border border-b-0 border-default bg-canvas">
        {children}
      </div>
    </div>
  );
}

export function WhatYouGet() {
  return (
    <section aria-label="What you get" className="pt-6 pb-16 lg:pb-26">
      <div className={box}>
        <Eyebrow>What you get</Eyebrow>
        <SectionTitle id="gets">
          A finished lead magnet, <Sweep>not a draft</Sweep>
        </SectionTitle>
        <div className="mt-10 grid gap-5 lg:mt-12 lg:auto-rows-[360px] lg:grid-cols-3">
          <div
            className={cn(
              tile,
              "grid items-center gap-8 p-6 lg:col-span-2 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-4 lg:p-8",
            )}
          >
            <div>
              <p className="font-brand text-xl font-bold tracking-tight">A cover made for your topic</p>
              <p className="mt-3 text-md text-secondary">
                Four art directions, chosen from your tone. Shuffle until it feels right – never a template with your
                title pasted in.
              </p>
            </div>
            <CoverStylesDemo />
          </div>

          <div className={cn(tile, "flex min-h-[220px] flex-col justify-between gap-6 bg-accent-subtle p-6 lg:p-8")}>
            <p className="font-brand text-xl font-bold tracking-tight">Short enough that people finish it</p>
            <div>
              <p className="font-brand text-[96px] leading-[0.9] font-extrabold tracking-[-0.04em] text-accent-strong">
                <CountUp to={15} prefix="~" />
              </p>
              <p className="mt-2.5 text-md">pages · 6 chapters · a 9-minute read</p>
            </div>
          </div>

          <ShotTile
            title="Fix it without starting over"
            text="Simpler, shorter, warmer – you see exactly what changed."
          >
            <RewriteDemo />
          </ShotTile>
          <ShotTile title="A PDF ready to send" text="Cover, contents, page numbers and your call to action.">
            <ScreenCrop src="/landing/screens/final.webp" scale={0.53} x={150} y={100} />
          </ShotTile>
          <ShotTile title="A page that collects emails" text="One link. Readers leave their email, then get your book.">
            <SignupsDemo />
          </ShotTile>
        </div>
        <ToolsStrip />
      </div>
    </section>
  );
}

/* ── Tools strip: real logos, true claim (a PDF and a link work there) ───── */
const tools = [
  { name: "Gumroad", logo: "gumroad" },
  { name: "Mailchimp", logo: "mailchimp" },
  { name: "Substack", logo: "substack" },
  { name: "LinkedIn", logo: "linkedin" },
  { name: "Notion", logo: "notion" },
];

function ToolsStrip() {
  return (
    <div
      className={cn(
        tile,
        "mt-5 flex flex-col items-start gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-7",
      )}
    >
      <div className="max-w-[300px]">
        <p className="font-brand text-lg font-bold tracking-tight">Works wherever a PDF and a link do</p>
        <p className="mt-1.5 text-base text-secondary">Sell it, send it to your list, or post the link.</p>
      </div>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-md font-semibold text-secondary lg:gap-9">
        {tools.map((t) => (
          <li key={t.name} className="inline-flex items-center gap-2">
            {/* Monochrome via a mask, so the logo takes the token colour. */}
            <span
              aria-hidden
              className="size-5 bg-current"
              style={{ mask: `url(/landing/logos/${t.logo}.svg) center / contain no-repeat` }}
            />
            {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Examples ────────────────────────────────────────────────────────────── */
export function Examples() {
  return (
    <section aria-labelledby="examples" className="border-t border-default bg-subtle py-16 lg:py-26">
      <div className={cn(box, "grid items-center gap-10 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-16")}>
        <div>
          <Eyebrow>Examples</Eyebrow>
          <SectionTitle id="examples">
            Open <Sweep>a real one</Sweep>
          </SectionTitle>
          <p className="mt-4.5 text-md text-secondary lg:text-lg">
            Each book opens the page its readers would see – the email form and all.
          </p>
        </div>
        <div className="flex justify-center">
          <Reveal>
            <ExampleShelf />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Questions ───────────────────────────────────────────────────────────────
 * The doubts people raise about AI book tools (RESEARCH.md), answered with what the prototype really does. */
const questions: { q: string; a: string }[] = [
  {
    q: "Do I need to be a writer?",
    a: "No. You describe what you know in a sentence. Primer suggests the title, the outline and every chapter – you choose, reorder and approve.",
  },
  {
    q: "Will it sound like me?",
    a: "You pick the tone before anything is written. Any chapter can be rewritten simpler, shorter, warmer or in your own words, and each rewrite arrives as a suggestion you keep or discard. Earlier versions stay one click away.",
  },
  {
    q: "Who owns the book?",
    a: "You do. Your name goes on the cover, and it's yours to give away as a lead magnet or to send to clients.",
  },
  {
    q: "Why a PDF and not EPUB?",
    a: "A lead magnet travels by email and download links, and a PDF opens everywhere: inbox, phone, Gumroad, Notion. You also get a share page that asks for an email before the download.",
  },
  {
    q: "Where is my book stored?",
    a: "In your browser, on this device. Nothing is uploaded. A share link carries the book inside the link itself, so there's no server holding your words.",
  },
  {
    q: "How much does it cost?",
    a: "Nothing. Primer is a prototype: the AI is simulated, and there's no account or payment.",
  },
];

export function Questions() {
  return (
    <section aria-labelledby="questions" className="border-t border-default py-16 lg:py-28">
      <div className={cn(box, "grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-16")}>
        <div>
          <Eyebrow>Questions</Eyebrow>
          <SectionTitle id="questions">
            Before <Sweep>you ask</Sweep>
          </SectionTitle>
          <p className="mt-4.5 max-w-[340px] text-md text-secondary">
            The doubts we heard most from people who tried AI book tools.
          </p>
        </div>
        <Reveal className="flex flex-col gap-3">
          {questions.map(({ q, a }) => (
            <details key={q} className="group rounded-[20px] border border-default bg-surface">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center justify-between gap-4 rounded-[20px] px-5 py-4.5 text-md font-semibold lg:gap-6 lg:px-6 lg:py-5 [&::-webkit-details-marker]:hidden",
                  focusRing,
                )}
              >
                {q}
                <Plus
                  aria-hidden
                  className="size-4.5 shrink-0 text-secondary transition-transform group-open:rotate-45"
                />
              </summary>
              <p className="-mt-1 px-5 pb-5 text-md leading-relaxed text-secondary lg:px-6">{a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ── Closing call to action ──────────────────────────────────────────────── */
export function FinalCta({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="final"
      className="relative overflow-hidden bg-inverse py-20 text-center text-on-inverse lg:py-30"
    >
      <div
        aria-hidden
        className="absolute top-3/5 left-1/2 h-[560px] w-[1100px] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)] opacity-45 blur-2xl"
      />
      <Reveal className="relative flex flex-col items-center px-5 lg:px-8">
        <h2 id="final" className="font-brand text-3xl font-bold tracking-tight lg:text-hero">
          You already know enough
          <br className="hidden sm:block" /> <Sweep>to fill a book</Sweep>
        </h2>
        <p className="mt-4.5 text-md text-on-inverse-secondary">It takes about five minutes to prove it.</p>
        <div className="mt-10 w-full max-w-[680px] text-primary">{children}</div>
      </Reveal>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
const footLink = cn("rounded-sm text-base text-secondary hover:text-primary", focusRing);

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-5 border-t border-default px-5 py-10 text-center lg:flex-row lg:justify-between lg:gap-8 lg:px-16 lg:text-left">
      <Wordmark className="text-xl" />
      <p className="text-base text-secondary">A prototype: the AI is simulated, your books stay in your browser.</p>
      <nav aria-label="Footer" className="flex gap-7">
        <Link href="/books" className={footLink}>
          My books
        </Link>
        <Link href="/system" className={footLink}>
          Design system
        </Link>
      </nav>
    </footer>
  );
}
