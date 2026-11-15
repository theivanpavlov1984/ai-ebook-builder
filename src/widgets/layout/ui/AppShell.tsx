import { Library, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import { CONTENT_ID, focusRing, OfflineBanner, SkipLink, Wordmark } from "@/shared/ui";
import { DemoControls } from "@/features/simulate-failures";

const nav = [
  { key: "new", href: "/", label: "New book", Icon: Plus },
  { key: "books", href: "/books", label: "My books", Icon: Library },
] as const;

export function AppShell({ active, children }: { active?: "new" | "books"; children: ReactNode }) {
  return (
    // Below lg (1024 px) the sidebar becomes a bar across the top, so phones and tablets keep the full width.
    <div className="flex min-h-screen flex-col lg:flex-row">
      <SkipLink />
      <aside className="flex shrink-0 items-center gap-3 border-b border-default bg-subtle px-3 py-2.5 lg:sticky lg:top-0 lg:h-screen lg:w-[220px] lg:flex-col lg:items-stretch lg:gap-8 lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <Link href="/" aria-label="Primer" className={cn("self-start rounded-sm px-2", focusRing)}>
          <Wordmark />
        </Link>
        <nav aria-label="Main" className="flex gap-1 lg:flex-col">
          {nav.map(({ key, href, label, Icon }) => {
            const on = key === active;
            return (
              <Link
                key={key}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm whitespace-nowrap lg:gap-2.5 lg:px-3 lg:text-base",
                  "transition-colors duration-150 ease-standard",
                  on
                    ? "bg-accent-subtle font-semibold text-accent-strong"
                    : "text-secondary hover:bg-surface hover:text-primary",
                  focusRing,
                )}
              >
                <Icon aria-hidden className="hidden size-4 sm:block" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto lg:mt-auto lg:ml-0">
          <DemoControls />
        </div>
      </aside>
      <main id={CONTENT_ID} tabIndex={-1} className="min-w-0 flex-1 outline-hidden">
        <OfflineBanner />
        {children}
      </main>
    </div>
  );
}
