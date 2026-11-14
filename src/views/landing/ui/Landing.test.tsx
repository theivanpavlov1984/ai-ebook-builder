import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBooks, decodeBook, sampleBooks } from "@/entities/book";
import { Landing } from "./Landing";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

beforeEach(() => useBooks.setState({ books: {}, history: {} }));

describe("Landing", () => {
  it("says what the service is in one line and starts right there", () => {
    render(<Landing />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/free ebook/i);
    expect(screen.getByLabelText(/what's your book about/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /start my book/i }).length).toBeGreaterThan(0);
  });

  it("explains how it works in three steps", () => {
    render(<Landing />);
    const section = screen.getByRole("region", { name: /how it works/i });
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);
  });

  it("lists what you get", () => {
    render(<Landing />);
    const section = screen.getByRole("region", { name: /what you get/i });
    expect(within(section).getByText(/pdf/i)).toBeInTheDocument();
    expect(within(section).getByText(/collects emails/i)).toBeInTheDocument();
  });

  it("example topics fill the field in one click", async () => {
    render(<Landing />);
    const examples = screen.getByRole("group", { name: /try an example/i });
    const first = within(examples).getAllByRole("button")[0];
    await userEvent.click(first);
    expect(screen.getByLabelText(/what's your book about/i)).toHaveValue(first.textContent);
  });

  it("shows the visitor's own book as they type", async () => {
    render(<Landing />);
    const preview = screen.getByRole("region", { name: /preview/i });
    expect(within(preview).getByText(/example/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/what's your book about/i), "Sourdough baking for busy parents");
    expect(await within(preview).findByRole("img", { name: /Sourdough Baking for Busy Parents/ })).toBeInTheDocument();
    expect(within(preview).getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
  });

  it("'Try another style' changes the cover style", async () => {
    render(<Landing />);
    const preview = screen.getByRole("region", { name: /preview/i });
    const before = preview.querySelector("svg[data-direction]")!.getAttribute("data-direction");
    await userEvent.click(within(preview).getByRole("button", { name: /try another style/i }));
    expect(preview.querySelector("svg[data-direction]")!.getAttribute("data-direction")).not.toBe(before);
  });

  it("example books open a real sample you can read", () => {
    render(<Landing />);
    const links = screen.getAllByRole("link", { name: /peek inside/i });
    expect(links).toHaveLength(3);
    const book = decodeBook(links[0].getAttribute("href")!.split("#")[1]);
    expect(book?.chapters.length).toBeGreaterThan(0);
  });
});

describe("sampleBooks", () => {
  it("are three complete books with written chapters", () => {
    const books = sampleBooks();
    expect(books).toHaveLength(3);
    for (const b of books) {
      expect(b.chapters.length).toBeGreaterThanOrEqual(6);
      expect(b.chapters.every((c) => c.body.length > 0)).toBe(true);
    }
  });
});
