"use client";

import Link from "next/link";
import { AppShell } from "./AppShell";
import { focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";

/** A page that isn't there. By default a book missing from this browser; the site-wide 404 passes its own words. */
export function NotFound({
  title = "We couldn’t find this book",
  body = "Books are saved in this browser. If you started it on another device or cleared your browser data, it won’t be here.",
  active = "new",
}: {
  title?: string;
  body?: string;
  /** The nav item to highlight; none on the site-wide 404. */
  active?: "new" | "books" | null;
}) {
  return (
    <AppShell active={active ?? undefined}>
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-5 py-16 lg:px-10 lg:py-24">
        <h1 className="font-brand text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-md text-secondary">{body}</p>
        <Link
          href="/new"
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-md bg-inverse px-4 font-medium text-on-inverse",
            focusRing,
          )}
        >
          Start a new book
        </Link>
      </div>
    </AppShell>
  );
}
