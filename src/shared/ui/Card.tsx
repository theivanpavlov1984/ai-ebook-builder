import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export function Card({
  interactive = false,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-default bg-surface",
        interactive &&
          "cursor-pointer transition-[border-color,box-shadow] duration-150 ease-standard hover:border-strong hover:shadow-md",
        className,
      )}
      {...rest}
    />
  );
}
