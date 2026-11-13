import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProgressList, type ProgressItem } from "./ProgressList";

const items: ProgressItem[] = [
  { id: "outline", label: "Outline", status: "done" },
  { id: "ch1", label: "Chapter 1", status: "working" },
  { id: "ch2", label: "Chapter 2", status: "failed" },
  { id: "cover", label: "Cover", status: "waiting" },
];

describe("ProgressList", () => {
  it("shows a failed step with text and retries only that step", async () => {
    const onRetry = vi.fn();
    render(<ProgressList items={items} onRetry={onRetry} />);
    const row = screen.getByText("Chapter 2").closest("li")!;
    expect(within(row).getByText(/couldn't write this part/i)).toBeInTheDocument();
    await userEvent.click(within(row).getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith("ch2");
  });

  it("gives every status a text label for screen readers", () => {
    render(<ProgressList items={items} />);
    expect(within(screen.getByText("Outline").closest("li")!).getByText("Done")).toBeInTheDocument();
    expect(within(screen.getByText("Chapter 1").closest("li")!).getByText("In progress")).toBeInTheDocument();
    expect(within(screen.getByText("Cover").closest("li")!).getByText("Waiting")).toBeInTheDocument();
  });

  it("announces changes politely", () => {
    render(<ProgressList items={items} />);
    expect(screen.getByRole("list")).toHaveAttribute("aria-live", "polite");
  });

  it("shows no retry button when no handler is given", () => {
    render(<ProgressList items={items} />);
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });
});
