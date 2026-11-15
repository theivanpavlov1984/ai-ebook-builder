"use client";

import { BookOpen, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Book } from "@/entities/book";
import { Button, Dialog, focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { buildPdf } from "../model/download";

type State = { status: "closed" } | { status: "loading" } | { status: "ready"; url: string } | { status: "failed" };

/**
 * "Flip through the PDF": builds the very file Download would save and shows it in the browser's own
 * PDF viewer, page by page, before anything is downloaded. `getBook` reads the latest book at open time.
 */
export function PdfPreview({
  getBook,
  build = buildPdf,
  footer,
}: {
  getBook: () => Book;
  build?: (book: Book) => Promise<Blob>;
  /** Actions under the preview, e.g. Download. */
  footer?: ReactNode;
}) {
  const [state, setState] = useState<State>({ status: "closed" });
  const request = useRef(0);

  // The blob URL lives as long as the preview shows it.
  const url = state.status === "ready" ? state.url : undefined;
  useEffect(() => (url ? () => URL.revokeObjectURL(url) : undefined), [url]);

  function open() {
    const id = ++request.current;
    setState({ status: "loading" });
    build(getBook())
      .then((blob) => {
        if (request.current === id) setState({ status: "ready", url: URL.createObjectURL(blob) });
      })
      .catch(() => {
        if (request.current === id) setState({ status: "failed" });
      });
  }

  function close() {
    request.current++;
    setState({ status: "closed" });
  }

  return (
    <>
      <Button variant="secondary" onClick={open} icon={<BookOpen aria-hidden className="size-4" />}>
        Flip through the PDF
      </Button>
      <Dialog
        open={state.status !== "closed"}
        onOpenChange={(o) => (o ? open() : close())}
        title="Your PDF, page by page"
        description="Exactly the file you'll download. Scroll, or use the viewer's page controls."
        size="lg"
        footer={state.status === "ready" ? footer : undefined}
      >
        <div className="h-[min(70vh,720px)] overflow-hidden rounded-md border border-default bg-subtle">
          {state.status === "loading" && (
            <p role="status" className="flex h-full items-center justify-center gap-2 text-sm text-secondary">
              <LoaderCircle aria-hidden className="size-4 animate-spin" /> Laying out your pages…
            </p>
          )}
          {state.status === "failed" && (
            <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-md font-medium">We couldn’t build the preview this time.</p>
              <p className="text-sm text-secondary">Your book is safe. Try again in a moment.</p>
              <Button variant="secondary" size="sm" onClick={open}>
                Try again
              </Button>
            </div>
          )}
          {state.status === "ready" && (
            <iframe title="PDF preview" src={`${state.url}#view=Fit`} className="block h-full w-full" />
          )}
        </div>
        {/* A browser without a built-in PDF viewer shows an empty frame; a new tab still opens the file. */}
        {state.status === "ready" && (
          <p className="mt-3 text-sm text-secondary">
            Nothing showing?{" "}
            <a
              href={state.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("rounded-sm text-accent-strong underline underline-offset-2", focusRing)}
            >
              Open the PDF in a new tab
            </a>
          </p>
        )}
      </Dialog>
    </>
  );
}
