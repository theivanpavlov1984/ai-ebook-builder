import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { Stepper } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { type Book, type Stage, BookPanel } from "@/entities/book";

const steps = ["Describe", "Title", "Outline", "Build", "Review"];
const stepIndex: Record<Stage, number> = { describe: 0, title: 1, outline: 2, build: 3, review: 4, final: 5 };

/**
 * Stepper on top, a 640 px form column and the "Your book" panel on the right. Below lg (1024 px) it is one
 * column: the book panel turns into a compact card above the form, so the cover still reacts to every answer.
 */
export function CreationLayout({
  book,
  stage,
  children,
  aside,
}: {
  book: Book;
  stage: Stage;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <AppShell active="new">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-6 px-5 py-5 lg:gap-10 lg:px-10 lg:py-8">
        <Stepper steps={steps} current={stepIndex[stage]} />
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,640px)_280px] lg:justify-between lg:gap-12">
          {/* The compact book card leads on phones; a step's own panel (the build checklist) follows the content. */}
          <div className={cn("min-w-0 lg:order-1", aside ? "order-1" : "order-2")}>{children}</div>
          <div className={cn("lg:order-2", aside ? "order-2" : "order-1")}>{aside ?? <BookPanel book={book} />}</div>
        </div>
      </div>
    </AppShell>
  );
}
