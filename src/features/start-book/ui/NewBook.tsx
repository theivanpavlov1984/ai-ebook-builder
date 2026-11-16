"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { type Book, useBooks, useHydrated } from "@/entities/book";

/** A book nobody has described yet – opened from "Start my book" or "New book" and left as it was. */
function isBlank(book: Book): boolean {
  return !book.topic.trim() && book.chapters.length === 0;
}

/**
 * "Start my book" and "New book" land here: a blank book opens on Describe, inside the app. Waits for saved
 * books to load (creating one earlier would be overwritten by them), and reuses a blank book left from an
 * earlier visit instead of piling up empty ones.
 */
export function NewBook() {
  const router = useRouter();
  const hydrated = useHydrated();
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    const { books, createBook } = useBooks.getState();
    const id = Object.values(books).find(isBlank)?.id ?? createBook("");
    router.replace(`/book/${id}/describe`);
  }, [hydrated, router]);

  return null;
}
