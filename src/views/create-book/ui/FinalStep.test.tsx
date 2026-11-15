import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/shared/ui";
import { useBooks, type Book, type Chapter, decodeBook, encodeBook } from "@/entities/book";
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
    expect(back.chapters.map((c) => [c.title, c.summary, c.body])).toEqual(
      chapters.map((c) => [c.title, c.summary, c.body]),
    );
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

  it("edits the last page: a call to action, a link that must be a web address, and a brand", async () => {
    const id = newBook();
    wrap(<FinalStep id={id} />);
    const link = screen.getByLabelText(/^link/i);
    await userEvent.type(link, "not a link");
    await userEvent.tab();
    expect(screen.getByText(/doesn.t look like a web address/i)).toBeInTheDocument();
    await userEvent.clear(link);
    await userEvent.type(link, "breadclub.com/join");
    expect(screen.getByText("Opens breadclub.com/join")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/brand or business/i), "Bread Club");
    expect(st().books[id]).toMatchObject({ ctaUrl: "breadclub.com/join", brand: "Bread Club" });
    // The last-page preview shows the link and the signature.
    expect(screen.getAllByText("breadclub.com/join").length).toBeGreaterThan(0);
    expect(screen.getByText("– Bread Club")).toBeInTheDocument();
  });

  it("shows how the book was planned: audience, voice, shape and ending", () => {
    const id = newBook();
    wrap(<FinalStep id={id} />);
    const plan = screen.getByRole("region", { name: /how primer planned your book/i });
    expect(plan).toHaveTextContent("Parents");
    expect(plan).toHaveTextContent("Calm");
    expect(plan).toHaveTextContent("3 chapters");
    expect(plan).toHaveTextContent("Join my newsletter at example.com");
  });

  it("previews the real PDF page by page, with loading, failure and retry", async () => {
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
    const id = newBook();
    const build = vi
      .fn()
      .mockRejectedValueOnce(new Error("layout failed"))
      .mockResolvedValueOnce(new Blob(["%PDF"], { type: "application/pdf" }));
    wrap(<FinalStep id={id} build={build} />);

    await userEvent.click(screen.getByRole("button", { name: /flip through the pdf/i }));
    const dialog = screen.getByRole("dialog", { name: /your pdf, page by page/i });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/couldn.t build the preview/i);

    await userEvent.click(within(dialog).getByRole("button", { name: /try again/i }));
    const frame = await within(dialog).findByTitle("PDF preview");
    expect(frame).toHaveAttribute("src", "blob:preview#view=Fit");
    expect(build).toHaveBeenLastCalledWith(expect.objectContaining({ id }));
    expect(within(dialog).getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /open the pdf in a new tab/i })).toHaveAttribute(
      "href",
      "blob:preview",
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview"));
  });
});
