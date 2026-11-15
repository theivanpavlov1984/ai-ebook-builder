import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChapterText } from "./ChapterText";

describe("ChapterText", () => {
  it("sets the closing to-do list as a box with numbered steps", () => {
    render(<ChapterText body={["Intro.", "Try this today:", "1. Write it down.\n2. Pick one result."]} />);
    const box = screen.getByRole("region", { name: "Try this today" });
    expect(
      within(box)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["1Write it down.", "2Pick one result."]);
    expect(screen.getByText("Intro.")).toBeInTheDocument();
  });

  it("marks a changed list in a suggested rewrite", () => {
    render(<ChapterText body={["Intro.", "Try this today:", "1. Step."]} highlight={[false, false, true]} />);
    expect(within(screen.getByRole("region", { name: "Try this today" })).getByText("Changed:")).toBeInTheDocument();
  });
});
