"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCard } from "@/components/book/BookCard";
import { bookDesign } from "@/components/book/BookPanel";
import { focusRing } from "@/components/ui/Button";
import { useBooks } from "@/lib/book/store";
import { useHydrated } from "@/lib/book/useHydrated";
import { cn } from "@/lib/cn";

export function MyBooks() {
  const router = useRouter();
  const hydrated = useHydrated();
  const books = useBooks((s) => s.books);
  if (!hydrated) return null;
  const list = Object.values(books).sort((a, b) => b.updatedAt - a.updatedAt);

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-strong p-10">
        <p className="font-display text-xl font-medium">No books yet</p>
        <p className="text-base text-secondary">Your first one takes about five minutes.</p>
        <Link
          href="/"
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
    <div className="flex flex-wrap gap-6">
      {list.map((b) => (
        <BookCard
          key={b.id}
          title={b.title || b.topic}
          status={b.finalizedAt ? "finalized" : "draft"}
          design={bookDesign(b)}
          author={b.author}
          onOpen={() => router.push(`/book/${b.id}/${b.finalizedAt ? "final" : b.stage}`)}
        />
      ))}
    </div>
  );
}
