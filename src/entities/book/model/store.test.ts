import { beforeEach, describe, expect, it } from "vitest";
import { useBooks } from "./store";
import type { Chapter } from "./types";

const s = () => useBooks.getState();

function chapter(id: string, body: string[] = []): Chapter {
  return { id, title: `Chapter ${id}`, summary: "", body, status: body.length ? "done" : "idle", versions: [] };
}

beforeEach(() => {
  useBooks.setState({ books: {}, history: {} });
});

describe("book store", () => {
  it("createBook returns an id and a describe-stage book with defaults", () => {
    const id = s().createBook("Design systems for small teams");
    const b = s().books[id];
    expect(b.stage).toBe("describe");
    expect(b.topic).toBe("Design systems for small teams");
    expect(b.mood).toBe("practical");
    expect(b.author).toBe("Ivan Pavlov");
    expect(b.chapters).toEqual([]);
    expect(b.cover).toEqual({ direction: "editorial", variant: 0, status: "idle" });
  });

  it("updateBook merges the patch and bumps updatedAt", async () => {
    const id = s().createBook("X topic here");
    const before = s().books[id].updatedAt;
    await new Promise((r) => setTimeout(r, 2));
    s().updateBook(id, { title: "New" });
    expect(s().books[id].title).toBe("New");
    expect(s().books[id].updatedAt).toBeGreaterThan(before);
  });

  it("rewriteChapter keeps versions and undoChapter restores them in order", () => {
    const id = s().createBook("X topic here");
    s().updateBook(id, { chapters: [chapter("c1", ["A"])] });
    s().rewriteChapter(id, "c1", ["B"]);
    s().rewriteChapter(id, "c1", ["C"]);
    expect(s().books[id].chapters[0].body).toEqual(["C"]);
    expect(s().undoChapter(id, "c1")).toBe(true);
    expect(s().books[id].chapters[0].body).toEqual(["B"]);
    expect(s().undoChapter(id, "c1")).toBe(true);
    expect(s().books[id].chapters[0].body).toEqual(["A"]);
    expect(s().undoChapter(id, "c1")).toBe(false);
    expect(s().books[id].chapters[0].body).toEqual(["A"]);
  });

  it("undo restores the last snapshot only when one exists", () => {
    const id = s().createBook("X topic here");
    expect(s().undo(id)).toBe(false);
    s().updateBook(id, { chapters: [chapter("c1", ["A"])] });
    s().updateBook(id, { chapters: [] }, { snapshot: true });
    expect(s().books[id].chapters).toHaveLength(0);
    expect(s().undo(id)).toBe(true);
    expect(s().books[id].chapters).toHaveLength(1);
  });

  it("updateChapter patches one chapter only", () => {
    const id = s().createBook("X topic here");
    s().updateBook(id, { chapters: [chapter("c1"), chapter("c2")] });
    s().updateChapter(id, "c2", { status: "failed" });
    expect(s().books[id].chapters.map((c) => c.status)).toEqual(["idle", "failed"]);
  });

  it("deleteBook removes the book and its history", () => {
    const id = s().createBook("X topic here");
    s().deleteBook(id);
    expect(s().books[id]).toBeUndefined();
  });
});
