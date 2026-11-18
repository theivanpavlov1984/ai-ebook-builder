import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("AppShell", () => {
  it("marks the active nav item", () => {
    render(<AppShell active="new">content</AppShell>);
    expect(screen.getByRole("link", { name: /new book/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /my books/i })).not.toHaveAttribute("aria-current");
  });

  it("renders the wordmark and the page content in main", () => {
    render(<AppShell active="books">Shelf</AppShell>);
    expect(screen.getByRole("link", { name: /primer/i })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Shelf");
  });

  it("starts with a skip link to the page content, so keyboard users can jump past the navigation", async () => {
    render(<AppShell active="books">Shelf</AppShell>);
    await userEvent.tab();
    const skip = screen.getByRole("link", { name: /skip to content/i });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute("href", `#${screen.getByRole("main").id}`);
  });
});
