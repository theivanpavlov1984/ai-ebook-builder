import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("is named by its title and closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Start over?" description="Your outline will be replaced.">
        <button>Keep editing</button>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Start over?" });
    expect(dialog).toHaveAccessibleDescription("Your outline will be replaced.");
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("moves focus inside when opened", () => {
    render(
      <Dialog open onOpenChange={() => {}} title="Rename chapter">
        <input aria-label="Chapter title" />
      </Dialog>,
    );
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("has a labelled close button", async () => {
    const onOpenChange = vi.fn();
    render(<Dialog open onOpenChange={onOpenChange} title="Rename chapter" />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
