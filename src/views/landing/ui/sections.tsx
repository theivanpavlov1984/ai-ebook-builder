import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { bookDesign, Cover, sampleBooks } from "@/entities/book";
import { ExampleShelf } from "@/widgets/example-shelf";
import { focusRing, Wordmark } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { Eyebrow, ScreenCrop, SectionTitle } from "./parts";

const box = "mx-auto w-full max-w-[1200px] px-8";

/* ── Brand strip ─────────────────────────────────────────────────────────────
 * Fictional brands drawn as type, not real companies: a real logo here would claim a customer we don't have. */
export function BrandStrip() {
  return (
    <section aria-label="Who uses Primer" className="relative pt-2 pb-14 text-center">
      <p className="text-sm text-secondary">Used by coaches, studios and creators</p>
      <div aria-hidden className="mt-6 flex flex-wrap items-center justify-center gap-x-13 gap-y-4 text-secondary">
        <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l7 9h-4l5 7H4l5-7H5z" />
          </svg>
          Cedarline
        </span>
        <span className="inline-flex items-center gap-2 font-brand text-lg font-bold tracking-tight">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 18a10 10 0 0 1 20 0z" />
            <rect x="2" y="20" width="20" height="2" rx="1" />
          </svg>
          brightpath
        </span>
        <span className="font-display text-xl font-medium italic">Fernhill &amp; Co</span>
        <span className="font-[ui-monospace,Menlo,monospace] text-base font-semibold tracking-[0.32em]">
          KILN·STUDIO
        </span>
        <span className="inline-flex items-center gap-2 text-lg font-medium">
          <svg
            width="26"
            height="20"
            viewBox="0 0 26 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          >
            <path d="M2 8c3-4 6-4 9 0s6 4 9 0" />
            <path d="M2 15c3-4 6-4 9 0s6 4 9 0" />
          </svg>
          tidewell
        </span>
        <span className="inline-flex items-center gap-2 text-md font-bold tracking-wide uppercase">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 0h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm3 5v10h8V5z"
            />
          </svg>
          Marrow
        </span>
      </div>
    </section>
  );
}

/* ── Watch it write ──────────────────────────────────────────────────────── */
function Dot() {
  return <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-accent" />;
}

export function WatchSection() {
  return (
    <section aria-labelledby="watch" className="border-y border-default bg-surface py-28">
      <div className={cn(box, "grid grid-cols-[400px_minmax(0,1fr)] items-center gap-18")}>
        <div>
          <Eyebrow>About a minute</Eyebrow>
          <SectionTitle id="watch">Watch your book being written</SectionTitle>
          <p className="mt-5 text-lg text-secondary">
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
        <figure className="overflow-hidden rounded-lg border border-default bg-canvas shadow-book">
          <div aria-hidden className="flex h-9 items-center gap-1.5 border-b border-default bg-subtle px-3.5">
            <span className="size-2.5 rounded-full bg-strong" />
            <span className="size-2.5 rounded-full bg-strong" />
            <span className="size-2.5 rounded-full bg-strong" />
            <span className="ml-3.5 flex h-5.5 w-full max-w-[360px] items-center rounded-sm border border-default bg-surface px-2.5 text-xs text-secondary">
              Writing 3 of 6 · Primer
            </span>
          </div>
          <Image
            src="/landing/screens/build.webp"
            alt="Primer writing a book: chapter one is readable while the rest is still being written"
            width={1440}
            height={900}
            className="block h-auto w-full"
          />
        </figure>
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
          className="h-[225px] w-[150px] rounded-l-[4px] rounded-r-sm object-cover shadow-book"
        />
      ))}
    </div>
  );
}

export function IdeasShelf() {
  return (
    <section aria-labelledby="ideas" className="overflow-hidden pt-26 pb-28 text-center">
      <div className={box}>
        <Eyebrow>Any topic you know</Eyebrow>
        <SectionTitle id="ideas">What will yours be about?</SectionTitle>
        <p className="mx-auto mt-4 max-w-[560px] text-lg text-secondary">
          Recipes, travel notes, design, gardening, money – if you can explain it to a friend, it can be a book.
        </p>
      </div>
      <div aria-hidden className="mt-13 flex flex-col gap-5.5">
        <ShelfRow covers={ideas[0]} direction="left" />
        <ShelfRow covers={ideas[1]} direction="right" />
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────────────────────── */
const steps: { title: string; text: string; shot: ReactNode }[] = [
  {
    title: "Tell us your idea",
    text: "One sentence, who it’s for, and the tone. Or skip the rest with “Write it now”.",
    shot: <ScreenCrop src="/landing/screens/describe.webp" scale={0.56} x={180} y={70} className="h-full" />,
  },
  {
    title: "Shape it your way",
    text: "Make a chapter simpler, shorter or warmer. Every rewrite is a suggestion you keep or discard.",
    shot: <ScreenCrop src="/landing/screens/review.webp" scale={0.56} x={262} y={36} className="h-full" />,
  },
  {
    title: "Share and grow your list",
    text: "Download the PDF, or share one link: readers leave their email to get the book.",
    shot: <ScreenCrop src="/landing/screens/share.webp" scale={0.56} x={150} y={30} className="h-full" />,
  },
];

export function HowItWorks() {
  return (
    <section aria-label="How it works" className="border-t border-default py-28">
      <div className={box}>
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-3.5 flex items-end justify-between gap-12">
          <h2 id="how" className="max-w-[640px] font-brand text-3xl leading-[1.05] font-bold tracking-tight">
            From one sentence to a page that collects emails
          </h2>
          <p className="max-w-[380px] text-md text-secondary">
            Three steps, about five minutes. Every step can be changed later – nothing is final until you share.
          </p>
        </div>
        <ol className="mt-14 grid grid-cols-3 gap-6">
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
      </div>
    </section>
  );
}

/* ── What you get (bento) ────────────────────────────────────────────────── */
const tile = "min-w-0 overflow-hidden rounded-[20px] border border-default bg-surface";
const shelfBooks = sampleBooks();

function ShotTile({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className={cn(tile, "flex flex-col gap-4.5 px-7 pt-7")}>
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
    <section aria-label="What you get" className="pt-6 pb-26">
      <div className={box}>
        <Eyebrow>What you get</Eyebrow>
        <SectionTitle id="gets">A finished lead magnet, not a draft</SectionTitle>
        <div className="mt-12 grid auto-rows-[360px] grid-cols-3 gap-5">
          <div className={cn(tile, "col-span-2 grid grid-cols-[250px_minmax(0,1fr)] items-center gap-4 p-8")}>
            <div>
              <p className="font-brand text-xl font-bold tracking-tight">A cover made for your topic</p>
              <p className="mt-3 text-md text-secondary">
                Four art directions, chosen from your tone. Shuffle until it feels right – never a template with your
                title pasted in.
              </p>
            </div>
            <div aria-hidden className="flex items-end justify-center gap-3">
              {shelfBooks.map((b, i) => (
                <Cover
                  key={b.id}
                  design={bookDesign(b)}
                  title={b.title}
                  author={b.author}
                  size="none"
                  className={cn(
                    "w-[140px] shrink-0",
                    i === 0 && "-rotate-3",
                    i === 1 && "-translate-y-2.5",
                    i === 2 && "rotate-3",
                  )}
                />
              ))}
            </div>
          </div>

          <div className={cn(tile, "flex flex-col justify-between bg-accent-subtle p-8")}>
            <p className="font-brand text-xl font-bold tracking-tight">Short enough that people finish it</p>
            <div>
              <p className="font-brand text-[96px] leading-[0.9] font-extrabold tracking-[-0.04em] text-accent-strong">
                ~15
              </p>
              <p className="mt-2.5 text-md">pages · 6 chapters · a 9-minute read</p>
            </div>
          </div>

          <ShotTile
            title="Fix it without starting over"
            text="Simpler, shorter, warmer – you see exactly what changed."
          >
            <ScreenCrop src="/landing/screens/review.webp" scale={0.53} x={250} y={56} />
          </ShotTile>
          <ShotTile title="A PDF ready to send" text="Cover, contents, page numbers and your call to action.">
            <ScreenCrop src="/landing/screens/final.webp" scale={0.53} x={150} y={100} />
          </ShotTile>
          <ShotTile title="A page that collects emails" text="One link. Readers leave their email, then get your book.">
            <ScreenCrop src="/landing/screens/share.webp" scale={0.53} x={300} y={60} />
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
    <div className={cn(tile, "mt-5 flex items-center justify-between gap-10 px-10 py-7")}>
      <div className="max-w-[300px]">
        <p className="font-brand text-lg font-bold tracking-tight">Works wherever a PDF and a link do</p>
        <p className="mt-1.5 text-base text-secondary">Sell it, send it to your list, or post the link.</p>
      </div>
      <ul className="flex items-center gap-9 text-md font-semibold text-secondary">
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
    <section aria-labelledby="examples" className="border-t border-default bg-subtle py-26">
      <div className={cn(box, "grid grid-cols-[380px_minmax(0,1fr)] items-center gap-16")}>
        <div>
          <Eyebrow>Examples</Eyebrow>
          <SectionTitle id="examples">Open a real one</SectionTitle>
          <p className="mt-4.5 text-lg text-secondary">
            Each book opens the page its readers would see – the email form and all.
          </p>
        </div>
        <div className="flex justify-center">
          <ExampleShelf />
        </div>
      </div>
    </section>
  );
}

/* ── Reviews (sample content) ────────────────────────────────────────────── */
const reviews = [
  {
    quote:
      "I’d been about to write a guide for two years. Primer got me a first draft over lunch – I spent the afternoon making it sound like me.",
    name: "Amara Okafor",
    role: "Nutrition coach",
    avatar: "amara",
  },
  {
    quote:
      "Rewrites come as suggestions, so I can see exactly what changed before I keep it. That’s the part that made me trust it.",
    name: "Hanna Berg",
    role: "UX writer",
    avatar: "hanna",
  },
  {
    quote: "From idea to sign-up page in one sitting. My list grew faster than with any webinar I’ve run.",
    name: "Marcus Bell",
    role: "Fitness coach",
    avatar: "marcus",
  },
  {
    quote: "Six short chapters is exactly the right size. People actually finish it – and reply to the last page.",
    name: "Daniel Reyes",
    role: "Freelance designer",
    avatar: "daniel",
  },
  {
    quote:
      "I tried two other generators. This is the first one that asked who the book was for – and it shows in every chapter.",
    name: "Sofia Marin",
    role: "Career coach",
    avatar: "sofia",
  },
  {
    quote: "The cover looked designed, not generated. I sent the PDF to clients the same afternoon.",
    name: "Lukas Novak",
    role: "Agency founder",
    avatar: "lukas",
  },
];

export function Reviews() {
  return (
    <section aria-labelledby="reviews" className="py-28">
      <div className={box}>
        <div className="flex items-end justify-between gap-12">
          <div>
            <Eyebrow>What people say</Eyebrow>
            <SectionTitle id="reviews" className="max-w-[620px]">
              Finished books, not abandoned drafts
            </SectionTitle>
          </div>
          <p className="max-w-[280px] text-right text-sm text-secondary">Sample reviews – Primer is a prototype.</p>
        </div>
        <ul className="mt-12 grid grid-cols-3 gap-5">
          {reviews.map((r) => (
            <li key={r.name}>
              <figure className="flex h-full flex-col justify-between gap-6 rounded-[20px] border border-default bg-surface p-7">
                <blockquote className="text-md leading-relaxed">“{r.quote}”</blockquote>
                <figcaption className="flex items-center gap-3">
                  <Image
                    src={`/landing/avatars/${r.avatar}.webp`}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                  <span className="flex flex-col">
                    <span className="text-base font-semibold">{r.name}</span>
                    <span className="text-sm text-secondary">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Closing call to action ──────────────────────────────────────────────── */
export function FinalCta({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="final" className="relative overflow-hidden bg-inverse py-30 text-center text-on-inverse">
      <div
        aria-hidden
        className="absolute top-3/5 left-1/2 h-[560px] w-[1100px] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)] opacity-45 blur-2xl"
      />
      <div className="relative flex flex-col items-center px-8">
        <h2 id="final" className="font-brand text-[60px] leading-[1.02] font-bold tracking-tight">
          You already know enough
          <br />
          to fill a book
        </h2>
        <p className="mt-4.5 text-lg opacity-75">It takes about five minutes to prove it.</p>
        <div className="mt-10 w-full max-w-[680px] text-primary">{children}</div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
const footLink = cn("rounded-sm text-base text-secondary hover:text-primary", focusRing);

export function Footer() {
  return (
    <footer className="flex items-center justify-between gap-8 border-t border-default px-16 py-10">
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
