import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "./Stepper";

describe("Stepper", () => {
  it("marks the current step and the done steps", () => {
    render(<Stepper steps={["Describe", "Title", "Outline", "Build", "Review"]} current={2} />);
    expect(screen.getByText("Outline").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Describe").closest("li")).toHaveAttribute("data-state", "done");
    expect(screen.getByText("Build").closest("li")).toHaveAttribute("data-state", "upcoming");
    expect(screen.getByText("Build").closest("li")).not.toHaveAttribute("aria-current");
  });

  it("keeps every step the same shape, so finishing a step doesn't shift the row", () => {
    const { container } = render(<Stepper steps={["Describe", "Title", "Outline"]} current={1} />);
    const markers = [...container.querySelectorAll("li")].map((li) => li.querySelector("[data-marker]"));
    expect(markers.every(Boolean)).toBe(true);
    expect(markers[2]).toHaveTextContent("3");
  });

  it("is a labelled list", () => {
    render(<Stepper steps={["Describe", "Title"]} current={0} />);
    expect(screen.getByRole("list", { name: /progress/i })).toBeInTheDocument();
  });
});
