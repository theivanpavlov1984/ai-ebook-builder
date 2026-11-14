"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Book, Chapter } from "./types";

const HISTORY_LIMIT = 20;

type BooksState = {
  books: Record<string, Book>;
  /** Book snapshots for undo, newest last. */
  history: Record<string, Book[]>;
  createBook: (topic: string) => string;
  updateBook: (id: string, patch: Partial<Book>, opts?: { snapshot?: boolean }) => void;
  updateChapter: (id: string, chapterId: string, patch: Partial<Chapter>) => void;
  rewriteChapter: (id: string, chapterId: string, body: string[]) => void;
  undoChapter: (id: string, chapterId: string) => boolean;
  undo: (id: string) => boolean;
  deleteBook: (id: string) => void;
};

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const useBooks = create<BooksState>()(
  persist(
    (set, get) => {
      const patchBook = (id: string, fn: (b: Book) => Book) =>
        set((s) => (s.books[id] ? { books: { ...s.books, [id]: { ...fn(s.books[id]), updatedAt: Date.now() } } } : s));

      return {
        books: {},
        history: {},

        createBook: (topic) => {
          const id = newId();
          const now = Date.now();
          const book: Book = {
            id,
            createdAt: now,
            updatedAt: now,
            stage: "describe",
            topic,
            audience: "",
            mood: "practical",
            cta: "",
            title: "",
            subtitle: "",
            author: "Ivan Pavlov",
            chapters: [],
            cover: { direction: "editorial", variant: 0, status: "idle" },
          };
          set((s) => ({ books: { ...s.books, [id]: book } }));
          return id;
        },

        updateBook: (id, patch, opts) => {
          const current = get().books[id];
          if (!current) return;
          if (opts?.snapshot) {
            set((s) => ({
              history: { ...s.history, [id]: [...(s.history[id] ?? []), current].slice(-HISTORY_LIMIT) },
            }));
          }
          patchBook(id, (b) => ({ ...b, ...patch }));
        },

        updateChapter: (id, chapterId, patch) =>
          patchBook(id, (b) => ({
            ...b,
            chapters: b.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)),
          })),

        rewriteChapter: (id, chapterId, body) =>
          patchBook(id, (b) => ({
            ...b,
            chapters: b.chapters.map((c) =>
              c.id === chapterId ? { ...c, versions: [...c.versions, c.body], body, status: "done" } : c,
            ),
          })),

        undoChapter: (id, chapterId) => {
          const ch = get().books[id]?.chapters.find((c) => c.id === chapterId);
          if (!ch || ch.versions.length === 0) return false;
          const previous = ch.versions[ch.versions.length - 1];
          patchBook(id, (b) => ({
            ...b,
            chapters: b.chapters.map((c) =>
              c.id === chapterId ? { ...c, body: previous, versions: c.versions.slice(0, -1) } : c,
            ),
          }));
          return true;
        },

        undo: (id) => {
          const stack = get().history[id] ?? [];
          if (stack.length === 0) return false;
          const previous = stack[stack.length - 1];
          set((s) => ({
            books: { ...s.books, [id]: { ...previous, updatedAt: Date.now() } },
            history: { ...s.history, [id]: stack.slice(0, -1) },
          }));
          return true;
        },

        deleteBook: (id) =>
          set((s) => {
            const books = { ...s.books };
            const history = { ...s.history };
            delete books[id];
            delete history[id];
            return { books, history };
          }),
      };
    },
    {
      name: "primer:v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ books: s.books, history: s.history }),
    },
  ),
);
