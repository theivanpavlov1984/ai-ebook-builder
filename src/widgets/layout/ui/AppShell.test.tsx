import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

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
});
