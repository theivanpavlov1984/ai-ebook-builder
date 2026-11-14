"use client";

import { Library } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProgressList } from "@/components/book/ProgressList";
import { Wordmark } from "@/components/shell/AppShell";
import { focusRing } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ContinueCard } from "./ContinueCard";
import { ExampleShelf } from "./ExampleShelf";
import { LivePreview } from "./LivePreview";
import { StartForm } from "./StartForm";

const gets = [
  ["A cover made for your topic", "Its style follows the feel you choose – not a template with your title pasted in."],
  ["Six short, practical chapters", "About 15 pages: long enough to be useful, short enough that people finish it."],
  ["A PDF ready to send", "Your fonts, a contents page and page numbers. Attach it, upload it, sell it."],
  ["A page that collects emails", "Share one link. Readers leave their email, then get your book."],
] as const;

/** Small, inert pieces of the real interface – showing each step instead of describing it. */
function MiniInput() {
  return (
    <div aria-hidden className="rounded-md border border-default bg-surface px-3 py-2.5 font-display text-md">
      Calm mornings for busy founders<span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-accent align-middle" />
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
      <span className="flex-1 rounded-sm border border-default px-2.5 py-2 text-sm text-secondary">reader@email.com</span>
      <span className="rounded-sm bg-inverse px-3 py-2 text-sm font-medium text-on-inverse">Get the eBook</span>
    </div>
  );
}

const steps = [
  { title: "Tell us your idea", text: "One sentence about what you know and who it’s for.", Visual: MiniInput },
  { title: "We write and design it", text: "Chapters, cover and layout in about a minute. Read along as it’s written.", Visual: MiniProgress },
  { title: "Share it, get subscribers", text: "Send the PDF, or share a page where readers sign up to get it.", Visual: MiniSignup },
];

export function Landing() {
  const [topic, setTopic] = useState("");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-[1160px] items-center justify-between px-8 py-6">
        <Link href="/" aria-label="Primer home" className={cn("rounded-sm", focusRing)}>
          <Wordmark />
        </Link>
        <Link href="/books" className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-base text-secondary hover:text-primary", focusRing)}>
          <Library aria-hidden className="size-4" /> My books
        </Link>
      </header>

      <main>
        <section id="start" className="mx-auto grid max-w-[1160px] grid-cols-[minmax(0,1fr)_420px] items-center gap-20 px-8 pt-10 pb-24">
          <div className="flex max-w-[600px] flex-col gap-7">
            <h1 className="font-display text-[64px] leading-[1.02] font-medium tracking-[-0.01em]">
              Turn what you know into a free eBook
            </h1>
            <p className="text-md text-secondary">
              For coaches, experts and creators who want more subscribers. Write one sentence – Primer writes the chapters,
              designs the cover and gives you a PDF and a sign-up page. About five minutes, no writing skills needed.
            </p>
            <StartForm value={topic} onValueChange={setTopic} />
            <p className="text-sm text-secondary">Free, no sign-up.</p>
            <ContinueCard />
          </div>
          <LivePreview topic={topic} />
        </section>

        <section aria-labelledby="how" className="border-y border-default bg-surface">
          <div className="mx-auto max-w-[1160px] px-8 py-20">
            <h2 id="how" className="font-display text-2xl font-medium">
              How it works
            </h2>
            <ol className="mt-12 grid grid-cols-3 gap-12">
              {steps.map(({ title, text, Visual }, i) => (
                <li key={title} className="flex flex-col gap-4">
                  <span className="font-display text-3xl leading-none text-accent">{i + 1}</span>
                  <p className="font-display text-xl font-medium">{title}</p>
                  <p className="text-base text-secondary">{text}</p>
                  <div className="mt-2">
                    <Visual />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="gets" className="mx-auto grid max-w-[1160px] grid-cols-[320px_minmax(0,1fr)] gap-16 px-8 py-20">
          <h2 id="gets" className="font-display text-2xl font-medium">
            What you get
          </h2>
          <dl className="grid grid-cols-2 gap-x-12">
            {gets.map(([title, text]) => (
              <div key={title} className="border-t border-default py-6">
                <dt className="font-display text-lg font-medium">{title}</dt>
                <dd className="mt-1 text-base text-secondary">{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="examples" className="bg-subtle">
          <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-16 px-8 py-20">
            <div className="max-w-[360px]">
              <h2 id="examples" className="font-display text-2xl font-medium">
                See real examples
              </h2>
              <p className="mt-3 text-base text-secondary">Each one opens the page its readers would see – email form and all.</p>
            </div>
            <ExampleShelf />
          </div>
        </section>

        <section className="mx-auto flex max-w-[1160px] flex-col items-start gap-6 px-8 py-24">
          <p className="max-w-[720px] font-display text-3xl leading-tight font-medium">
            You already know enough to fill a book. It takes about five minutes to prove it.
          </p>
          <a
            href="#start"
            onClick={() => setTimeout(() => document.querySelector<HTMLTextAreaElement>("#start textarea")?.focus(), 300)}
            className={cn("inline-flex h-12 items-center rounded-md bg-inverse px-6 text-md font-medium text-on-inverse hover:opacity-90", focusRing)}
          >
            Start my book
          </a>
        </section>
      </main>
    </div>
  );
}
