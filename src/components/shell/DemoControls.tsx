"use client";

import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { focusRing } from "@/components/ui/Button";
import { activeFailures, setFailures } from "@/lib/ai/simulate";
import { cn } from "@/lib/cn";

const toggles = [
  { key: "ch2", label: "Fail chapter 2" },
  { key: "cover", label: "Fail the cover" },
  { key: "outline", label: "Fail the outline" },
  { key: "rewrite", label: "Fail the next rewrite" },
  { key: "all", label: "Fail everything once" },
];

/** For the demo video: switch on simulated failures to show how the product recovers. */
export function DemoControls() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string[]>([]);

  function toggle(key: string) {
    const current = activeFailures();
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    setFailures(next);
    setActive(activeFailures());
  }

  return (
    <div className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-md border border-default bg-surface p-3 shadow-md">
          <p className="text-xs font-semibold">Simulate failures</p>
          <p className="mt-0.5 text-xs text-secondary">Each fires once, so “Try again” works.</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {toggles.map((t) => (
              <label key={t.key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={active.includes(t.key)} onChange={() => toggle(t.key)} className="size-4 accent-accent" />
                {t.label}
              </label>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setActive(activeFailures());
          setOpen(!open);
        }}
        className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-xs text-secondary hover:bg-surface hover:text-primary", focusRing)}
      >
        <FlaskConical aria-hidden className="size-3.5" />
        Demo controls
      </button>
    </div>
  );
}
