import { Stepper } from "@/shared/ui";
import { type Book, type Stage, stageOrder } from "@/entities/book";

const steps = ["Describe", "Title", "Outline", "Build", "Review"];
const routes: Stage[] = ["describe", "title", "outline", "build", "review"];

/**
 * The creation stepper for one book: the step on screen, and every step the book has reached as a link back.
 * Final sits past the last step, so on Final all five are done.
 */
export function BookStepper({ book, stage }: { book: Pick<Book, "id" | "stage">; stage: Stage }) {
  return (
    <Stepper
      steps={steps}
      current={stageOrder.indexOf(stage)}
      reached={stageOrder.indexOf(book.stage)}
      links={routes.map((r) => `/book/${book.id}/${r}`)}
    />
  );
}
