"use client";

import { CircleAlert, Shuffle, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cover,
  bookDesign,
  photoSrc,
  photosFor,
  useBooks,
  type Book,
  type CoverPhoto,
  type PhotoChoice,
  type PhotoLayout,
} from "@/entities/book";
import { simulate } from "@/shared/api";
import { Button, focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { readPhoto } from "../lib/readPhoto";

const PAGE = 6;

const layoutName: Record<PhotoLayout, string> = { full: "Full bleed", band: "Band", framed: "Framed" };

/** "Morning routines for remote workers" → "morning routines for remote…" – short enough for a heading. */
function shortTopic(topic: string): string {
  const t = topic.trim().toLowerCase();
  return t.length > 32 ? `${t.slice(0, 30).trimEnd()}…` : t;
}

/**
 * Photo artwork: photos suggested for the book's topic, more on request, or the user's own.
 * Suggesting is simulated like the rest of the AI (FLOW.md §5) – it can be slow and it can fail.
 * The first suggestion goes on the cover by itself, so switching to Photo always shows a result.
 */
export function PhotoPicker({ book }: { book: Book }) {
  const updateBook = useBooks((s) => s.updateBook);
  const { photos, matched } = useMemo(() => photosFor(`${book.topic} ${book.title}`), [book.topic, book.title]);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [uploadError, setUploadError] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);
  const bookId = book.id;

  function put(cover: Partial<Book["cover"]>) {
    const current = useBooks.getState().books[bookId];
    if (current) updateBook(bookId, { cover: { ...current.cover, ...cover } }, { snapshot: true });
  }

  // Set to false when the panel closes, so a late answer doesn't put a photo on a cover switched back to shapes.
  const open = useRef(true);

  function fetchPage(nextPage: number) {
    simulate("photos", () => nextPage, { ms: 700 })
      .then((p) => {
        if (!open.current) return;
        setPage(p);
        setStatus("ready");
        // Nothing chosen yet (first visit): put the best match on the cover.
        if (!useBooks.getState().books[bookId]?.cover.photo)
          put({ artwork: "photo", photo: { kind: "library", id: photos[0].id } });
      })
      .catch(() => {
        if (open.current) setStatus("failed");
      });
  }

  function suggest(nextPage: number) {
    setStatus("loading");
    fetchPage(nextPage);
  }

  // Suggest once when the panel opens (status starts as "loading").
  useEffect(() => {
    open.current = true;
    fetchPage(0);
    return () => {
      open.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = Array.from({ length: PAGE }, (_, i) => photos[(page * PAGE + i) % photos.length]);
  const chosen = book.cover.photo;
  const layout = book.cover.layout ?? "full";

  function choose(choice: PhotoChoice) {
    setUploadError(undefined);
    put({ artwork: "photo", photo: choice });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploadError(undefined);
    try {
      const { src, name } = await readPhoto(file);
      choose({ kind: "upload", src, name });
    } catch (e) {
      const quota = e instanceof DOMException && e.name === "QuotaExceededError";
      setUploadError(
        quota
          ? "This photo doesn't fit in this browser's storage. Try a smaller one."
          : e instanceof Error
            ? e.message
            : "Something went wrong. Try another photo.",
      );
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        {status === "failed" ? (
          <div role="alert" className="flex flex-col items-start gap-2 rounded-md bg-subtle p-3">
            <p className="text-sm font-medium">Photos didn&apos;t load</p>
            <p className="text-sm text-secondary">Your cover is safe. Try again in a moment.</p>
            <Button variant="secondary" size="sm" onClick={() => suggest(page)}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div aria-live="polite">
              {status === "loading" ? (
                <p className="text-sm font-medium">Finding photos for “{shortTopic(book.topic)}”…</p>
              ) : matched ? (
                <p className="text-sm font-medium">Photos for “{shortTopic(book.topic)}”</p>
              ) : (
                <>
                  <p className="text-sm font-medium">No photos for “{shortTopic(book.topic)}” yet</p>
                  <p className="mt-0.5 text-sm text-secondary">
                    Here are calm, general ones that suit any book – or upload your own.
                  </p>
                </>
              )}
            </div>
            {status === "loading" ? (
              <div aria-hidden className="grid grid-cols-3 gap-2">
                {Array.from({ length: PAGE }, (_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-md bg-subtle" />
                ))}
              </div>
            ) : (
              <PhotoGrid photos={visible} chosen={chosen} onChoose={(id) => choose({ kind: "library", id })} />
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={status === "loading"}
            icon={<Shuffle aria-hidden className="size-3.5" />}
            onClick={() => suggest(page + 1)}
          >
            More photos
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload aria-hidden className="size-3.5" />}
            onClick={() => fileInput.current?.click()}
          >
            Upload
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload your own photo"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>

        {uploadError && (
          <p role="alert" className="flex gap-2 text-sm text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {uploadError}
          </p>
        )}

        {chosen?.kind === "upload" && (
          <div className="flex items-center gap-3 rounded-md border border-default p-2">
            <Image
              src={chosen.src}
              alt=""
              width={36}
              height={48}
              unoptimized
              className="h-12 w-9 shrink-0 rounded-sm object-cover"
            />
            <div className="min-w-0 text-sm">
              <p className="truncate">{chosen.name}</p>
              <p className="text-xs text-secondary">
                Your photo stays on this device. Share links show shapes instead.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Layout</p>
        <div role="radiogroup" aria-label="Photo layout" className="grid grid-cols-3 gap-2">
          {(["full", "band", "framed"] as const).map((l) => {
            const checked = layout === l;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => put({ layout: l })}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-md border p-2",
                  checked ? "border-inverse bg-surface" : "border-transparent hover:border-default",
                  focusRing,
                )}
              >
                <Cover
                  design={bookDesign({ ...book, cover: { ...book.cover, artwork: "photo", layout: l } })}
                  title={book.title || book.topic}
                  size="none"
                  className="pointer-events-none w-full"
                />
                <span className="text-xs text-secondary">{layoutName[l]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PhotoGrid({
  photos,
  chosen,
  onChoose,
}: {
  photos: CoverPhoto[];
  chosen?: PhotoChoice;
  onChoose: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Cover photo" className="grid grid-cols-3 gap-2">
      {photos.map((p) => {
        const checked = chosen?.kind === "library" && chosen.id === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={p.alt}
            onClick={() => onChoose(p.id)}
            className={cn(
              "relative aspect-[3/4] overflow-hidden rounded-md border-2",
              checked ? "border-inverse" : "border-transparent hover:border-default",
              focusRing,
            )}
          >
            <Image src={photoSrc(p.id)} alt="" fill sizes="96px" className="object-cover" />
          </button>
        );
      })}
    </div>
  );
}
