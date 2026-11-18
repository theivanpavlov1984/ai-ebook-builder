import { type Book, useBooks } from "@/entities/book";

/** A book nobody has described yet – opened from "Start my book" or "New book" and left as it was. */
export function isBlank(book: Book): boolean {
  return !book.topic.trim() && book.chapters.length === 0;
}

/** The book "Start my book" opens: a blank one left from an earlier visit, or a new one. */
export function blankBookId(): string {
  const { books, createBook } = useBooks.getState();
  return Object.values(books).find(isBlank)?.id ?? createBook("");
}

export const describePath = (id: string) => `/book/${id}/describe`;
