import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { setFailures } from "@/lib/ai/simulate";
import { useBooks } from "@/lib/book/store";
import type { Chapter } from "@/lib/book/types";
import { DescribeStep } from "./DescribeStep";
import { OutlineStep } from "./OutlineStep";
import { TitleStep } from "./TitleStep";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));

const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const st = () => useBooks.getState();

function newBook(patch = {}) {
  const id = st().createBook("Sourdough baking for busy parents");
  st().updateBook(id, { audience: "Parents with full-time jobs", ...patch });
  return id;
}

const chapters = (n: number): Chapter[] =>
  Array.from({ length: n }, (_, i) => ({ id: `c${i + 1}`, title: `Chapter ${i + 1}`, summary: "s", body: [], status: "idle", versions: [] }));

beforeEach(() => {
  push.mockReset();
  useBooks.setState({ books: {}, history: {} });
});
afterEach(() => setFailures([]));

describe("DescribeStep", () => {
  it("asks for the audience before moving on", async () => {
    const id = newBook({ audience: "" });
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText(/who is this book for/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("saves mood and call to action, then goes to Title", async () => {
    const id = newBook();
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("radio", { name: "Calm" }));
    await userEvent.type(screen.getByLabelText(/what should readers do after reading/i), "Join my newsletter");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(st().books[id].mood).toBe("calm");
    expect(st().books[id].cta).toBe("Join my newsletter");
    expect(st().books[id].stage).toBe("title");
    expect(push).toHaveBeenCalledWith(`/book/${id}/title`);
  });

  it("suggested audiences fill the field", async () => {
    const id = newBook({ audience: "" });
    wrap(<DescribeStep id={id} />);
    const group = screen.getByRole("group", { name: /suggested audiences/i });
    const first = within(group).getAllByRole("button")[0];
    await userEvent.click(first);
    expect(screen.getByLabelText(/who is it for/i)).toHaveValue(first.textContent);
  });

  it("warns before redrafting an existing outline when the topic changes, and can undo", async () => {
    const id = newBook({ chapters: chapters(6), stage: "outline" });
    wrap(<DescribeStep id={id} />);
    const topic = screen.getByLabelText(/what's your book about/i);
    await userEvent.clear(topic);
    await userEvent.type(topic, "Bread baking for complete beginners");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    const dialog = screen.getByRole("dialog", { name: /redraft your outline/i });
    await userEvent.click(within(dialog).getByRole("button", { name: /redraft/i }));
    expect(st().books[id].chapters).toHaveLength(0);
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(st().books[id].chapters).toHaveLength(6);
  });

  it("shows a friendly message for an unknown book", () => {
    wrap(<DescribeStep id="nope" />);
    expect(screen.getByText(/couldn.t find this book/i)).toBeInTheDocument();
  });
});

describe("TitleStep", () => {
  it("offers five titles with the user's wording first and selected", () => {
    const id = newBook();
    wrap(<TitleStep id={id} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAccessibleName(/Sourdough Baking for Busy Parents/);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
  });

  it("'More ideas' refreshes suggestions but keeps the selection", async () => {
    const id = newBook();
    wrap(<TitleStep id={id} />);
    const before = screen.getAllByRole("radio").map((r) => r.textContent);
    await userEvent.click(screen.getAllByRole("radio")[2]);
    const chosen = screen.getAllByRole("radio")[2].textContent;
    await userEvent.click(screen.getByRole("button", { name: /more ideas/i }));
    const after = screen.getAllByRole("radio").map((r) => r.textContent);
    expect(after).not.toEqual(before);
    expect(screen.getByRole("radio", { checked: true })).toHaveTextContent(chosen!);
  });

  it("saves a custom title and author, then goes to Outline", async () => {
    const id = newBook();
    wrap(<TitleStep id={id} />);
    await userEvent.type(screen.getByLabelText(/or write your own/i), "Bread Before Breakfast");
    const author = screen.getByLabelText(/author/i);
    await userEvent.clear(author);
    await userEvent.type(author, "Ana Ruiz");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(st().books[id]).toMatchObject({ title: "Bread Before Breakfast", author: "Ana Ruiz", stage: "outline" });
    expect(push).toHaveBeenCalledWith(`/book/${id}/outline`);
  });
});

describe("OutlineStep", () => {
  it("drafts six chapters after a loading state", async () => {
    const id = newBook({ title: "Bread" });
    wrap(<OutlineStep id={id} />);
    expect(screen.getByText(/drafting your outline/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("textbox", { name: /chapter \d title/i })).toHaveLength(6), { timeout: 3000 });
  });

  it("recovers from a failed draft with Try again", async () => {
    setFailures(["outline"]);
    const id = newBook({ title: "Bread" });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(await screen.findByRole("button", { name: /try again/i }, { timeout: 3000 }));
    await waitFor(() => expect(screen.getAllByRole("textbox", { name: /chapter \d title/i })).toHaveLength(6), { timeout: 3000 });
  });

  it("removes chapters but never below three", async () => {
    const id = newBook({ title: "Bread", chapters: chapters(4) });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(screen.getAllByRole("button", { name: /remove chapter/i })[0]);
    expect(st().books[id].chapters).toHaveLength(3);
    for (const b of screen.getAllByRole("button", { name: /remove chapter/i })) expect(b).toBeDisabled();
    expect(screen.getByText(/a book needs at least 3 chapters/i)).toBeInTheDocument();
  });

  it("reorders with the move buttons", async () => {
    const id = newBook({ title: "Bread", chapters: chapters(3) });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: "Move chapter 1 down" }));
    expect(st().books[id].chapters.map((c) => c.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("nudges when the book would be longer than ~20 pages", () => {
    const id = newBook({ title: "Bread", chapters: chapters(9) });
    wrap(<OutlineStep id={id} />);
    expect(screen.getByText(/lead magnets work best short/i)).toBeInTheDocument();
  });

  it("'Write my book' moves on to Build", async () => {
    const id = newBook({ title: "Bread", chapters: chapters(6) });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /write my book/i }));
    expect(st().books[id].stage).toBe("build");
    expect(push).toHaveBeenCalledWith(`/book/${id}/build`);
  });
});
