"use client";

import { Check, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { bookDesign, ChapterText, Cover, ctaText, type Book, decodeBook } from "@/entities/book";
import { Wordmark, Button, focusRing, Input } from "@/shared/ui";
import { simulate } from "@/shared/api";
import { cn, useTabTitle } from "@/shared/lib";
import { downloadPdf } from "@/features/download-pdf";

type Download = (book: Book) => Promise<void>;
type Props = { subscribeMs?: number; download?: Download };

export function SharedPage({ subscribeMs = 700, download = downloadPdf }: Props) {
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
        <h1 className="mt-6 font-brand text-2xl font-bold tracking-tight">This link looks incomplete</h1>
        <p className="text-md text-secondary">
          Shared books live entirely inside the link. If it was cut off when it was copied or pasted, ask the author to
          send it again.
        </p>
        <Link
          href="/"
          className={cn(
            "inline-flex h-10 items-center rounded-md bg-inverse px-4 font-medium text-on-inverse",
            focusRing,
          )}
        >
          Make your own book
        </Link>
      </main>
    );
  }
  return <LeadLanding book={state.book} subscribeMs={subscribeMs} download={download} />;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The share link is a lead-magnet landing page: readers leave an email to get the book. */
function LeadLanding({ book, subscribeMs, download }: { book: Book; subscribeMs: number; download: Download }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<"idle" | "sending" | "unlocked">("idle");
  const [downloading, setDownloading] = useState(false);
  const pitch = book.subtitle || book.chapters[0]?.summary || "";
  // The reader came for this book: name it in the tab, with the author when there is one.
  useTabTitle(book.author.trim() ? `${book.title} by ${book.author.trim()}` : book.title);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter a valid email so we can send you the book.");
      return;
    }
    setError(undefined);
    setStatus("sending");
    try {
      await simulate("subscribe", () => null, { ms: subscribeMs });
      setStatus("unlocked");
    } catch {
      setStatus("idle");
      setError("Something went wrong on our side – please try again.");
    }
  }

  async function onDownload() {
    setDownloading(true);
    try {
      await download(book);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1040px] px-5 py-8 md:px-8 md:py-14">
      {/* Phones first: readers usually open a shared link from a message or an email on their phone. */}
      <section className="grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
        <Cover
          design={bookDesign(book)}
          title={book.title}
          subtitle={book.subtitle}
          author={book.author}
          size="none"
          className="mx-auto w-44 md:w-72"
        />
        <div>
          <p className="text-xs font-medium tracking-wider text-accent-strong uppercase">Free eBook</p>
          <h1 className="mt-2 font-display text-2xl font-medium md:text-3xl">{book.title}</h1>
          {pitch && <p className="mt-3 text-md text-secondary">{pitch}</p>}
          {book.author.trim() && <p className="mt-2 text-sm text-secondary">by {book.author}</p>}

          {status === "unlocked" ? (
            <div
              role="status"
              className="mt-6 flex flex-col items-start gap-4 rounded-lg border border-default bg-surface p-5 md:mt-8"
            >
              <p className="flex items-center gap-2 font-medium">
                <Check aria-hidden className="size-4 text-success" /> It&apos;s yours – start reading below, or take the
                PDF with you.
              </p>
              <Button
                onClick={() => void onDownload()}
                loading={downloading}
                icon={<Download aria-hidden className="size-4" />}
              >
                Download PDF
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-3 md:mt-8" noValidate>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <Input
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(undefined);
                    }}
                    error={error}
                  />
                </div>
                <Button type="submit" loading={status === "sending"} className="w-full sm:mt-[26px] sm:w-auto">
                  Get the eBook
                </Button>
              </div>
              <p className="text-xs text-secondary">
                Free, instant access. Prototype: your email isn’t sent or stored anywhere.
              </p>
            </form>
          )}
        </div>
      </section>

      <section className="mt-12 border-t border-default pt-8 md:mt-16 md:pt-10">
        <h2 className="font-display text-xl font-medium">What you’ll learn</h2>
        <ol className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {book.chapters.map((c, i) => (
            <li key={c.id} className="flex gap-3">
              <span className="font-display text-lg text-accent-strong">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-display text-md font-medium">{c.title}</p>
                <p className="text-sm text-secondary">{c.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {status === "unlocked" && <Reader book={book} />}

      <footer className="mt-16 flex justify-center">
        <Link href="/" className={cn("rounded-sm text-sm text-secondary hover:text-primary", focusRing)}>
          Made with Primer – make your own book
        </Link>
      </footer>
    </main>
  );
}

function Reader({ book }: { book: Book }) {
  const cta = ctaText(book);
  return (
    <article className="mx-auto mt-12 max-w-[680px] md:mt-16">
      {book.chapters.map((c, i) => (
        <section key={c.id} id={`ch-${i + 1}`} className="mt-14 first:mt-0">
          <p className="text-xs font-medium tracking-wider text-secondary uppercase">Chapter {i + 1}</p>
          <h2 className="mt-1 font-display text-xl font-medium md:text-2xl">{c.title}</h2>
          <ChapterText body={c.body} className="mt-5" />
        </section>
      ))}
      <section className="mt-16 rounded-lg border-l-4 border-accent bg-surface p-5 md:p-8">
        <p className="text-xs font-medium tracking-wider text-secondary uppercase">{cta.heading}</p>
        {cta.body.split("\n\n").map((p, i) => (
          <p key={i} className="mt-3 font-display text-lg">
            {p}
          </p>
        ))}
        {cta.link && (
          <a
            href={cta.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 rounded-sm font-medium break-all text-accent-strong underline underline-offset-2",
              focusRing,
            )}
          >
            {cta.link.label} <ExternalLink aria-hidden className="size-4 shrink-0" />
          </a>
        )}
        {cta.signature && <p className="mt-4 font-display text-lg">{cta.signature}</p>}
      </section>
    </article>
  );
}
