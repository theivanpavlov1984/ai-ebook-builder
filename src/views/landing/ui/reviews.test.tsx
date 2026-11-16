import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Reviews } from "./reviews";

const live = () => screen.getByText(/^Review \d of 6/);

describe("Reviews carousel", () => {
  it("opens on the second story so a book shows on each side", () => {
    render(<Reviews />);
    expect(live()).toHaveTextContent("Review 2 of 6: Marcus Bell");
    expect(screen.getByRole("button", { name: "Show Amara Okafor’s review" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show Hanna Berg’s review" })).toBeInTheDocument();
  });

  it("steps with the arrows and stops at the ends", () => {
    render(<Reviews />);
    const prev = screen.getByRole("button", { name: "Previous review" });
    const next = screen.getByRole("button", { name: "Next review" });
    fireEvent.click(prev);
    expect(live()).toHaveTextContent("Amara Okafor");
    expect(prev).toBeDisabled();
    for (let i = 0; i < 6; i++) fireEvent.click(next);
    expect(live()).toHaveTextContent("Lukas Novak");
    expect(next).toBeDisabled();
  });

  it("opens a side story from its cover and keeps focus on an arrow", () => {
    render(<Reviews />);
    fireEvent.click(screen.getByRole("button", { name: "Show Hanna Berg’s review" }));
    expect(live()).toHaveTextContent("Hanna Berg");
    expect(screen.getByRole("button", { name: "Next review" })).toHaveFocus();
  });

  it("keeps the stories marked as samples", () => {
    render(<Reviews />);
    expect(screen.getByText(/sample reviews/i)).toBeInTheDocument();
  });
});
