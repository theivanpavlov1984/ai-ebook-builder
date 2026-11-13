import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast, type ToastInput } from "./Toast";

function Trigger({ toast }: { toast: ToastInput }) {
  const { show } = useToast();
  return <button onClick={() => show(toast)}>trigger</button>;
}

function setup(toast: ToastInput) {
  render(
    <ToastProvider>
      <Trigger toast={toast} />
    </ToastProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("runs the action once and dismisses", async () => {
    const onClick = vi.fn();
    setup({ tone: "info", message: "Chapter rewritten", action: { label: "Undo", onClick } });
    await userEvent.click(screen.getByText("trigger"));
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Chapter rewritten")).not.toBeInTheDocument();
  });

  it("announces errors as alerts and the rest as status", async () => {
    setup({ tone: "error", message: "Couldn't create the PDF" });
    await userEvent.click(screen.getByText("trigger"));
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't create the PDF");
  });

  it("auto-dismisses after durationMs", () => {
    vi.useFakeTimers();
    setup({ tone: "success", message: "Book saved", durationMs: 5000 });
    act(() => screen.getByText("trigger").click());
    expect(screen.getByRole("status")).toHaveTextContent("Book saved");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText("Book saved")).not.toBeInTheDocument();
  });
});
