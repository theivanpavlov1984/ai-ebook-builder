import { cn } from "@/shared/lib";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-brand text-[22px] leading-none tracking-tight text-primary", className)}>
      Primer<span className="text-accent">*</span>
    </span>
  );
}
