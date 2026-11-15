"use client";

import { Check, CircleAlert, Download, ExternalLink, Info, Link2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { bookDesign, Cover, ctaLink, ctaText, estimate, useBooks, type Book, useBook, shareUrl } from "@/entities/book";
import { AppShell, BookStepper, NotFound } from "@/widgets/layout";
import { Button, focusRing, Input, useToast } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { buildPdf, downloadPdf, PdfPreview } from "@/features/download-pdf";
import { BookPlan } from "./BookPlan";

type Download = (book: Book) => Promise<void>;
type Build = (book: Book) => Promise<Blob>;

export function FinalStep({
  id,
  download = downloadPdf,
  build = buildPdf,
}: {
  id: string;
  download?: Download;
  build?: Build;
}) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <Final id={id} download={download} build={build} />;
}

function PagePreview({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-[5/7] w-56 overflow-hidden rounded-l-[3px] rounded-r-sm bg-surface p-5 shadow-book">
        {children}
      </div>
      <figcaption className="text-xs text-secondary">{label}</figcaption>
    </figure>
  );
}

function Final({ id, download, build }: { id: string; download: Download; build: Build }) {
  const { show } = useToast();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const [busy, setBusy] = useState(false);
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
      <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-5 py-5 lg:gap-10 lg:px-10 lg:py-8">
        <BookStepper book={book} stage="final" />
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <section aria-label="Preview">
            <h1 className="font-brand text-2xl font-bold tracking-tight">Your book is ready to share</h1>
            <p className="mt-2 text-md text-secondary">
              {book.chapters.length} chapters · ~{pages} pages · {minutes}-minute read
            </p>
            <BookPlan book={book} />
            <div className="mt-8 flex flex-wrap gap-6">
              <figure className="flex flex-col gap-2">
                <Cover
                  design={bookDesign(book)}
                  title={title}
                  subtitle={book.subtitle}
                  author={book.author}
                  size="lg"
                />
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
                <div className="mt-2 flex flex-col gap-1.5 border-l-2 border-accent pl-2 font-display text-[10px] leading-snug">
                  <p className="whitespace-pre-line">{cta.body}</p>
                  {cta.link && <p className="break-all text-accent-strong underline">{cta.link.label}</p>}
                  {cta.signature && <p>{cta.signature}</p>}
                </div>
              </PagePreview>
            </div>
          </section>

          <aside aria-label="Finish" className="flex flex-col gap-6 rounded-lg border border-default bg-surface p-6">
            <div>
              <p className="text-sm font-semibold">Before you share</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li className="flex items-start gap-2">
                  {book.author.trim() ? (
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                  ) : (
                    <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
                  )}
                  <span>
                    {book.author.trim() ? `Author: ${book.author.trim()}` : "No author name on the cover yet."}{" "}
                    <Link
                      href={`/book/${id}/review`}
                      className={cn("rounded-sm text-accent-strong underline underline-offset-2", focusRing)}
                    >
                      {book.author.trim() ? "change" : "Add yours"}
                    </Link>
                  </span>
                </li>
                {/* A note, not a checkbox: ticking a box that gates nothing would only pretend to be a check. */}
                <li className="flex items-start gap-2">
                  <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />
                  <span>
                    AI can make mistakes, especially with facts and numbers – skim the chapters before you share.{" "}
                    <Link
                      href={`/book/${id}/review`}
                      className={cn("rounded-sm text-accent-strong underline underline-offset-2", focusRing)}
                    >
                      Read them in Review
                    </Link>
                  </span>
                </li>
              </ul>
            </div>

            <LastPage book={book} />

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => void onDownload()}
                loading={busy}
                icon={<Download aria-hidden className="size-4" />}
              >
                Download PDF
              </Button>
              <PdfPreview
                getBook={() => useBooks.getState().books[id]}
                build={build}
                footer={
                  <Button
                    onClick={() => void onDownload()}
                    loading={busy}
                    icon={<Download aria-hidden className="size-4" />}
                  >
                    Download PDF
                  </Button>
                }
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-default pt-5">
              <Button variant="secondary" onClick={() => void onCopy()} icon={<Link2 aria-hidden className="size-4" />}>
                Copy share link
              </Button>
              <p className="text-xs text-secondary">
                The link opens a landing page for your book – readers leave their email to get it.
              </p>
              {/* No server in the prototype: the whole book travels inside the link, so say what that costs. */}
              <p className="text-xs text-secondary">
                Prototype limit: with no server, the whole book rides inside the link (
                {link.length.toLocaleString("en-US")} characters). Some email and social apps cut links this long – if
                one does, send the PDF instead.
              </p>
              <label className="sr-only" htmlFor="share-link">
                Share link
              </label>
              <input
                id="share-link"
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className={cn(
                  "h-9 w-full truncate rounded-md border border-default bg-canvas px-3 text-xs text-secondary",
                  focusRing,
                )}
              />
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 self-start rounded-sm text-sm text-accent-strong",
                    focusRing,
                  )}
                >
                  Open the landing page <ExternalLink aria-hidden className="size-3.5" />
                </a>
              )}
            </div>

            <Link
              href={`/book/${id}/review`}
              className={cn("self-start rounded-sm text-sm text-secondary hover:text-primary", focusRing)}
            >
              ← Keep editing
            </Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * The closing page of a lead magnet is where readers go next: the call to action, a link that is clickable
 * in the PDF, and the brand it signs with. Edited here, next to its preview, like the cover in Review.
 */
function LastPage({ book }: { book: Book }) {
  const updateBook = useBooks((s) => s.updateBook);
  const [linkTouched, setLinkTouched] = useState(false);
  const url = book.ctaUrl ?? "";
  const link = ctaLink(url);
  const badLink = linkTouched && url.trim() !== "" && !link;

  return (
    <div className="flex flex-col gap-4 border-t border-default pt-5">
      <div>
        <p className="text-sm font-semibold">Last page</p>
        <p className="mt-1 text-sm text-secondary">
          Where readers go after the book. The link is clickable in the PDF.
        </p>
      </div>
      <Input
        label="What should readers do next?"
        placeholder="e.g. Book a free 20-minute call"
        value={book.cta}
        onChange={(e) => updateBook(book.id, { cta: e.target.value })}
      />
      <Input
        label="Link (optional)"
        placeholder="yoursite.com/call"
        inputMode="url"
        autoComplete="url"
        value={url}
        onChange={(e) => updateBook(book.id, { ctaUrl: e.target.value })}
        onBlur={() => setLinkTouched(true)}
        error={badLink ? "That doesn’t look like a web address. Try yoursite.com/call." : undefined}
        hint={link ? `Opens ${link.label}` : undefined}
      />
      <Input
        label="Brand or business (optional)"
        placeholder="e.g. Lind Studio"
        value={book.brand ?? ""}
        onChange={(e) => updateBook(book.id, { brand: e.target.value })}
      />
    </div>
  );
}
