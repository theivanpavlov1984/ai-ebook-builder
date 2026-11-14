import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "./Button";
import { cn } from "@/shared/lib";

export function StepHeader({
  title,
  intro,
  back,
}: {
  title: string;
  intro?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          href={back.href}
          className={cn(
            "mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm text-secondary hover:text-primary",
            focusRing,
          )}
        >
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
