"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button, Chip, focusRing } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { directionsForMood, exampleTopics, shapeIdea, validateTopic, useBooks, type Mood } from "@/entities/book";

/**
 * The landing's prompt card: one field, a hint, and a round "start" button.
 * Works on its own, or controlled (`value` + `onValueChange`) when a parent previews the topic live.
 * `mood` – the tone picked on the landing – is saved on the new book, so the Describe step starts from it.
 * `examples={false}` hides the example topics (the closing call to action repeats the field without them).
 */
export function StartForm({
  value,
  onValueChange,
  mood = "practical",
  examples = true,
}: { value?: string; onValueChange?: (v: string) => void; mood?: Mood; examples?: boolean } = {}) {
  const router = useRouter();
  const createBook = useBooks((s) => s.createBook);
  const updateBook = useBooks((s) => s.updateBook);
  const [inner, setInner] = useState("");
  const topic = value ?? inner;
  const setTopic = (v: string) => (onValueChange ? onValueChange(v) : setInner(v));
  const [error, setError] = useState<string>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fieldId = useId();
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  function submit(e: FormEvent) {
    e.preventDefault();
    const check = validateTopic(topic);
    if (!check.ok) {
      setError(check.message);
      setSuggestions(check.suggestions);
      return;
    }
    const id = createBook(topic.trim());
    if (mood !== "practical") {
      const book = useBooks.getState().books[id];
      updateBook(id, { mood, cover: { ...book.cover, direction: directionsForMood(mood)[0], variant: 0 } });
    }
    router.push(`/book/${id}/describe`);
  }

  function choose(s: string) {
    setTopic(s);
    setError(undefined);
    setSuggestions([]);
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-[760px] flex-col items-center gap-4">
      <div
        className={cn(
          "w-full rounded-[20px] border bg-surface px-5 pt-5 pb-3.5 text-left shadow-hero",
          "transition-[border-color,box-shadow] duration-150 ease-standard",
          "focus-within:ring-4 focus-within:ring-focus",
          error ? "border-danger" : "border-default focus-within:border-strong",
        )}
      >
        <label htmlFor={fieldId} className="sr-only">
          What&apos;s your book about?
        </label>
        <textarea
          id={fieldId}
          rows={2}
          value={topic}
          placeholder="What's your book about? e.g. Morning routines for remote workers"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
          onChange={(e) => {
            setTopic(e.target.value);
            if (error) setError(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="block w-full resize-none bg-transparent text-lg text-primary outline-none placeholder:text-secondary"
        />
        <div className="mt-2 flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            icon={<Sparkles aria-hidden className="size-3.5 text-accent" />}
            onClick={() => {
              setError(undefined);
              setSuggestions(shapeIdea(topic));
            }}
          >
            Help me shape this idea
          </Button>
          <div className="flex items-center gap-3">
            <span id={hintId} className="text-sm text-secondary">
              Free · no sign-up
            </span>
            <button
              type="submit"
              aria-label="Start my book"
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full bg-accent text-surface",
                "transition-colors duration-150 ease-standard hover:bg-accent-strong",
                focusRing,
              )}
            >
              <ArrowRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2" aria-label="Suggestions">
          {suggestions.map((s) => (
            <Chip key={s} onToggle={() => choose(s)}>
              {s}
            </Chip>
          ))}
        </div>
      ) : (
        examples &&
        !topic.trim() && (
          <div role="group" aria-label="Try an example" className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-secondary">Try:</span>
            {exampleTopics.map((s) => (
              <Chip key={s} onToggle={() => choose(s)}>
                {s}
              </Chip>
            ))}
          </div>
        )
      )}
    </form>
  );
}
