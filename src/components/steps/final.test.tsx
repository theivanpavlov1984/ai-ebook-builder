import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SharedPage } from "@/components/reader/SharedPage";
import { ToastProvider } from "@/components/ui/Toast";
import { useBooks } from "@/lib/book/store";
import type { Book, Chapter } from "@/lib/book/types";
import { decodeBook, encodeBook } from "@/lib/share";
import { FinalStep } from "./FinalStep";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const st = () => useBooks.getState();

const chapters: Chapter[] = [1, 2, 3].map((i) => ({
  id: `c${i}`,
  title: `Chapter title ${i}`,
  summary: `Summary ${i}`,
  body: [`Paragraph one of ${i}.`, `Paragraph two of ${i}.`],
  status: "done",
  versions: [],
}));

function newBook(patch: Partial<Book> = {}) {
  const id = st().createBook("Sourdough baking for busy parents");
  st().updateBook(id, {
    audience: "Parents",
    title: "Bread Before Breakfast",
    subtitle: "Sourdough for busy mornings",
    cta: "Join my newsletter at example.com",
    stage: "final",
    mood: "calm",
    chapters,
    cover: { direction: "organic", variant: 2, status: "done" },
    ...patch,
  });
  return id;
}

beforeEach(() => {
  useBooks.setState({ books: {}, history: {} });
});

describe("share links", () => {
  it("round-trips everything a reader needs", () => {
    const id = newBook();
    const book = st().books[id];
    const back = decodeBook(encodeBook(book))!;
    expect(back).toMatchObject({
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      mood: book.mood,
      cta: book.cta,
      cover: { direction: "organic", variant: 2 },
    });
    expect(back.chapters.map((c) => [c.title, c.summary, c.body])).toEqual(chapters.map((c) => [c.title, c.summary, c.body]));
  });

  it("rejects cut, edited or empty links", () => {
    const id = newBook();
    const code = encodeBook(st().books[id]);
    expect(decodeBook(code.slice(0, Math.floor(code.length / 2)))).toBeNull();
    expect(decodeBook(code.replace(/[a-z]/, "!"))).toBeNull();
    expect(decodeBook("")).toBeNull();
    expect(decodeBook("#")).toBeNull();
  });
});

describe("FinalStep", () => {
  it("downloads the PDF with a loading state", async () => {
    let resolve!: () => void;
    const download = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const id = newBook();
    wrap(<FinalStep id={id} download={download} />);
    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));
    expect(download).toHaveBeenCalledWith(expect.objectContaining({ id }));
    expect(screen.getByRole("button", { name: /download pdf/i })).toHaveAttribute("aria-busy", "true");
    resolve();
    await waitFor(() => expect(screen.getByRole("button", { name: /download pdf/i })).not.toHaveAttribute("aria-busy"));
  });

  it("explains a failed download and lets the user try again", async () => {
    const download = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(undefined);
    const id = newBook();
    wrap(<FinalStep id={id} download={download} />);
    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn.t create the pdf/i);
    await userEvent.click(screen.getByRole("button", { name: /download pdf/i }));
    expect(download).toHaveBeenCalledTimes(2);
  });

  it("copies a share link that opens this book", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const id = newBook();
    wrap(<FinalStep id={id} download={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /copy share link/i }));
    const url = writeText.mock.calls[0][0] as string;
    expect(url).toMatch(/\/b#/);
    expect(decodeBook(url.split("#")[1])?.title).toBe("Bread Before Breakfast");
    expect(await screen.findByText(/link copied/i)).toBeInTheDocument();
  });

  it("marks the book as finalized", () => {
    const id = newBook();
    wrap(<FinalStep id={id} download={vi.fn()} />);
    expect(st().books[id].finalizedAt).toBeGreaterThan(0);
  });
});

describe("SharedPage", () => {
  it("shows a friendly message for an incomplete link", () => {
    window.location.hash = "#abc";
    render(<SharedPage />);
    expect(screen.getByText(/this link looks incomplete/i)).toBeInTheDocument();
  });

  it("renders the shared book", () => {
    const id = newBook();
    window.location.hash = `#${encodeBook(st().books[id])}`;
    render(<SharedPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Bread Before Breakfast" })).toBeInTheDocument();
    expect(screen.getByText("Paragraph two of 3.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /made with primer/i })).toBeInTheDocument();
  });
});
