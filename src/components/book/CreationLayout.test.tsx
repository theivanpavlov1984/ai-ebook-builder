import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/lib/book/types";
import { CreationLayout } from "./CreationLayout";

vi.mock("next/navigation", () => ({ usePathname: () => "/book/1/outline" }));

const book: Book = {
  id: "1",
  createdAt: 0,
  updatedAt: 0,
  stage: "outline",
  topic: "Design systems for small teams",
  audience: "Founders",
  mood: "practical",
  cta: "",
  title: "Stop Redrawing Buttons",
  subtitle: "",
  author: "Ivan Pavlov",
  chapters: [],
  cover: { direction: "editorial", variant: 0, status: "idle" },
};

describe("CreationLayout", () => {
  it("shows the stepper at the current step and the book panel", () => {
    render(
      <CreationLayout book={book} stage="outline">
        <p>form</p>
      </CreationLayout>,
    );
    expect(screen.getByText("Outline").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("complementary", { name: /your book/i })).toHaveTextContent("Stop Redrawing Buttons");
    expect(screen.getByText("form")).toBeInTheDocument();
  });

  it("shows 'Untitled book' before a title is chosen", () => {
    render(
      <CreationLayout book={{ ...book, title: "" }} stage="describe">
        <p>form</p>
      </CreationLayout>,
    );
    expect(screen.getByRole("complementary", { name: /your book/i })).toHaveTextContent("Untitled book");
  });

  it("estimates a typical 6-chapter book before the outline exists", () => {
    render(
      <CreationLayout book={{ ...book, chapters: [] }} stage="describe">
        <p>form</p>
      </CreationLayout>,
    );
    expect(screen.getByRole("complementary", { name: /your book/i })).toHaveTextContent("~15 pages");
  });
});
