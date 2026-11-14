import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeBook, useBooks, type Book, type Chapter } from "@/entities/book";
import { SharedPage } from "./SharedPage";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

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

describe("SharedPage", () => {
  it("shows a friendly message for an incomplete link", () => {
    window.location.hash = "#abc";
    render(<SharedPage />);
    expect(screen.getByText(/this link looks incomplete/i)).toBeInTheDocument();
  });

  function openLanding() {
    const id = newBook();
    window.location.hash = `#${encodeBook(st().books[id])}`;
    render(<SharedPage subscribeMs={0} download={vi.fn().mockResolvedValue(undefined)} />);
  }

  it("is a lead-magnet landing page: cover, pitch and an email form – content locked", () => {
    openLanding();
    expect(screen.getByRole("heading", { level: 1, name: "Bread Before Breakfast" })).toBeInTheDocument();
    expect(screen.getByText("Chapter title 2")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.queryByText("Paragraph two of 3.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /made with primer/i })).toBeInTheDocument();
  });

  it("asks for a valid email", async () => {
    openLanding();
    await userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /get the ebook/i }));
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    expect(screen.queryByText("Paragraph two of 3.")).not.toBeInTheDocument();
  });

  it("unlocks the book and the PDF after a valid email", async () => {
    openLanding();
    await userEvent.type(screen.getByLabelText(/email/i), "reader@example.com");
    await userEvent.click(screen.getByRole("button", { name: /get the ebook/i }));
    expect(await screen.findByText("Paragraph two of 3.")).toBeInTheDocument();
    expect(screen.getByText(/it's yours/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });
});
