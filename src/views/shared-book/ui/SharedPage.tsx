"use client";

import { Check, Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { bookDesign, Cover, ctaText, type Book, decodeBook } from "@/entities/book";
import { Wordmark, Button, focusRing, Input } from "@/shared/ui";
import { simulate } from "@/shared/api";
import { cn } from "@/shared/lib";
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
        <h1 className="mt-6 font-display text-2xl font-medium">This link looks incomplete</h1>
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
    <main className="mx-auto max-w-[1040px] px-8 py-14">
      <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-14">
        <Cover
          design={bookDesign(book)}
          title={book.title}
          subtitle={book.subtitle}
          author={book.author}
          size="none"
          className="w-72"
        />
        <div>
          <p className="text-xs font-medium tracking-wider text-accent-strong uppercase">Free eBook</p>
          <h1 className="mt-2 font-display text-3xl font-medium">{book.title}</h1>
          {pitch && <p className="mt-3 text-md text-secondary">{pitch}</p>}
          <p className="mt-2 text-sm text-secondary">by {book.author}</p>

          {status === "unlocked" ? (
            <div
              role="status"
              className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-default bg-surface p-5"
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
            <form onSubmit={submit} className="mt-8 flex flex-col gap-3" noValidate>
              <div className="flex items-start gap-3">
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
                <Button type="submit" loading={status === "sending"} className="mt-[26px]">
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

      <section className="mt-16 border-t border-default pt-10">
        <h2 className="font-display text-xl font-medium">What you’ll learn</h2>
        <ol className="mt-5 grid grid-cols-2 gap-x-10 gap-y-5">
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
    <article className="mx-auto mt-16 max-w-[680px]">
      {book.chapters.map((c, i) => (
        <section key={c.id} id={`ch-${i + 1}`} className="mt-14 first:mt-0">
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
    </article>
  );
}
