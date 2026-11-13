import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input, Textarea } from "./Field";

describe("Input", () => {
  it("announces an error with text, an icon and aria attributes", () => {
    render(<Input label="Topic" error="Tell us a bit more about the topic" />);
    const input = screen.getByLabelText("Topic");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const msg = screen.getByText("Tell us a bit more about the topic");
    expect(input.getAttribute("aria-describedby")).toContain(msg.id);
    expect(msg.closest("[data-field-error]")?.querySelector("svg")).not.toBeNull();
  });

  it("links the hint when there is no error", () => {
    render(<Input label="Topic" hint="One sentence is enough" />);
    const input = screen.getByLabelText("Topic");
    expect(input).toHaveAccessibleDescription("One sentence is enough");
    expect(input).not.toHaveAttribute("aria-invalid");
  });
});

describe("Textarea", () => {
  it("is labelled and grows with its content when autoGrow is on", async () => {
    render(<Textarea label="Topic" autoGrow />);
    const area = screen.getByLabelText("Topic") as HTMLTextAreaElement;
    // jsdom has no layout: simulate a growing scrollHeight.
    let scroll = 40;
    Object.defineProperty(area, "scrollHeight", { configurable: true, get: () => scroll });
    scroll = 120;
    await userEvent.type(area, "line 1{enter}line 2{enter}line 3{enter}line 4{enter}line 5");
    expect(area.style.height).toBe("120px");
  });
});
