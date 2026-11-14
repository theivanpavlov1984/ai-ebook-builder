"use client";

import Link from "next/link";
import { AppShell } from "./AppShell";
import { focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";

export function NotFound() {
  return (
    <AppShell active="new">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-10 py-24">
        <h1 className="font-display text-2xl font-medium">We couldn’t find this book</h1>
        <p className="text-md text-secondary">
          Books are saved in this browser. If you started it on another device or cleared your browser data, it won’t be
          here.
        </p>
        <Link
          href="/"
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
