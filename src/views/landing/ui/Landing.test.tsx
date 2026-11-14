import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBooks, decodeBook, sampleBooks } from "@/entities/book";
import { Landing } from "./Landing";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

beforeEach(() => useBooks.setState({ books: {}, history: {} }));

/** The hero field – the closing call to action repeats it lower on the page. */
const field = () => screen.getAllByLabelText(/what's your book about/i)[0];

describe("Landing", () => {
  it("says what the service is in one line and starts right there", () => {
    render(<Landing />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/free ebook/i);
    expect(field()).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /start my book/i }).length).toBeGreaterThan(0);
  });

  it("repeats the start field at the end, without the example topics", () => {
    render(<Landing />);
    expect(screen.getAllByLabelText(/what's your book about/i)).toHaveLength(2);
    expect(screen.getAllByRole("group", { name: /try an example/i })).toHaveLength(1);
  });

  it("marks the reviews as samples", () => {
    render(<Landing />);
    expect(screen.getByText(/sample reviews/i)).toBeInTheDocument();
  });

  it("explains how it works in three steps", () => {
    render(<Landing />);
    const section = screen.getByRole("region", { name: /how it works/i });
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);
  });

  it("lists what you get", () => {
    render(<Landing />);
    const section = screen.getByRole("region", { name: /what you get/i });
    expect(within(section).getByText(/a pdf ready to send/i)).toBeInTheDocument();
    expect(within(section).getByText(/collects emails/i)).toBeInTheDocument();
    expect(within(section).getByText(/works wherever a pdf and a link do/i)).toBeInTheDocument();
  });

  it("example topics fill the field in one click", async () => {
    render(<Landing />);
    const examples = screen.getByRole("group", { name: /try an example/i });
    const first = within(examples).getAllByRole("button")[0];
    await userEvent.click(first);
    expect(field()).toHaveValue(first.textContent);
  });

  it("shows the visitor's own book as they type", async () => {
    render(<Landing />);
    const preview = screen.getByRole("region", { name: /preview/i });
    expect(within(preview).getByText(/example/i)).toBeInTheDocument();
    await userEvent.type(field(), "Sourdough baking for busy parents");
    expect(await within(preview).findByRole("img", { name: /Sourdough Baking for Busy Parents/ })).toBeInTheDocument();
  });

  it("the tone sets the style of the visitor's cover and is saved on the new book", async () => {
    render(<Landing />);
    const preview = screen.getByRole("region", { name: /preview/i });
    // Example covers around it are decorative; the visitor's cover is the only image the preview exposes.
    const yours = () => within(preview).getByRole("img").getAttribute("data-direction");
    expect(within(preview).getByRole("img")).toHaveAccessibleName(/Morning Routines for Remote Workers/);
    expect(yours()).toBe("editorial");
    await userEvent.click(screen.getByRole("radio", { name: "Bold" }));
    expect(yours()).toBe("typographic");

    await userEvent.type(field(), "Sourdough baking for busy parents");
    await userEvent.click(screen.getAllByRole("button", { name: /start my book/i })[0]);
    const [book] = Object.values(useBooks.getState().books);
    expect(book.mood).toBe("bold");
    expect(book.cover.direction).toBe("typographic");
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
