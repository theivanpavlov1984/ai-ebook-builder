import { stageOrder, type Book, type Stage } from "./types";

/** Moves the book's stage forward only (going back to edit never "un-finishes" later steps). */
export function forwardStage(book: Pick<Book, "stage">, next: Stage): Stage {
  return stageOrder.indexOf(next) > stageOrder.indexOf(book.stage) ? next : book.stage;
}

export function newChapterId(): string {
  return `ch-${Math.random().toString(36).slice(2, 9)}`;
}
