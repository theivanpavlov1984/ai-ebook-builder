import { draftOutline, newChapterId, suggestAudiences, suggestTitles, type Book, type Chapter } from "@/entities/book";

export const toChapter = (c: { title: string; summary: string }): Chapter => ({
  id: newChapterId(),
  title: c.title,
  summary: c.summary,
  body: [],
  status: "idle",
  versions: [],
});

/**
 * "Write it now": the choices the Title and Outline steps would suggest by default,
 * made in one go. Anything the user already set is kept.
 */
export function fastTrack(
  book: Pick<Book, "topic" | "audience" | "mood" | "title" | "chapters">,
  opts: { redraft?: boolean } = {},
): Pick<Book, "audience" | "title" | "chapters"> {
  const audience = book.audience.trim() || suggestAudiences(book.topic)[0] || "Beginners";
  const brief = { topic: book.topic, audience, mood: book.mood };
  const title = (!opts.redraft && book.title.trim()) || suggestTitles(brief, 0)[0].title;
  const chapters = !opts.redraft && book.chapters.length ? book.chapters : draftOutline(brief).map(toChapter);
  return { audience, title, chapters };
}
