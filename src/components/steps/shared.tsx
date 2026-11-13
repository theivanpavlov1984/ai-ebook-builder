"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { focusRing } from "@/components/ui/Button";
import { stageOrder, type Book, type Stage } from "@/lib/book/types";
import { cn } from "@/lib/cn";

/** Moves the book's stage forward only (going back to edit never "un-finishes" later steps). */
export function forwardStage(book: Pick<Book, "stage">, next: Stage): Stage {
  return stageOrder.indexOf(next) > stageOrder.indexOf(book.stage) ? next : book.stage;
}

export function newChapterId(): string {
  return `ch-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotFound() {
  return (
    <AppShell active="new">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-10 py-24">
        <h1 className="font-display text-2xl font-medium">We couldn’t find this book</h1>
        <p className="text-md text-secondary">
          Books are saved in this browser. If you started it on another device or cleared your browser data, it won’t be here.
        </p>
        <Link href="/" className={cn("inline-flex h-10 items-center gap-2 rounded-md bg-inverse px-4 font-medium text-on-inverse", focusRing)}>
          Start a new book
        </Link>
      </div>
    </AppShell>
  );
}

export function StepHeader({ title, intro, back }: { title: string; intro?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="mb-8">
      {back && (
        <Link href={back.href} className={cn("mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-secondary hover:text-primary", focusRing)}>
          <ArrowLeft aria-hidden className="size-3.5" /> {back.label}
        </Link>
      )}
      <h1 className="font-display text-2xl font-medium">{title}</h1>
      {intro && <p className="mt-2 text-md text-secondary">{intro}</p>}
    </header>
  );
}

export function SectionLabel({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} className="mb-2 text-sm font-semibold text-primary">
      {children}
    </p>
  );
}
