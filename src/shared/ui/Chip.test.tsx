import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chip, ChipGroup } from "./Chip";

const moods = ["Practical", "Inspiring", "Calm", "Bold", "Playful"].map((l) => ({
  value: l.toLowerCase(),
  label: l,
}));

describe("ChipGroup (single)", () => {
  it("is a radio group operable by arrow keys", async () => {
    const onChange = vi.fn();
    render(
      <ChipGroup label="How should it feel?" options={moods} mode="single" value="practical" onChange={onChange} />,
    );
    expect(screen.getByRole("radiogroup", { name: "How should it feel?" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Practical" })).toHaveAttribute("aria-checked", "true");
    screen.getByRole("radio", { name: "Practical" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("inspiring");
    expect(screen.getByRole("radio", { name: "Inspiring" })).toHaveFocus();
  });

  it("only the selected option is in the tab order", () => {
    render(<ChipGroup label="Mood" options={moods} mode="single" value="calm" onChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "Calm" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Bold" })).toHaveAttribute("tabindex", "-1");
  });

  it("arrow left from the first option wraps to the last", async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="Mood" options={moods} mode="single" value="practical" onChange={onChange} />);
    screen.getByRole("radio", { name: "Practical" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith("playful");
  });
});

describe("ChipGroup (multi)", () => {
  it("toggles values on click", async () => {
    const onChange = vi.fn();
    render(<ChipGroup label="Mood" options={moods} mode="multi" value={["bold"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Calm" }));
    expect(onChange).toHaveBeenCalledWith(["bold", "calm"]);
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe("Chip", () => {
  it("exposes its pressed state", () => {
    render(<Chip selected>for startups</Chip>);
    expect(screen.getByRole("button", { name: "for startups" })).toHaveAttribute("aria-pressed", "true");
  });
});
