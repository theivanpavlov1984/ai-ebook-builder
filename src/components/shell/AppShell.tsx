import { Library, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui/Button";
import { DemoControls } from "./DemoControls";
import { OfflineBanner } from "./OfflineBanner";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-brand text-[22px] leading-none tracking-tight text-primary", className)}>
      Primer<span className="text-accent">*</span>
    </span>
  );
}

const nav = [
  { key: "new", href: "/", label: "New book", Icon: Plus },
  { key: "books", href: "/books", label: "My books", Icon: Library },
] as const;

export function AppShell({ active, children }: { active: "new" | "books"; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col gap-8 border-r border-default bg-subtle px-4 py-6">
        <Link href="/" aria-label="Primer" className={cn("self-start rounded-sm px-2", focusRing)}>
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {nav.map(({ key, href, label, Icon }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-base",
                  "transition-colors duration-150 ease-standard",
                  on ? "bg-accent-subtle font-semibold text-accent-strong" : "text-secondary hover:bg-surface hover:text-primary",
                  focusRing,
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <DemoControls />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <OfflineBanner />
        {children}
      </main>
    </div>
  );
}
