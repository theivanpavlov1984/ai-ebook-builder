import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBooks } from "@/entities/book";
import { NewBookLink } from "./NewBookLink";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const books = () => Object.values(useBooks.getState().books);

describe("NewBookLink", () => {
  beforeEach(() => {
    push.mockReset();
    useBooks.setState({ books: {} });
  });

  it("opens a blank book on Describe in one step, without a stop at /new", () => {
    render(<NewBookLink>Start my book</NewBookLink>);
    const link = screen.getByRole("link", { name: "Start my book" });
    expect(link).toHaveAttribute("href", "/new");
    fireEvent.click(link);
    expect(books()).toHaveLength(1);
    expect(push).toHaveBeenCalledWith(`/book/${books()[0].id}/describe`);
  });

  it("reuses the blank book when clicked again", () => {
    render(<NewBookLink>Start my book</NewBookLink>);
    const link = screen.getByRole("link", { name: "Start my book" });
    fireEvent.click(link);
    fireEvent.click(link);
    expect(books()).toHaveLength(1);
    expect(push).toHaveBeenNthCalledWith(2, push.mock.calls[0][0]);
  });

  it("leaves a new-tab click to the browser", () => {
    render(<NewBookLink>Start my book</NewBookLink>);
    fireEvent.click(screen.getByRole("link", { name: "Start my book" }), { metaKey: true });
    expect(push).not.toHaveBeenCalled();
    expect(books()).toHaveLength(0);
  });
});
