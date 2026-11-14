import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { directionsForMood, useBooks, type Chapter } from "@/entities/book";
import { ToastProvider } from "@/shared/ui";
import { setFailures } from "@/shared/api";
import { BuildStep, buildTabTitle, type Timing } from "./BuildStep";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));

const fast: Timing = { chapterMs: 0, coverMs: 0, cps: Infinity };
const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const st = () => useBooks.getState();

const chapters = (n: number): Chapter[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    title: `Chapter title ${i + 1}`,
    summary: "s",
    body: [],
    status: "idle",
    versions: [],
  }));

function newBook(patch = {}) {
  const id = st().createBook("Sourdough baking for busy parents");
  st().updateBook(id, {
    audience: "Parents",
    title: "Bread",
    stage: "build",
    chapters: chapters(3),
    mood: "calm",
    ...patch,
  });
  return id;
}

beforeEach(() => {
  push.mockReset();
  useBooks.setState({ books: {}, history: {} });
});
afterEach(() => setFailures([]));

const allDone = (id: string) => {
  const b = st().books[id];
  return b.chapters.every((c) => c.status === "done") && b.cover.status === "done";
};

describe("buildTabTitle", () => {
  it("counts chapters, then the cover, then says the book is ready", () => {
    expect(buildTabTitle(0, 6, false)).toBe("Writing 1 of 6 · Primer");
    expect(buildTabTitle(2, 6, false)).toBe("Writing 3 of 6 · Primer");
    expect(buildTabTitle(6, 6, false)).toBe("Designing the cover · Primer");
    expect(buildTabTitle(6, 6, true)).toBe("✓ Your book is ready · Primer");
  });
});

describe("BuildStep", () => {
  it("shows progress in the tab title and restores it on leaving", async () => {
    document.title = "Primer";
    const id = newBook();
    const { unmount } = wrap(<BuildStep id={id} timing={fast} />);
    await waitFor(() => expect(document.title).toBe("✓ Your book is ready · Primer"));
    unmount();
    expect(document.title).toBe("Primer");
  });

  it("writes every chapter and the cover, then offers the review", async () => {
    const id = newBook();
    wrap(<BuildStep id={id} timing={fast} />);
    await waitFor(() => expect(allDone(id)).toBe(true));
    for (const c of st().books[id].chapters) expect(c.body.length).toBeGreaterThan(0);
    await userEvent.click(await screen.findByRole("button", { name: /review your book/i }));
    expect(st().books[id].stage).toBe("review");
    expect(push).toHaveBeenCalledWith(`/book/${id}/review`);
  });

  it("is honest that the AI is simulated, except for the hand-written demo topic", async () => {
    const custom = newBook();
    const { unmount } = wrap(<BuildStep id={custom} timing={fast} />);
    expect(screen.getByText(/the ai is simulated/i)).toBeInTheDocument();
    await waitFor(() => expect(allDone(custom)).toBe(true));
    unmount();
    const demo = newBook({ topic: "Design systems for small teams" });
    wrap(<BuildStep id={demo} timing={fast} />);
    expect(screen.queryByText(/the ai is simulated/i)).not.toBeInTheDocument();
    await waitFor(() => expect(allDone(demo)).toBe(true));
  });

  it("marks a failed chapter, keeps going, and retries only that chapter", async () => {
    setFailures(["ch2"]);
    const id = newBook();
    wrap(<BuildStep id={id} timing={fast} />);
    await waitFor(() => expect(st().books[id].chapters[1].status).toBe("failed"));
    await waitFor(() => expect(st().books[id].chapters[2].status).toBe("done"));
    const row = (await screen.findByText(/Chapter title 2/, { selector: "li *" })).closest("li")!;
    await userEvent.click(within(row).getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(allDone(id)).toBe(true));
  });

  it("falls back to the next cover style when the cover fails", async () => {
    setFailures(["cover"]);
    const id = newBook({ cover: { direction: directionsForMood("calm")[0], variant: 0, status: "idle" } });
    wrap(<BuildStep id={id} timing={fast} />);
    await waitFor(() => expect(allDone(id)).toBe(true));
    expect(st().books[id].cover.direction).toBe(directionsForMood("calm")[1]);
  });

  it("resumes after a reload without rewriting finished chapters", async () => {
    const done = (c: Chapter): Chapter => ({ ...c, body: [`kept ${c.id}`], status: "done" });
    const [a, b, c] = chapters(3);
    const id = newBook({ chapters: [done(a), done(b), { ...c, status: "writing" }] });
    wrap(<BuildStep id={id} timing={fast} />);
    expect(screen.getByText(/picking up where you left off/i)).toBeInTheDocument();
    await waitFor(() => expect(allDone(id)).toBe(true));
    expect(st().books[id].chapters[0].body).toEqual(["kept c1"]);
    expect(st().books[id].chapters[1].body).toEqual(["kept c2"]);
  });

  it("shows honest progress while writing", async () => {
    const id = newBook();
    wrap(<BuildStep id={id} timing={{ chapterMs: 50, coverMs: 0, cps: Infinity }} />);
    expect(await screen.findByText(/writing chapter 1 of 3/i)).toBeInTheDocument();
    await waitFor(() => expect(allDone(id)).toBe(true));
  });
});
