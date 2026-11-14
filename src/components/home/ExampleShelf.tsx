import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { bookDesign } from "@/components/book/BookPanel";
import { Cover } from "@/components/book/Cover";
import { focusRing } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { sampleBooks } from "@/lib/samples";
import { encodeBook } from "@/lib/share";

const books = sampleBooks();
const kind = ["Practical guide", "Calm playbook", "Bold handbook"];

/** Real example books – each opens the page its readers would see. */
export function ExampleShelf() {
  return (
    <section aria-label="Example books" className="flex items-end gap-5">
      {books.map((b, i) => (
        <Link
          key={b.id}
          href={`/b#${encodeBook(b)}`}
          aria-label={`Peek inside ${b.title}`}
          className={cn("group flex flex-col gap-2 rounded-sm", i === 1 && "-translate-y-4", focusRing)}
        >
          <Cover
            design={bookDesign(b)}
            title={b.title}
            author={b.author}
            size="none"
            className="w-40 transition-transform duration-250 ease-standard group-hover:-translate-y-1"
          />
          <span className="flex items-center gap-1 text-xs text-secondary group-hover:text-accent-strong">
            {kind[i]}, peek inside <ArrowUpRight aria-hidden className="size-3" />
          </span>
        </Link>
      ))}
    </section>
  );
}
