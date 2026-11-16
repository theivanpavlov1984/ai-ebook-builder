"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CONTENT_ID, ChipGroup, SkipLink, Wordmark, focusRing } from "@/shared/ui";
import { cn, useInView, usePlayClock, usePrefersReducedMotion } from "@/shared/lib";
import { ContinueCard, type Mood } from "@/entities/book";
import { LivePreview } from "@/widgets/live-preview";
import { StartForm } from "@/features/start-book";
import { heroExamples, heroFrame } from "../model/demos";
import { Sweep } from "./demos";
import { Reviews } from "./reviews";
import { Examples, FinalCta, Footer, HowItWorks, IdeasShelf, Questions, WatchSection, WhatYouGet } from "./sections";

const tones: { value: Mood; label: string }[] = [
  { value: "practical", label: "Practical" },
  { value: "inspiring", label: "Inspiring" },
  { value: "calm", label: "Calm" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
];

const avatars = ["amara", "marcus", "hanna", "daniel", "sofia"];

const navLink = cn("rounded-sm text-base text-secondary hover:text-primary", focusRing);

export function Landing() {
  const [topic, setTopic] = useState("");
  const [mood, setMood] = useState<Mood>("practical");

  // Until the visitor takes over, the empty prompt plays example topics and the tone and cover follow them.
  // It stops for good on the first focus, typed letter or tone click; it pauses off screen.
  const [tookOver, setTookOver] = useState(false);
  const reduced = usePrefersReducedMotion();
  const [heroRef, heroInView] = useInView<HTMLElement>({ threshold: 0.3 });
  const demo = !tookOver && !topic && !reduced;
  const frame = heroFrame(usePlayClock(demo && heroInView));
  const shownMood = demo ? frame.mood : mood;
  // The whole topic of the book the cover shows – the current example once its first letters are typed.
  const current = heroExamples[frame.index].topic;
  const coverTopic = current.toLowerCase().startsWith(frame.cover.toLowerCase()) ? current : frame.cover;

  return (
    <div className="relative min-h-screen bg-canvas">
      <SkipLink />
      {/* Soft warm light behind the hero – decoration only. */}
      {/* It fades in, drifts slowly, and sinks away as the page scrolls (see hero-glow in globals.css). */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1080px] overflow-hidden">
        <div className="hero-glow-scroll absolute inset-0">
          <div className="hero-glow-enter absolute inset-0">
            <div className="hero-glow-drift absolute top-36 -left-64 h-[820px] w-[640px] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-warm),transparent)] opacity-85 blur-3xl" />
            <div className="hero-glow-drift-reverse absolute top-4 -right-60 h-[860px] w-[680px] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-deep),transparent)] opacity-60 blur-3xl" />
            <div className="absolute top-[420px] left-1/2 h-[420px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent-subtle),transparent)] blur-2xl" />
          </div>
        </div>
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
        {/* Into the app: a new book opens on Describe. The prompt below stays the quick way in. */}
        <Link
          href="/new"
          className={cn(
            "inline-flex h-10 items-center rounded-full bg-inverse px-4 text-base font-medium text-on-inverse hover:opacity-90 lg:px-5",
            focusRing,
          )}
        >
          Start my book
        </Link>
      </header>

      <main id={CONTENT_ID} tabIndex={-1} className="outline-hidden">
        <section
          ref={heroRef}
          id="start"
          className="relative flex flex-col items-center px-5 pt-6 pb-14 text-center lg:px-8"
        >
          <p className="inline-flex min-h-8 items-center gap-2 rounded-full border border-default bg-surface/60 px-3.5 py-1 text-sm text-secondary">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Lead-magnet eBooks for coaches, experts and creators
          </p>
          <h1 className="mt-5 max-w-[780px] font-brand text-3xl font-bold tracking-tight lg:text-hero">
            Turn what you know into <Sweep immediate>a free eBook</Sweep>
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
              value={shownMood}
              onChange={(m) => {
                setTookOver(true);
                setMood(m);
              }}
              appearance="segmented"
            />
          </div>
          <StartForm
            value={topic}
            onValueChange={(v) => {
              setTookOver(true);
              setTopic(v);
            }}
            mood={mood}
            placeholder={demo ? frame.text : undefined}
            onFieldFocus={() => setTookOver(true)}
          />
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
            <LivePreview
              topic={demo ? frame.cover : topic}
              mood={shownMood}
              demo={demo}
              designFrom={demo ? coverTopic : undefined}
            />
          </div>
        </section>
        <IdeasShelf />
        <WatchSection />
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
