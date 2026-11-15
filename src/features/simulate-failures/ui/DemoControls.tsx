"use client";

import { FlaskConical } from "lucide-react";
import { useRef, useState } from "react";
import { focusRing } from "@/shared/ui";
import { activeFailures, setFailures } from "@/shared/api";
import { cn } from "@/shared/lib";

const toggles = [
  { key: "ch2", label: "Fail chapter 2" },
  { key: "cover", label: "Fail the cover" },
  { key: "photos", label: "Fail the photo suggestions" },
  { key: "outline", label: "Fail the outline" },
  { key: "rewrite", label: "Fail the next rewrite" },
  { key: "all", label: "Fail everything once" },
];

/** For the demo video: switch on simulated failures to show how the product recovers. */
export function DemoControls() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string[]>([]);
  const button = useRef<HTMLButtonElement>(null);

  function toggle(key: string) {
    const current = activeFailures();
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    setFailures(next);
    setActive(activeFailures());
  }

  return (
    // Escape closes the panel and puts focus back on its button.
    <div
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="demo-controls"
        onClick={() => {
          setActive(activeFailures());
          setOpen(!open);
        }}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-xs text-secondary hover:bg-surface hover:text-primary",
          focusRing,
        )}
      >
        <FlaskConical aria-hidden className="size-3.5" />
        Demo controls
      </button>
      {/* After the button in the DOM, so Tab goes from the button into the panel; drawn above it. */}
      {open && (
        <fieldset
          id="demo-controls"
          className="absolute bottom-full left-0 mb-2 w-56 rounded-md border border-default bg-surface p-3 shadow-md"
        >
          <legend className="float-left text-xs font-semibold">Simulate failures</legend>
          <p className="clear-left pt-0.5 text-xs text-secondary">Each fires once, so “Try again” works.</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {toggles.map((t) => (
              <label key={t.key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active.includes(t.key)}
                  onChange={() => toggle(t.key)}
                  className={cn("size-4 accent-accent", focusRing)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
