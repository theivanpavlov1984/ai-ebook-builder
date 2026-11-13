"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bookDesign } from "@/components/book/BookPanel";
import { Cover } from "@/components/book/Cover";
import { Wordmark } from "@/components/shell/AppShell";
import { focusRing } from "@/components/ui/Button";
import { ctaText } from "@/lib/ai/generate";
import type { Book } from "@/lib/book/types";
import { cn } from "@/lib/cn";
import { decodeBook } from "@/lib/share";

export function SharedPage() {
  const [state, setState] = useState<{ status: "loading" } | { status: "invalid" } | { status: "ok"; book: Book }>({
    status: "loading",
  });

  useEffect(() => {
    const read = () => {
      const book = decodeBook(window.location.hash);
      setState(book ? { status: "ok", book } : { status: "invalid" });
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (state.status === "loading") return null;
  if (state.status === "invalid") {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-start gap-4 px-6 py-24">
        <Wordmark />
        <h1 className="mt-6 font-display text-2xl font-medium">This link looks incomplete</h1>
        <p className="text-md text-secondary">
          Shared books live entirely inside the link. If it was cut off when it was copied or pasted, ask the author to send it again.
        </p>
        <Link href="/" className={cn("inline-flex h-10 items-center rounded-md bg-inverse px-4 font-medium text-on-inverse", focusRing)}>
          Make your own book
        </Link>
      </main>
    );
  }
  return <SharedBook book={state.book} />;
}

export function SharedBook({ book }: { book: Book }) {
  const cta = ctaText(book);
  return (
    <main className="mx-auto max-w-[680px] px-6 py-16">
      <header className="flex flex-col items-center gap-6 text-center">
        <Cover design={bookDesign(book)} title={book.title} subtitle={book.subtitle} author={book.author} size="lg" />
        <div>
          <h1 className="font-display text-3xl font-medium">{book.title}</h1>
          {book.subtitle && <p className="mt-2 text-md text-secondary">{book.subtitle}</p>}
          <p className="mt-2 text-sm text-secondary">by {book.author}</p>
        </div>
      </header>

      <nav aria-label="Contents" className="mt-14 border-y border-default py-6">
        <p className="text-xs font-medium tracking-wider text-secondary uppercase">Contents</p>
        <ol className="mt-3 flex flex-col gap-2">
          {book.chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#ch-${i + 1}`} onClick={(e) => { e.preventDefault(); document.getElementById(`ch-${i + 1}`)?.scrollIntoView({ behavior: "smooth" }); }} className={cn("rounded-sm font-display text-md hover:text-accent-strong", focusRing)}>
                {i + 1}. {c.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {book.chapters.map((c, i) => (
        <section key={c.id} id={`ch-${i + 1}`} className="mt-14">
          <p className="text-xs font-medium tracking-wider text-secondary uppercase">Chapter {i + 1}</p>
          <h2 className="mt-1 font-display text-2xl font-medium">{c.title}</h2>
          <div className="mt-5 flex flex-col gap-4 font-display text-reader">
            {c.body.map((p, j) => (
              <p key={j} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16 rounded-lg border-l-4 border-accent bg-surface p-8">
        <p className="text-xs font-medium tracking-wider text-secondary uppercase">{cta.heading}</p>
        {cta.body.split("\n\n").map((p, i) => (
          <p key={i} className="mt-3 font-display text-lg">
            {p}
          </p>
        ))}
      </section>

      <footer className="mt-16 flex justify-center">
        <Link href="/" className={cn("rounded-sm text-sm text-secondary hover:text-primary", focusRing)}>
          Made with Primer – make your own book
        </Link>
      </footer>
    </main>
  );
}
