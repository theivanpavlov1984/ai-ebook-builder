import { cn } from "@/shared/lib";
import { chapterBlocks } from "../lib/chapter-blocks";

/**
 * A chapter's text for reading: paragraphs, with the closing "Try this today" list set as a box,
 * the same way the PDF prints it. `highlight` marks changed paragraphs (a suggested rewrite);
 * `caret` shows the typing cursor after the last paragraph while a chapter is being written.
 */
export function ChapterText({
  body,
  highlight,
  caret,
  className,
}: {
  body: string[];
  highlight?: boolean[];
  caret?: boolean;
  className?: string;
}) {
  const blocks = chapterBlocks(body);
  return (
    <div className={cn("flex flex-col gap-4 font-display text-reader", className)}>
      {blocks.map((b, i) => {
        const last = i === blocks.length - 1;
        if (b.kind === "action") {
          const changed = Boolean(highlight?.[b.from] || highlight?.[b.from + 1]);
          return (
            <section
              key={b.from}
              aria-label={b.heading}
              className={cn(
                "rounded-lg border bg-accent-subtle px-5 py-4",
                changed ? "border-accent" : "border-transparent",
              )}
            >
              {changed && <span className="sr-only">Changed: </span>}
              <p className="font-ui text-xs font-semibold tracking-wider text-accent-strong uppercase">{b.heading}</p>
              <ol className="mt-3 flex flex-col gap-2 text-md">
                {b.steps.map((step, n) => (
                  <li key={n} className="flex gap-3">
                    <span aria-hidden className="w-4 shrink-0 font-ui text-sm font-semibold text-accent-strong">
                      {n + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          );
        }
        return (
          <p
            key={b.from}
            className={cn(
              "whitespace-pre-line",
              highlight?.[b.from] && "-mx-3 rounded-md border-l-2 border-accent bg-accent-subtle px-3 py-1",
            )}
          >
            {highlight?.[b.from] && <span className="sr-only">Changed: </span>}
            {b.text}
            {caret && last && (
              <span aria-hidden className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-accent align-middle" />
            )}
          </p>
        );
      })}
    </div>
  );
}
