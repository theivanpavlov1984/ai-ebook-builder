import { Check } from "lucide-react";
import { cn } from "@/shared/lib";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol aria-label="Progress" className="flex items-center gap-3 text-sm sm:gap-5">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li
            key={step}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-1.5 border-b-2 pb-1",
              state === "current" ? "border-accent font-semibold text-primary" : "border-transparent text-secondary",
            )}
          >
            {/* Same-size marker on every step: a check when done, the number otherwise – the row never shifts. */}
            <span data-marker aria-hidden className="flex size-3.5 items-center justify-center text-xs tabular-nums">
              {state === "done" ? <Check className="size-3.5 text-success" /> : i + 1}
            </span>
            {/* The invisible bold copy reserves the label's semibold width, so the current step doesn't widen the row. */}
            {/* On phones only the current step keeps its name on screen; the others stay readable to screen readers. */}
            <span
              data-label={step}
              className={cn(
                "inline-grid after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)]",
                state !== "current" && "max-sm:sr-only",
              )}
            >
              {step}
            </span>
            {state === "done" && <span className="sr-only">(done)</span>}
          </li>
        );
      })}
    </ol>
  );
}
