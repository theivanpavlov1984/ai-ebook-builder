import { Check, CircleExclamationPoint, LoaderCircle } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "./Button";

export type StepStatus = "waiting" | "working" | "done" | "failed";
export type ProgressItem = { id: string; label: string; status: StepStatus; detail?: string };

const statusText: Record<StepStatus, string> = {
  waiting: "Waiting",
  working: "In progress",
  done: "Done",
  failed: "Couldn't write this part.",
};

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "done":
      return <Check aria-hidden className="size-4 text-success" />;
    case "working":
      return <LoaderCircle aria-hidden className="size-4 animate-spin text-accent" />;
    case "failed":
      return <CircleExclamationPoint aria-hidden className="size-4 text-danger" />;
    default:
      return <span aria-hidden className="mx-1.5 size-1.5 rounded-full bg-strong" />;
  }
}

export function ProgressList({ items, onRetry }: { items: ProgressItem[]; onRetry?: (id: string) => void }) {
  return (
    <ul aria-live="polite" className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} data-status={item.status} className="flex items-start gap-3">
          <span className="flex size-5 shrink-0 items-center justify-center">
            <StatusIcon status={item.status} />
          </span>
          <div className="flex-1">
            <p
              className={cn(
                "text-base",
                item.status === "waiting" ? "text-secondary" : "text-primary",
                item.status === "working" && "font-medium",
              )}
            >
              {item.label}
            </p>
            {item.detail && <p className="text-sm text-secondary">{item.detail}</p>}
            {item.status === "failed" ? (
              <div className="mt-1 flex items-center gap-3">
                <p className="text-sm text-danger">{statusText.failed}</p>
                {onRetry && (
                  <Button size="sm" variant="secondary" onClick={() => onRetry(item.id)}>
                    Try again
                  </Button>
                )}
              </div>
            ) : (
              <span className="sr-only">{statusText[item.status]}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
