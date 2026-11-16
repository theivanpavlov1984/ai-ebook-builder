import { Check } from "lucide-react";
import Link from "next/link";
import { focusRing } from "./Button";
import { cn } from "@/shared/lib";

/**
 * Progress through the creation flow. Steps already reached are links (`links[i]`), so the user can go back to
 * any of them – a wizard should let people revisit what they've done. `reached` is the furthest step the book
 * has been to: after going back to Describe, Title to Review stay done and reachable.
 */
export function Stepper({
  steps,
  current,
  reached = current,
  links,
}: {
  steps: string[];
  current: number;
  reached?: number;
  links?: string[];
}) {
  return (
    // Each step pads 4 px on both sides, so the current step's rule overhangs its marker and label evenly, like a
    // tab's indicator; the gap shrinks by the same 8 px, so the row's spacing stays as it was.
    <ol aria-label="Progress" className="flex items-center gap-1 text-sm sm:gap-3">
      {steps.map((step, i) => {
        const state = i === current ? "current" : i < current || i <= reached ? "done" : "upcoming";
        const href = state === "done" ? links?.[i] : undefined;
        const content = (
          <>
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
          </>
        );
        return (
          <li
            key={step}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "border-b-2 px-1 pb-1",
              state === "current" ? "border-accent font-semibold text-primary" : "border-transparent text-secondary",
            )}
          >
            {href ? (
              <Link
                href={href}
                className={cn(
                  "-mx-1 flex items-center gap-1.5 rounded-sm px-1 underline-offset-4 hover:text-primary hover:underline",
                  focusRing,
                )}
              >
                {content}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5">{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
