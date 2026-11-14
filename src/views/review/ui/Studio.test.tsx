import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { directionsForMood, useBooks, writeChapter, type Chapter } from "@/entities/book";
import { ToastProvider } from "@/shared/ui";
import { setFailures } from "@/shared/api";
import { Studio } from "./Studio";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));

const wrap = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>);
const st = () => useBooks.getState();

const written = (n: number): Chapter[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    title: `Chapter title ${i + 1}`,
    summary: "s",
    body: [`Original paragraph of chapter ${i + 1}.`, "Second paragraph."],
    status: "done",
    versions: [],
  }));

function newBook() {
  const id = st().createBook("Sourdough baking for busy parents");
  st().updateBook(id, {
    audience: "Parents",
    title: "Bread Before Breakfast",
    stage: "review",
    mood: "calm",
    chapters: written(3),
    cover: { direction: directionsForMood("calm")[0], variant: 0, status: "done" },
  });
  return id;
}

beforeEach(() => {
  push.mockReset();
  useBooks.setState({ books: {}, history: {}, rewriting: {} });
});
afterEach(() => setFailures([]));

describe("Studio", () => {
  it("has structure, reading view and an adjust panel", () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    expect(screen.getByRole("navigation", { name: /book structure/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /adjust/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chapter title 1" })).toBeInTheDocument();
  });

  async function keepRewrite() {
    await userEvent.click(await screen.findByRole("button", { name: /^keep$/i }));
  }

  it("shows a rewrite as a suggestion and leaves the text alone until it is kept", async () => {
    const id = newBook();
    // Start from generated text, so "warmer" changes only the opening paragraph.
    const original = writeChapter(st().books[id], st().books[id].chapters[0]);
    st().updateChapter(id, "c1", { body: original });
    wrap(<Studio id={id} rewriteMs={0} />);
    const panel = screen.getByRole("region", { name: /adjust/i });
    await userEvent.click(within(panel).getByRole("radio", { name: /warmer/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));

    const suggestion = await screen.findByRole("region", { name: /suggested rewrite/i });
    expect(
      within(suggestion).getByText(new RegExp(`1 of ${original.length + 1} paragraphs changed`, "i")),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^changed:/i)).toHaveLength(1);
    expect(st().books[id].chapters[0].body).toEqual(original);
    expect(screen.getByRole("button", { name: /chapter title 1/i })).toHaveTextContent(/to review/i);

    await userEvent.click(within(suggestion).getByRole("button", { name: /original/i }));
    expect(screen.queryByText(/^changed:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/completely normal/i)).not.toBeInTheDocument();

    await keepRewrite();
    expect(screen.queryByRole("region", { name: /suggested rewrite/i })).not.toBeInTheDocument();
    expect(st().books[id].chapters[0].body[0]).toMatch(/completely normal/i);
    expect(st().books[id].chapters[0].versions).toHaveLength(1);
  });

  it("discarding a suggestion keeps the original text and adds no version", async () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    const panel = screen.getByRole("region", { name: /adjust/i });
    await userEvent.click(within(panel).getByRole("radio", { name: /shorter/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
    await userEvent.click(await screen.findByRole("button", { name: /discard/i }));
    expect(st().books[id].chapters[0].draft).toBeUndefined();
    expect(st().books[id].chapters[0].versions).toHaveLength(0);
    expect(screen.getByText("Original paragraph of chapter 1.")).toBeInTheDocument();
  });

  it("rewrites a chapter and undoes back to the exact original", async () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    const panel = screen.getByRole("region", { name: /adjust/i });
    const undo = within(panel).getByRole("button", { name: /undo rewrite/i });
    expect(undo).toBeDisabled();

    await userEvent.click(within(panel).getByRole("radio", { name: /shorter/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
    await keepRewrite();
    await waitFor(() => expect(st().books[id].chapters[0].versions).toHaveLength(1));
    await userEvent.click(within(panel).getByRole("radio", { name: /more practical/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
    await keepRewrite();
    await waitFor(() => expect(st().books[id].chapters[0].versions).toHaveLength(2));
    expect(within(panel).getByText(/version 3/i)).toBeInTheDocument();

    await userEvent.click(within(panel).getByRole("button", { name: /undo rewrite/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /undo rewrite/i }));
    expect(st().books[id].chapters[0].body).toEqual(["Original paragraph of chapter 1.", "Second paragraph."]);
    expect(within(panel).getByRole("button", { name: /undo rewrite/i })).toBeDisabled();
  });

  it("a free instruction is enough to rewrite", async () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    const panel = screen.getByRole("region", { name: /adjust/i });
    await userEvent.type(
      within(panel).getByLabelText(/or tell us what to change/i),
      "Add an example for a family of four",
    );
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
    await keepRewrite();
    await waitFor(() => expect(st().books[id].chapters[0].body.join(" ")).toMatch(/family of four/i));
  });

  it("keeps the text and explains when a rewrite fails", async () => {
    setFailures(["rewrite"]);
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    const panel = screen.getByRole("region", { name: /adjust/i });
    await userEvent.click(within(panel).getByRole("radio", { name: /simpler/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn.t rewrite/i);
    expect(st().books[id].chapters[0].versions).toHaveLength(0);
    expect(st().books[id].chapters[0].draft).toBeUndefined();
    expect(st().rewriting).toEqual({});
  });

  it("lets the user pick a cover style, shuffle it and edit the title", async () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    await userEvent.click(screen.getByRole("button", { name: /^cover$/i }));
    const panel = screen.getByRole("region", { name: /adjust/i });
    const options = within(panel).getAllByRole("radio");
    expect(options).toHaveLength(3);
    await userEvent.click(options[1]);
    expect(st().books[id].cover.direction).toBe(directionsForMood("calm")[1]);
    await userEvent.click(within(panel).getByRole("button", { name: /shuffle/i }));
    expect(st().books[id].cover.variant).toBe(1);
    const title = within(panel).getByLabelText(/^title$/i);
    await userEvent.clear(title);
    await userEvent.type(title, "Rise and Bake");
    expect(st().books[id].title).toBe("Rise and Bake");
  });

  it("finalize moves on to the final step", async () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    await userEvent.click(screen.getByRole("button", { name: /finalize/i }));
    expect(st().books[id].stage).toBe("final");
    expect(push).toHaveBeenCalledWith(`/book/${id}/final`);
  });
});
