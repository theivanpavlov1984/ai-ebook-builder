import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookCard } from "./BookCard";
import { Cover } from "./Cover";
import { getCoverDesign, type ArtDirection } from "./cover-design";

const TITLE = "Design Systems for Small Teams";
const LONG = "Design Systems for Small Teams: A Practical Field Guide for Founders and First Hires";

function titleLines(container: HTMLElement) {
  const text = container.querySelector("text[data-role='title']")!;
  return { text, lines: Array.from(text.querySelectorAll("tspan")).map((t) => t.textContent ?? "") };
}

describe("Cover", () => {
  it("is labelled for assistive tech", () => {
    render(<Cover design={getCoverDesign({ title: TITLE, mood: "practical" })} title={TITLE} author="Ivan Pavlov" />);
    expect(screen.getByRole("img", { name: `${TITLE} by Ivan Pavlov` })).toBeInTheDocument();
  });

  it("keeps a very long title whole and inside the safe area", () => {
    const { container } = render(<Cover design={getCoverDesign({ title: LONG, mood: "practical" })} title={LONG} />);
    const { text, lines } = titleLines(container);
    expect(lines.join(" ")).toBe(LONG);
    expect(lines.length).toBeLessThanOrEqual(5);

    const { container: short } = render(
      <Cover design={getCoverDesign({ title: TITLE, mood: "practical" })} title={TITLE} />,
    );
    const shortSize = Number(titleLines(short).text.getAttribute("font-size"));
    expect(Number(text.getAttribute("font-size"))).toBeLessThan(shortSize);
  });

  it("renders a distinct composition for each art direction", () => {
    const directions: ArtDirection[] = ["editorial", "geometric", "organic", "typographic"];
    const { container } = render(
      <>
        {directions.map((d) => (
          <Cover key={d} design={getCoverDesign({ title: TITLE, mood: "calm", direction: d })} title={TITLE} />
        ))}
      </>,
    );
    const found = Array.from(container.querySelectorAll("svg[data-direction]")).map((s) =>
      s.getAttribute("data-direction"),
    );
    expect(found).toEqual(directions);
  });

  it("is deterministic for the same design", () => {
    const design = getCoverDesign({ title: TITLE, mood: "playful" });
    const a = render(<Cover design={design} title={TITLE} />).container.innerHTML;
    const b = render(<Cover design={design} title={TITLE} />).container.innerHTML;
    expect(a).toBe(b);
  });
});

describe("BookCard", () => {
  it("shows the title and status and opens on click", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    let opened = false;
    render(
      <BookCard
        title={TITLE}
        status="draft"
        design={getCoverDesign({ title: TITLE, mood: "practical" })}
        onOpen={() => {
          opened = true;
        }}
      />,
    );
    expect(screen.getByText("Draft")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: `Open ${TITLE}` }));
    expect(opened).toBe(true);
  });
});
