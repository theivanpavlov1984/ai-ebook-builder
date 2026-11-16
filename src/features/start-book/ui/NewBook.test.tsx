import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBooks } from "@/entities/book";
import { NewBook } from "./NewBook";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const books = () => Object.values(useBooks.getState().books);

describe("NewBook", () => {
  beforeEach(() => {
    replace.mockReset();
    useBooks.setState({ books: {} });
  });

  it("opens a blank book on Describe", async () => {
    render(<NewBook />);
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
    expect(books()).toHaveLength(1);
    expect(replace).toHaveBeenCalledWith(`/book/${books()[0].id}/describe`);
  });

  it("reuses a blank book instead of adding another", async () => {
    const blank = useBooks.getState().createBook("");
    useBooks.getState().createBook("Sourdough baking");
    render(<NewBook />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`/book/${blank}/describe`));
    expect(books()).toHaveLength(2);
  });
});
