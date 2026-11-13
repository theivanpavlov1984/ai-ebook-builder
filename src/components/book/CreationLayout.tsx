import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { Stepper } from "@/components/ui/Stepper";
import type { Book, Stage } from "@/lib/book/types";
import { BookPanel } from "./BookPanel";

const steps = ["Describe", "Title", "Outline", "Build", "Review"];
const stepIndex: Record<Stage, number> = { describe: 0, title: 1, outline: 2, build: 3, review: 4, final: 5 };

/** Stepper on top, a 640 px form column and the "Your book" panel on the right. */
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
      <div className="mx-auto flex max-w-[1080px] flex-col gap-10 px-10 py-8">
        <Stepper steps={steps} current={stepIndex[stage]} />
        <div className="grid grid-cols-[minmax(0,640px)_280px] justify-between gap-12">
          <div className="min-w-0">{children}</div>
          {aside ?? <BookPanel book={book} />}
        </div>
      </div>
    </AppShell>
  );
}
