import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("loading button is disabled, busy, and never fires on double click", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Write my book
      </Button>,
    );
    const b = screen.getByRole("button", { name: /write my book/i });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("aria-busy", "true");
    await userEvent.dblClick(b);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("primary uses the inverse tokens, not the accent", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-inverse", "text-on-inverse");
  });

  it("secondary and ghost variants are distinct", () => {
    render(
      <>
        <Button variant="secondary">Back</Button>
        <Button variant="ghost">Skip</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Back" })).toHaveClass("bg-surface", "border-default");
    expect(screen.getByRole("button", { name: "Skip" })).not.toHaveClass("bg-surface");
  });

  it("has a solid focus outline that survives high-contrast mode", () => {
    render(<Button>Go</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "outline-hidden",
      "focus-visible:outline-solid",
      "focus-visible:outline-2",
      "focus-visible:outline-accent",
    );
    expect(button).not.toHaveClass("outline-none");
  });
});
