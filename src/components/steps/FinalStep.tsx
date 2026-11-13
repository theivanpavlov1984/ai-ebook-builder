"use client";

import { Check, Download, ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { bookDesign } from "@/components/book/BookPanel";
import { Cover } from "@/components/book/Cover";
import { AppShell } from "@/components/shell/AppShell";
import { Button, focusRing } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { useToast } from "@/components/ui/Toast";
import { ctaText } from "@/lib/ai/generate";
import { estimate } from "@/lib/book/estimate";
import { useBooks } from "@/lib/book/store";
import type { Book } from "@/lib/book/types";
import { useBook } from "@/lib/book/useHydrated";
import { cn } from "@/lib/cn";
import { downloadPdf } from "@/lib/pdf/download";
import { shareUrl } from "@/lib/share";
import { NotFound } from "./shared";

type Download = (book: Book) => Promise<void>;

export function FinalStep({ id, download = downloadPdf }: { id: string; download?: Download }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <Final id={id} download={download} />;
}

function PagePreview({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-[5/7] w-56 overflow-hidden rounded-r-sm rounded-l-[3px] bg-surface p-5 shadow-book">{children}</div>
      <figcaption className="text-xs text-secondary">{label}</figcaption>
    </figure>
  );
}

function Final({ id, download }: { id: string; download: Download }) {
  const { show } = useToast();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const [busy, setBusy] = useState(false);
  const [skimmed, setSkimmed] = useState(false);
  // Rendered only on the client (after hydration), so window is available here.
  const link = useMemo(() => shareUrl(book, window.location.origin), [book]);

  useEffect(() => {
    const b = useBooks.getState().books[id];
    if (b && !b.finalizedAt) updateBook(id, { finalizedAt: Date.now(), stage: "final" });
  }, [id, updateBook]);

  async function onDownload() {
    setBusy(true);
    try {
      await download(useBooks.getState().books[id]);
      show({ tone: "success", message: "Your PDF is downloading" });
    } catch {
      show({ tone: "error", message: "We couldn’t create the PDF this time. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function onCopy() {
    const url = shareUrl(useBooks.getState().books[id], window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      show({ tone: "success", message: "Link copied – anyone with it can read your book" });
    } catch {
      show({ tone: "error", message: "Couldn’t copy automatically – select the link below and copy it." });
    }
  }

  const title = book.title || book.topic;
  const first = book.chapters[0];
  const { pages, minutes } = estimate(book);
  const cta = ctaText(book);

  return (
    <AppShell active="new">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-10 py-8">
        <Stepper steps={["Describe", "Title", "Outline", "Build", "Review"]} current={5} />
        <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-12">
          <section aria-label="Preview">
            <h1 className="font-display text-2xl font-medium">Your book is ready to share</h1>
            <p className="mt-2 text-md text-secondary">
              {book.chapters.length} chapters · ~{pages} pages · {minutes}-minute read
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <figure className="flex flex-col gap-2">
                <Cover design={bookDesign(book)} title={title} subtitle={book.subtitle} author={book.author} size="lg" />
                <figcaption className="text-xs text-secondary">Cover</figcaption>
              </figure>
              <PagePreview label="Contents">
                <p className="text-[8px] tracking-wider text-secondary uppercase">Contents</p>
                <ol className="mt-2 flex flex-col gap-1.5 font-display text-[10px] leading-snug">
                  {book.chapters.map((c, i) => (
                    <li key={c.id}>
                      <span className="text-accent-strong">{String(i + 1).padStart(2, "0")}</span> {c.title}
                    </li>
                  ))}
                </ol>
              </PagePreview>
              {first && (
                <PagePreview label="Chapter 1">
                  <p className="text-[8px] tracking-wider text-secondary uppercase">Chapter 1</p>
                  <p className="mt-1 font-display text-sm leading-tight font-medium">{first.title}</p>
                  <p className="mt-2 font-display text-[8.5px] leading-relaxed">{first.body.slice(0, 3).join(" ")}</p>
                </PagePreview>
              )}
              <PagePreview label="Last page">
                <p className="text-[8px] tracking-wider text-secondary uppercase">{cta.heading}</p>
                <p className="mt-2 border-l-2 border-accent pl-2 font-display text-[10px] leading-snug whitespace-pre-line">{cta.body}</p>
              </PagePreview>
            </div>
          </section>

          <aside aria-label="Finish" className="flex flex-col gap-6 rounded-lg border border-default bg-surface p-6">
            <div>
              <p className="text-sm font-semibold">Before you share</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>
                    Author: {book.author}{" "}
                    <Link href={`/book/${id}/review`} className={cn("rounded-sm text-accent-strong underline underline-offset-2", focusRing)}>
                      change
                    </Link>
                  </span>
                </li>
                <li>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input type="checkbox" checked={skimmed} onChange={(e) => setSkimmed(e.target.checked)} className="mt-0.5 size-4 accent-accent" />
                    <span>I’ve skimmed the chapters – AI can make mistakes, especially with facts and numbers.</span>
                  </label>
                </li>
              </ul>
            </div>

            <Button onClick={() => void onDownload()} loading={busy} icon={<Download aria-hidden className="size-4" />}>
              Download PDF
            </Button>

            <div className="flex flex-col gap-2 border-t border-default pt-5">
              <Button variant="secondary" onClick={() => void onCopy()} icon={<Link2 aria-hidden className="size-4" />}>
                Copy share link
              </Button>
              <p className="text-xs text-secondary">
                The link opens a landing page for your book – readers leave their email to get it.
              </p>
              <label className="sr-only" htmlFor="share-link">
                Share link
              </label>
              <input id="share-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={cn("h-9 w-full truncate rounded-md border border-default bg-canvas px-3 text-xs text-secondary", focusRing)} />
              {link && (
                <a href={link} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-1.5 self-start rounded-sm text-sm text-accent-strong", focusRing)}>
                  Open the landing page <ExternalLink aria-hidden className="size-3.5" />
                </a>
              )}
            </div>

            <Link href={`/book/${id}/review`} className={cn("self-start rounded-sm text-sm text-secondary hover:text-primary", focusRing)}>
              ← Keep editing
            </Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
