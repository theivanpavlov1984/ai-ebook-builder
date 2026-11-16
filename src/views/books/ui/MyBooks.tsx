"use client";

import { PenLine, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Book, BookCard, bookDesign, type Stage, useBooks, useHydrated } from "@/entities/book";
import { Button, Dialog, focusRing, Input, useToast } from "@/shared/ui";
import { cn } from "@/shared/lib";

const stageLabel: Record<Stage, string> = {
  describe: "Describing",
  title: "Choosing a title",
  outline: "Planning chapters",
  build: "Writing",
  review: "In review",
  final: "Ready to share",
};

const DAY = 24 * 60 * 60 * 1000;

/** "today", "yesterday", "3 days ago", then a date – enough to tell recent books from old ones. */
export function editedAgo(at: number, now = Date.now()): string {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  if (at >= startOfToday) return "today";
  const days = Math.ceil((startOfToday - at) / DAY);
  if (days <= 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MyBooks() {
  const router = useRouter();
  const { show } = useToast();
  const hydrated = useHydrated();
  const books = useBooks((s) => s.books);
  const updateBook = useBooks((s) => s.updateBook);
  const deleteBook = useBooks((s) => s.deleteBook);
  const restoreBook = useBooks((s) => s.restoreBook);
  const [renaming, setRenaming] = useState<Book>();
  const [name, setName] = useState("");
  if (!hydrated) return null;
  // A book opened from "New book" and left blank isn't a book yet.
  const list = Object.values(books)
    .filter((b) => b.topic.trim() || b.chapters.length)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  function remove(book: Book) {
    deleteBook(book.id);
    // Deleting is one click, so it is undoable rather than confirmed.
    show({
      tone: "info",
      message: `“${book.title || book.topic}” deleted`,
      action: { label: "Undo", onClick: () => restoreBook(book) },
    });
  }

  function rename() {
    if (!renaming || !name.trim()) return;
    updateBook(renaming.id, { title: name.trim() });
    setRenaming(undefined);
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-strong p-10">
        <p className="font-brand text-xl font-bold tracking-tight">No books yet</p>
        <p className="text-base text-secondary">Your first one takes about five minutes.</p>
        <Link
          href="/new"
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-md bg-inverse px-4 font-medium text-on-inverse",
            focusRing,
          )}
        >
          <Plus aria-hidden className="size-4" /> Start your first book
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-6">
        {list.map((b) => {
          const title = b.title || b.topic;
          return (
            <BookCard
              key={b.id}
              title={title}
              status={b.finalizedAt ? "finalized" : "draft"}
              design={bookDesign(b)}
              author={b.author}
              meta={`${stageLabel[b.finalizedAt ? "final" : b.stage]} · edited ${editedAgo(b.updatedAt)}`}
              onOpen={() => router.push(`/book/${b.id}/${b.finalizedAt ? "final" : b.stage}`)}
              actions={
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Rename ${title}`}
                    icon={<PenLine aria-hidden className="size-3.5" />}
                    onClick={() => {
                      setName(title);
                      setRenaming(b);
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${title}`}
                    icon={<Trash2 aria-hidden className="size-3.5" />}
                    onClick={() => remove(b)}
                  >
                    Delete
                  </Button>
                </>
              }
            />
          );
        })}
      </div>

      <Dialog
        open={renaming !== undefined}
        onOpenChange={(open) => !open && setRenaming(undefined)}
        title="Rename your book"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenaming(undefined)}>
              Cancel
            </Button>
            <Button type="submit" form="rename-book" disabled={!name.trim()}>
              Save
            </Button>
          </>
        }
      >
        <form
          id="rename-book"
          onSubmit={(e) => {
            e.preventDefault();
            rename();
          }}
        >
          <Input label="Title" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </form>
      </Dialog>
    </>
  );
}
