import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/shared/ui";
import { useBooks } from "@/entities/book";
import { editedAgo, MyBooks } from "./MyBooks";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const st = () => useBooks.getState();

beforeEach(() => useBooks.setState({ books: {}, history: {} }));

function newBook() {
  const id = st().createBook("Sourdough baking for busy parents");
  st().updateBook(id, { title: "Bread Before Breakfast", stage: "outline" });
  return id;
}

describe("MyBooks", () => {
  it("says where each book stands and when it was edited", () => {
    newBook();
    render(
      <ToastProvider>
        <MyBooks />
      </ToastProvider>,
    );
    expect(screen.getByText("Planning chapters · edited today")).toBeInTheDocument();
  });

  it("deletes a book with an Undo", async () => {
    const id = newBook();
    render(
      <ToastProvider>
        <MyBooks />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /delete bread before breakfast/i }));
    expect(st().books[id]).toBeUndefined();
    await userEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(st().books[id].title).toBe("Bread Before Breakfast");
  });

  it("renames a book", async () => {
    const id = newBook();
    render(
      <ToastProvider>
        <MyBooks />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: /rename bread before breakfast/i }));
    const field = screen.getByLabelText("Title");
    await userEvent.clear(field);
    await userEvent.type(field, "Morning Loaves{Enter}");
    expect(st().books[id].title).toBe("Morning Loaves");
  });
});

describe("editedAgo", () => {
  const now = new Date(2026, 10, 15, 15, 0).getTime();
  it("reads like a person would say it", () => {
    expect(editedAgo(now - 60_000, now)).toBe("today");
    expect(editedAgo(new Date(2026, 10, 14, 22, 0).getTime(), now)).toBe("yesterday");
    expect(editedAgo(new Date(2026, 10, 12, 9, 0).getTime(), now)).toBe("3 days ago");
    expect(editedAgo(new Date(2026, 9, 2).getTime(), now)).toBe("Oct 2");
  });
});
