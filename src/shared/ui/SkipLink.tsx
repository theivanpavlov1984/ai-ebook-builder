import { cn } from "@/shared/lib";
import { focusRing } from "./Button";

/** The id of the element a page's skip link jumps to – put it on the page's <main>. */
export const CONTENT_ID = "content";

/**
 * "Skip to content": the first stop for keyboard users, hidden until focused, so they don't tab through
 * the navigation on every page.
 */
export function SkipLink() {
  return (
    <a
      href={`#${CONTENT_ID}`}
      className={cn(
        "sr-only rounded-md bg-surface px-4 py-2 text-base font-medium text-primary shadow-md",
        "focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50",
        focusRing,
      )}
    >
      Skip to content
    </a>
  );
}
