"use client";

import { useSyncExternalStore } from "react";
import { useBooks } from "./store";

/** True once the persisted store has been read from localStorage (always false on the server). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useBooks.persist.onFinishHydration(onChange),
    () => useBooks.persist.hasHydrated(),
    () => false,
  );
}

/** A book by id, plus whether we can already say it doesn't exist. */
export function useBook(id: string) {
  const hydrated = useHydrated();
  const book = useBooks((s) => s.books[id]);
  return { book, hydrated, notFound: hydrated && !book };
}
