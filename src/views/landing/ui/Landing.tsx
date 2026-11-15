"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CONTENT_ID, ChipGroup, SkipLink, Wordmark, focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { ContinueCard, type Mood } from "@/entities/book";
import { LivePreview } from "@/widgets/live-preview";
import { StartForm } from "@/features/start-book";
import {
  BrandStrip,
  Examples,
  FinalCta,
  Footer,
  HowItWorks,
  IdeasShelf,
  Questions,
  Reviews,
  WatchSection,
  WhatYouGet,
} from "./sections";

const tones: { value: Mood; label: string }[] = [
  { value: "practical", label: "Practical" },
  { value: "inspiring", label: "Inspiring" },
  { value: "calm", label: "Calm" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
];

const avatars = ["amara", "marcus", "hanna", "daniel", "sofia"];

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
      <SkipLink />
      {/* Soft warm light behind the hero – decoration only. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1080px] overflow-hidden">
        <div className="absolute top-36 -left-64 h-[820px] w-[640px] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-warm),transparent)] opacity-85 blur-3xl" />
        <div className="absolute top-4 -right-60 h-[860px] w-[680px] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-deep),transparent)] opacity-60 blur-3xl" />
        <div className="absolute top-[420px] left-1/2 h-[420px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent-subtle),transparent)] blur-2xl" />
      </div>

      {/* Phones and tablets get one column; from lg (1024 px) up the layout is the desktop design. */}
      <header className="relative mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-16 lg:py-5">
        <Link href="/" aria-label="Primer home" className={cn("rounded-sm", focusRing)}>
          <Wordmark className="text-2xl" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
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
            "inline-flex h-10 items-center rounded-full bg-inverse px-4 text-base font-medium text-on-inverse hover:opacity-90 lg:px-5",
            focusRing,
          )}
        >
          Start my book
        </a>
      </header>

      <main id={CONTENT_ID} tabIndex={-1} className="outline-hidden">
        <section id="start" className="relative flex flex-col items-center px-5 pt-6 pb-14 text-center lg:px-8">
          <p className="inline-flex min-h-8 items-center gap-2 rounded-full border border-default bg-surface/60 px-3.5 py-1 text-sm text-secondary">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Lead-magnet eBooks for coaches, experts and creators
          </p>
          <h1 className="mt-5 max-w-[780px] font-brand text-3xl font-bold tracking-tight lg:text-hero">
            Turn what you know into a free eBook
          </h1>
          <p className="mt-5 max-w-[620px] text-md text-secondary lg:text-lg">
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
          <div className="mt-5 flex items-center gap-3">
            <div aria-hidden className="flex">
              {avatars.map((a, i) => (
                <Image
                  key={a}
                  src={`/landing/avatars/${a}.webp`}
                  alt=""
                  width={32}
                  height={32}
                  className={cn("size-8 rounded-full border-2 border-canvas object-cover", i > 0 && "-ml-2.5")}
                />
              ))}
            </div>
            <p className="text-sm text-secondary">
              Built for <strong className="font-semibold text-primary">experts with no time to write</strong>
            </p>
          </div>
          <div className="mt-7">
            <LivePreview topic={topic} mood={mood} />
          </div>
        </section>

        <BrandStrip />
        <WatchSection />
        <IdeasShelf />
        <HowItWorks />
        <WhatYouGet />
        <Examples />
        <Reviews />
        <Questions />
        <FinalCta>
          <StartForm mood={mood} examples={false} />
        </FinalCta>
      </main>
      <Footer />
    </div>
  );
}
