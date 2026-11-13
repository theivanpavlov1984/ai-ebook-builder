import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { activeFailures, setFailures } from "@/lib/ai/simulate";
import { DemoControls } from "./DemoControls";
import { OfflineBanner } from "./OfflineBanner";

afterEach(() => setFailures([]));

describe("DemoControls", () => {
  it("switches simulated failures on and off", async () => {
    render(<DemoControls />);
    await userEvent.click(screen.getByRole("button", { name: /demo controls/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /fail chapter 2/i }));
    expect(activeFailures()).toEqual(["ch2"]);
    await userEvent.click(screen.getByRole("checkbox", { name: /fail the cover/i }));
    expect(activeFailures().sort()).toEqual(["ch2", "cover"]);
    await userEvent.click(screen.getByRole("checkbox", { name: /fail chapter 2/i }));
    expect(activeFailures()).toEqual(["cover"]);
    await userEvent.click(screen.getByRole("checkbox", { name: /fail everything once/i }));
    expect(activeFailures()).toContain("all");
  });
});

describe("OfflineBanner", () => {
  it("appears when the connection drops and hides when it returns", () => {
    render(<OfflineBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/you.re offline/i);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
