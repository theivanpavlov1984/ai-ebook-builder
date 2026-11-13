import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Cover } from "./Cover";
import type { CoverDesign } from "./cover-design";

const statusLabel = { draft: "Draft", finalized: "Finalized" } as const;

export function BookCard({
  title,
  status,
  design,
  author,
  onOpen,
}: {
  title: string;
  status: "draft" | "finalized";
  design: CoverDesign;
  author?: string;
  onOpen?: () => void;
}) {
  return (
    <Card className="flex w-56 flex-col gap-3 p-4">
      <button type="button" aria-label={`Open ${title}`} onClick={onOpen} className={cn("rounded-sm self-center", focusRing)}>
        <Cover design={design} title={title} author={author} size="md" />
      </button>
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-md leading-snug font-medium">{title}</p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            status === "finalized" ? "bg-success-subtle text-success" : "bg-subtle text-secondary",
          )}
        >
          {statusLabel[status]}
        </span>
      </div>
    </Card>
  );
}
