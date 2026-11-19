import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/shared/ui";
import { setFailures } from "@/shared/api";
import { useBooks, type Chapter } from "@/entities/book";
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
  Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    title: `Chapter ${i + 1}`,
    summary: "s",
    body: [],
    status: "idle",
    versions: [],
  }));

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

  it("puts the cursor in the first field that needs fixing", async () => {
    const id = newBook({ audience: "" });
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByLabelText(/who is it for/i)).toHaveFocus();
    await userEvent.clear(screen.getByLabelText(/what's your book about/i));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByLabelText(/what's your book about/i)).toHaveFocus();
  });

  it("'Help me shape this idea' on an empty topic asks for a rough idea first", async () => {
    const id = newBook({ topic: "" });
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /help me shape this idea/i }));
    expect(screen.getByText(/write a rough idea first/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what's your book about/i)).toHaveFocus();
  });

  it("tells the author of a written book what changing the answers will and won't do", () => {
    const id = newBook({ chapters: chapters(6).map((c) => ({ ...c, body: ["Text"], status: "done" as const })) });
    wrap(<DescribeStep id={id} />);
    expect(screen.getByText(/won’t rewrite the chapters/i)).toBeInTheDocument();
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

  it("'Write it now' picks the audience, title and outline, then goes straight to Build", async () => {
    const id = newBook({ audience: "" });
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /write it now/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(`/book/${id}/build`));
    const b = st().books[id];
    expect(b.audience).not.toBe("");
    expect(b.title).toBe("Sourdough Baking for Busy Parents");
    expect(b.chapters.length).toBeGreaterThanOrEqual(3);
    expect(b.chapters.every((c) => c.status === "idle")).toBe(true);
    expect(b.stage).toBe("build");
  });

  it("'Write it now' keeps what the user already chose", async () => {
    const id = newBook({ title: "Bread Before Breakfast", chapters: chapters(4) });
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /write it now/i }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    const b = st().books[id];
    expect(b.audience).toBe("Parents with full-time jobs");
    expect(b.title).toBe("Bread Before Breakfast");
    expect(b.chapters.map((c) => c.id)).toEqual(["c1", "c2", "c3", "c4"]);
  });

  it("'Write it now' still needs a real topic", async () => {
    const id = newBook();
    st().updateBook(id, { topic: "" });
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /write it now/i }));
    expect(push).not.toHaveBeenCalled();
  });

  it("'Write it now' explains a failed outline and stays on the page", async () => {
    setFailures(["outline"]);
    const id = newBook();
    wrap(<DescribeStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: /write it now/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn.t draft the outline/i);
    expect(push).not.toHaveBeenCalled();
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
    await waitFor(() => expect(screen.getAllByRole("textbox", { name: /chapter \d title/i })).toHaveLength(6), {
      timeout: 3000,
    });
  });

  it("says what it drafts from and which stage it is on", async () => {
    const id = newBook({ title: "Bread", audience: "Busy parents" });
    wrap(<OutlineStep id={id} />);
    expect(screen.getByText("“Sourdough baking for busy parents”")).toBeInTheDocument();
    expect(screen.getByText("Reading your topic")).toBeInTheDocument();
    expect(screen.getByText("Choosing chapters for busy parents")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("textbox", { name: /chapter \d title/i })).toHaveLength(6), {
      timeout: 3000,
    });
    // The button and the book's size share the bar that stays at the bottom of the screen.
    const write = screen.getByRole("button", { name: "Write my book" });
    expect(write.parentElement).toHaveTextContent(/6 chapters · ~\d+ pages/);
  });

  it("recovers from a failed draft with Try again", async () => {
    setFailures(["outline"]);
    const id = newBook({ title: "Bread" });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(await screen.findByRole("button", { name: /try again/i }, { timeout: 3000 }));
    await waitFor(() => expect(screen.getAllByRole("textbox", { name: /chapter \d title/i })).toHaveLength(6), {
      timeout: 3000,
    });
  });

  it("removes chapters but never below three", async () => {
    const id = newBook({ title: "Bread", chapters: chapters(4) });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(screen.getAllByRole("button", { name: /remove chapter/i })[0]);
    expect(st().books[id].chapters).toHaveLength(3);
    for (const b of screen.getAllByRole("button", { name: /remove chapter/i })) expect(b).toBeDisabled();
    expect(screen.getByText(/a book needs at least 3 chapters/i)).toBeInTheDocument();
  });

  it("reorders by dragging a chapter's handle", () => {
    const id = newBook({ title: "Bread", chapters: chapters(3) });
    wrap(<OutlineStep id={id} />);
    const handle = screen.getByRole("button", { name: "Reorder chapter 1" });
    fireEvent.pointerDown(handle, { button: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 400, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientY: 400, pointerId: 1 });
    expect(st().books[id].chapters.map((c) => c.id)).toEqual(["c2", "c3", "c1"]);
    expect(screen.getByText("Moved “Chapter 1” to position 3 of 3.")).toBeInTheDocument();
  });

  it("reorders with the arrow keys on the handle, keeping focus with the moved chapter", async () => {
    const id = newBook({ title: "Bread", chapters: chapters(3) });
    wrap(<OutlineStep id={id} />);
    screen.getByRole("button", { name: "Reorder chapter 2" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(st().books[id].chapters.map((c) => c.id)).toEqual(["c1", "c3", "c2"]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Reorder chapter 3" })).toHaveFocus());
    expect(screen.getByText("Moved “Chapter 2” to position 3 of 3.")).toBeInTheDocument();
    // Already last: another press does nothing.
    await userEvent.keyboard("{ArrowDown}");
    expect(st().books[id].chapters.map((c) => c.id)).toEqual(["c1", "c3", "c2"]);
  });

  it("puts focus on the next chapter after a removal, and in the new title after adding", async () => {
    const id = newBook({ title: "Bread", chapters: chapters(5) });
    wrap(<OutlineStep id={id} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove chapter 2" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Remove chapter 2" })).toHaveFocus());
    expect(screen.getByLabelText("Chapter 2 title")).toHaveValue("Chapter 3");

    await userEvent.click(screen.getByRole("button", { name: /add chapter/i }));
    await waitFor(() => expect(screen.getByLabelText("Chapter 5 title")).toHaveFocus());
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

  it("back while the book is being written: says what is done, keeps the text, and continues instead of restarting", async () => {
    const half = chapters(6).map((c, i) => (i < 2 ? { ...c, body: ["Text"], status: "done" as const } : c));
    const id = newBook({ title: "Bread", chapters: half, stage: "build" });
    wrap(<OutlineStep id={id} />);
    expect(screen.getByText(/2 of 6 chapters are done/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /continue writing/i }));
    expect(st().books[id].chapters[0]).toMatchObject({ status: "done", body: ["Text"] });
    expect(push).toHaveBeenCalledWith(`/book/${id}/build`);
  });

  it("a written chapter swapped for another idea gets written again", async () => {
    const all = chapters(6).map((c) => ({ ...c, body: ["Text"], status: "done" as const }));
    const id = newBook({ title: "Bread", chapters: all, stage: "review" });
    wrap(<OutlineStep id={id} />);
    expect(screen.getByRole("button", { name: /back to review/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /suggest another idea for chapter 1/i }));
    expect(st().books[id].chapters[0]).toMatchObject({ status: "idle", body: [] });
    await userEvent.click(screen.getByRole("button", { name: /continue writing/i }));
    expect(push).toHaveBeenCalledWith(`/book/${id}/build`);
  });
});
