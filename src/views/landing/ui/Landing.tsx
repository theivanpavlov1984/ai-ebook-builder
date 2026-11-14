"use client";

import Link from "next/link";
import { useState } from "react";
import { ChipGroup, ProgressList, Wordmark, focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { ContinueCard, type Mood } from "@/entities/book";
import { ExampleShelf } from "@/widgets/example-shelf";
import { LivePreview } from "@/widgets/live-preview";
import { StartForm } from "@/features/start-book";

const gets = [
  ["A cover made for your topic", "Its style follows the feel you choose – not a template with your title pasted in."],
  ["Six short, practical chapters", "About 15 pages: long enough to be useful, short enough that people finish it."],
  ["A PDF ready to send", "Your fonts, a contents page and page numbers. Attach it, upload it, sell it."],
  ["A page that collects emails", "Share one link. Readers leave their email, then get your book."],
] as const;

/** Small, inert pieces of the real interface – showing each step instead of describing it. */
function MiniInput() {
  return (
    <div aria-hidden className="rounded-md border border-default bg-surface px-3 py-2.5 text-md">
      Calm mornings for busy founders
      <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-accent align-middle" />
    </div>
  );
}

function MiniProgress() {
  return (
    <div aria-hidden className="rounded-md border border-default bg-surface p-4">
      <ProgressList
        items={[
          { id: "a", label: "Outline", status: "done" },
          { id: "b", label: "Chapter 1", status: "done" },
          { id: "c", label: "Chapter 2", status: "working" },
          { id: "d", label: "Cover", status: "waiting" },
        ]}
      />
    </div>
  );
}

function MiniSignup() {
  return (
    <div aria-hidden className="flex gap-2 rounded-md border border-default bg-surface p-3">
      <span className="flex-1 rounded-sm border border-default px-2.5 py-2 text-sm text-secondary">
        reader@email.com
      </span>
      <span className="rounded-sm bg-inverse px-3 py-2 text-sm font-medium text-on-inverse">Get the eBook</span>
    </div>
  );
}

const steps = [
  { title: "Tell us your idea", text: "One sentence about what you know and who it’s for.", Visual: MiniInput },
  {
    title: "We write and design it",
    text: "Chapters, cover and layout in about a minute. Read along as it’s written.",
    Visual: MiniProgress,
  },
  {
    title: "Share it, get subscribers",
    text: "Send the PDF, or share a page where readers sign up to get it.",
    Visual: MiniSignup,
  },
];

const tones: { value: Mood; label: string }[] = [
  { value: "practical", label: "Practical" },
  { value: "inspiring", label: "Inspiring" },
  { value: "calm", label: "Calm" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
];

/** Move to the hero and put the cursor in the topic field. */
function focusStart() {
  setTimeout(() => document.querySelector<HTMLTextAreaElement>("#start textarea")?.focus(), 300);
}

const navLink = cn("rounded-sm text-base text-secondary hover:text-primary", focusRing);

export function Landing() {
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState<Mood>("practical");

  return (
    <div className="relative min-h-screen bg-canvas">
      {/* Soft warm light behind the hero – decoration only. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1080px] overflow-hidden">
        <div className="absolute top-36 -left-64 h-[820px] w-[640px] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-warm),transparent)] opacity-85 blur-3xl" />
        <div className="absolute top-4 -right-60 h-[860px] w-[680px] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-deep),transparent)] opacity-60 blur-3xl" />
        <div className="absolute top-[420px] left-1/2 h-[420px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent-subtle),transparent)] blur-2xl" />
      </div>

      <header className="relative mx-auto flex max-w-[1280px] items-center justify-between px-16 py-5">
        <Link href="/" aria-label="Primer home" className={cn("rounded-sm", focusRing)}>
          <Wordmark className="text-2xl" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-9">
          <a href="#how" className={navLink}>
            How it works
          </a>
          <a href="#examples" className={navLink}>
            Examples
          </a>
          <Link href="/books" className={navLink}>
            My books
          </Link>
        </nav>
        <a
          href="#start"
          onClick={focusStart}
          className={cn(
            "inline-flex h-10 items-center rounded-full bg-inverse px-5 text-base font-medium text-on-inverse hover:opacity-90",
            focusRing,
          )}
        >
          Start my book
        </a>
      </header>

      <main>
        <section id="start" className="relative flex flex-col items-center px-8 pt-6 pb-16 text-center">
          <p className="inline-flex h-8 items-center gap-2 rounded-full border border-default bg-surface/60 px-3.5 text-sm text-secondary">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Lead-magnet eBooks for coaches, experts and creators
          </p>
          <h1 className="mt-5 max-w-[780px] font-brand text-hero font-bold">Turn what you know into a free eBook</h1>
          <p className="mt-5 max-w-[620px] text-lg text-secondary">
            Write one sentence. Primer writes the chapters, designs the cover and gives you a PDF and a sign-up page –
            in about five minutes.
          </p>
          <div className="mt-7 mb-3">
            <ChipGroup
              label="Tone"
              options={tones}
              mode="single"
              value={mood}
              onChange={setMood}
              appearance="segmented"
            />
          </div>
          <StartForm value={topic} onValueChange={setTopic} mood={mood} />
          <div className="mt-4 w-full max-w-[760px] text-left empty:hidden">
            <ContinueCard />
          </div>
          <div className="mt-7">
            <LivePreview topic={topic} mood={mood} />
          </div>
        </section>

        <section aria-labelledby="how" className="border-y border-default bg-surface">
          <div className="mx-auto max-w-[1160px] px-8 py-20">
            <h2 id="how" className="font-brand text-2xl font-bold tracking-tight">
              How it works
            </h2>
            <ol className="mt-12 grid grid-cols-3 gap-12">
              {steps.map(({ title, text, Visual }, i) => (
                <li key={title} className="flex flex-col gap-4">
                  <span className="font-brand text-3xl leading-none font-bold text-accent">{i + 1}</span>
                  <p className="font-brand text-xl font-bold tracking-tight">{title}</p>
                  <p className="text-base text-secondary">{text}</p>
                  <div className="mt-2">
                    <Visual />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="gets"
          className="mx-auto grid max-w-[1160px] grid-cols-[320px_minmax(0,1fr)] gap-16 px-8 py-20"
        >
          <h2 id="gets" className="font-brand text-2xl font-bold tracking-tight">
            What you get
          </h2>
          <dl className="grid grid-cols-2 gap-x-12">
            {gets.map(([title, text]) => (
              <div key={title} className="border-t border-default py-6">
                <dt className="font-brand text-lg font-bold tracking-tight">{title}</dt>
                <dd className="mt-1 text-base text-secondary">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="examples" className="bg-subtle">
          <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-16 px-8 py-20">
            <div className="max-w-[360px]">
              <h2 id="examples" className="font-brand text-2xl font-bold tracking-tight">
                See real examples
              </h2>
              <p className="mt-3 text-base text-secondary">
                Each one opens the page its readers would see – email form and all.
              </p>
            </div>
            <ExampleShelf />
          </div>
        </section>

        <section className="mx-auto flex max-w-[1160px] flex-col items-start gap-6 px-8 py-24">
          <p className="max-w-[720px] font-brand text-3xl leading-tight font-bold tracking-tight">
            You already know enough to fill a book. It takes about five minutes to prove it.
          </p>
          <a
            href="#start"
            onClick={() =>
              setTimeout(() => document.querySelector<HTMLTextAreaElement>("#start textarea")?.focus(), 300)
            }
            className={cn(
              "inline-flex h-12 items-center rounded-md bg-inverse px-6 text-md font-medium text-on-inverse hover:opacity-90",
              focusRing,
            )}
          >
            Start my book
          </a>
        </section>
      </main>
    </div>
  );
}
