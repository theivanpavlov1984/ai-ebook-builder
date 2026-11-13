import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { directionsForMood } from "@/components/book/cover-design";
import { ToastProvider } from "@/components/ui/Toast";
import { setFailures } from "@/lib/ai/simulate";
import { useBooks } from "@/lib/book/store";
import type { Chapter } from "@/lib/book/types";
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
  useBooks.setState({ books: {}, history: {} });
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

  it("rewrites a chapter and undoes back to the exact original", async () => {
    const id = newBook();
    wrap(<Studio id={id} rewriteMs={0} />);
    const panel = screen.getByRole("region", { name: /adjust/i });
    const undo = within(panel).getByRole("button", { name: /undo rewrite/i });
    expect(undo).toBeDisabled();

    await userEvent.click(within(panel).getByRole("radio", { name: /shorter/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
    await waitFor(() => expect(st().books[id].chapters[0].versions).toHaveLength(1));
    await userEvent.click(within(panel).getByRole("radio", { name: /more practical/i }));
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
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
    await userEvent.type(within(panel).getByLabelText(/or tell us what to change/i), "Add an example for a family of four");
    await userEvent.click(within(panel).getByRole("button", { name: /^rewrite/i }));
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
