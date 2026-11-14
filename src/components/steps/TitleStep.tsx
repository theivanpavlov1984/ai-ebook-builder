"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { CreationLayout } from "@/components/book/CreationLayout";
import { Button, focusRing } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { suggestTitles, type TitleStyle } from "@/lib/ai/generate";
import { useBooks } from "@/lib/book/store";
import { useBook } from "@/lib/book/useHydrated";
import { cn } from "@/lib/cn";
import { forwardStage, NotFound, SectionLabel, StepHeader } from "./shared";

const styleLabel: Record<TitleStyle, string> = {
  yours: "Your words",
  clear: "Clear",
  benefit: "Benefit-led",
  bold: "Bold",
  playful: "Playful",
};

type Option = { style: TitleStyle; title: string };

export function TitleStep({ id }: { id: string }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <TitleForm id={id} />;
}

function TitleForm({ id }: { id: string }) {
  const router = useRouter();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);

  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<Option[]>(() => suggestTitles(book, 0));
  const [selected, setSelected] = useState(() => book.title || options[0].title);
  const [custom, setCustom] = useState(() =>
    book.title && !options.some((o) => o.title === book.title) ? book.title : "",
  );
  const [subtitle, setSubtitle] = useState(book.subtitle);
  const [author, setAuthor] = useState(book.author);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const effective = custom.trim() || selected;

  function moreIdeas() {
    const next = round + 1;
    const fresh = suggestTitles(book, next);
    // Keep the chosen option in its slot, refresh the rest.
    setOptions(fresh.map((o, i) => (options[i].title === selected ? options[i] : o)));
    setRound(next);
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const delta =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    setSelected(options[next].title);
    setCustom("");
    refs.current[next]?.focus();
  }

  function submit() {
    updateBook(id, {
      title: effective.trim(),
      subtitle: subtitle.trim(),
      author: author.trim() || "Anonymous",
      stage: forwardStage(book, "outline"),
    });
    router.push(`/book/${id}/outline`);
  }

  const checkedIndex = custom.trim() ? -1 : options.findIndex((o) => o.title === selected);

  return (
    <CreationLayout book={{ ...book, title: effective, subtitle, author }} stage="title">
      <StepHeader
        title="Give your book a title"
        intro="Your own words are always an option. Pick one, or write your own."
        back={{ href: `/book/${id}/describe`, label: "Back to description" }}
      />

      <div className="flex flex-col gap-8">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <SectionLabel id="title-ideas">Title ideas</SectionLabel>
            <Button variant="ghost" size="sm" icon={<RefreshCw aria-hidden className="size-3.5" />} onClick={moreIdeas}>
              More ideas
            </Button>
          </div>
          <div role="radiogroup" aria-labelledby="title-ideas" className="flex flex-col gap-2">
            {options.map((o, i) => {
              const checked = i === checkedIndex;
              return (
                <button
                  key={`${o.style}-${o.title}`}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked || (checkedIndex === -1 && i === 0) ? 0 : -1}
                  onClick={() => {
                    setSelected(o.title);
                    setCustom("");
                  }}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-left transition-colors duration-150",
                    checked ? "border-inverse bg-surface shadow-sm" : "border-default bg-surface hover:border-strong",
                    focusRing,
                  )}
                >
                  <span className="font-display text-lg leading-snug font-medium">{o.title}</span>
                  <span className="shrink-0 text-xs text-secondary">{styleLabel[o.style]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Or write your own"
          placeholder="Your title"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-6">
          <Input
            label="Subtitle (optional)"
            placeholder="e.g. A practical guide for small teams"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <Input label="Author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>

        <div>
          <Button onClick={submit} disabled={!effective.trim()}>
            Continue
          </Button>
        </div>
      </div>
    </CreationLayout>
  );
}
