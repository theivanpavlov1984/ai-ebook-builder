import { Check } from "lucide-react";
import { cn } from "@/shared/lib";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol aria-label="Progress" className="flex items-center gap-5 text-sm">
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
            {state === "done" && <Check aria-hidden className="size-3.5 text-success" />}
            <span>{step}</span>
            {state === "done" && <span className="sr-only">(done)</span>}
          </li>
        );
      })}
    </ol>
  );
}
