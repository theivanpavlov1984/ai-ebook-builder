import type { Chapter } from "./types";

/*
 * Page counts follow the exported PDF, measured on its 420 × 588 pt page: the chapter heading leaves room for
 * about 150 words on a chapter's first page, and each following page holds about 320. So a 220-word chapter
 * takes two pages, as it does in the PDF – the outline's estimate and the finished book's agree.
 */
const FIRST_PAGE_WORDS = 150;
const WORDS_PER_PAGE = 320;
const WORDS_PER_MINUTE = 200;
const PAGES_PER_OUTLINED_CHAPTER = 2;
const FIXED_PAGES = 3; // cover, contents, call-to-action

const countWords = (body: string[]) => body.join(" ").split(/\s+/).filter(Boolean).length;

const chapterPages = (words: number) => 1 + Math.ceil(Math.max(0, words - FIRST_PAGE_WORDS) / WORDS_PER_PAGE);

export function estimate(book: { chapters: Chapter[] }): { pages: number; minutes: number } {
  let pages = FIXED_PAGES;
  let words = 0;
  for (const c of book.chapters) {
    const w = countWords(c.body);
    words += w;
    pages += w > 0 ? chapterPages(w) : PAGES_PER_OUTLINED_CHAPTER;
  }
  return { pages, minutes: Math.ceil(words / WORDS_PER_MINUTE) };
}
