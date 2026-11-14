"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Cover } from "./Cover";
import { bookDesign } from "./BookPanel";
import { focusRing } from "@/shared/ui";
import { useBooks } from "../model/store";
import { useHydrated } from "../model/useHydrated";
import { cn } from "@/shared/lib";

const stageLabel = {
  describe: "Describing",
  title: "Choosing a title",
  outline: "Planning the outline",
  build: "Writing",
  review: "Reviewing",
  final: "Finalizing",
} as const;

export function ContinueCard() {
  const hydrated = useHydrated();
  const latest = useBooks(
    (s) =>
      Object.values(s.books)
        .filter((b) => !b.finalizedAt)
        .sort((a, b) => b.updatedAt - a.updatedAt)[0],
  );
  if (!hydrated || !latest) return null;
  const title = latest.title || latest.topic;

  return (
    <Link
      href={`/book/${latest.id}/${latest.stage}`}
      className={cn(
        "flex items-center gap-4 rounded-lg border border-default bg-surface p-4 transition-colors duration-150 hover:border-strong",
        focusRing,
      )}
    >
      <Cover design={bookDesign(latest)} title={title} size="none" className="w-12" />
      <div className="flex-1">
        <p className="text-xs text-secondary">{stageLabel[latest.stage]} · saved on this device</p>
        <p className="font-display text-md font-medium">Continue “{title}”</p>
      </div>
      <ArrowRight aria-hidden className="size-4 text-secondary" />
    </Link>
  );
}
