import type { Chapter } from "./types";

const WORDS_PER_PAGE = 250;
const WORDS_PER_MINUTE = 200;
const PAGES_PER_OUTLINED_CHAPTER = 2;
const FIXED_PAGES = 3; // cover, contents, call-to-action

const countWords = (body: string[]) => body.join(" ").split(/\s+/).filter(Boolean).length;

export function estimate(book: { chapters: Chapter[] }): { pages: number; minutes: number } {
  let pages = FIXED_PAGES;
  let words = 0;
  for (const c of book.chapters) {
    const w = countWords(c.body);
    words += w;
    pages += w > 0 ? Math.ceil(w / WORDS_PER_PAGE) : PAGES_PER_OUTLINED_CHAPTER;
  }
  return { pages, minutes: Math.ceil(words / WORDS_PER_MINUTE) };
}
