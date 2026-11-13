"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Textarea } from "@/components/ui/Field";
import { shapeIdea } from "@/lib/ai/generate";
import { validateTopic } from "@/lib/ai/validate";
import { useBooks } from "@/lib/book/store";

export function StartForm() {
  const router = useRouter();
  const createBook = useBooks((s) => s.createBook);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string>();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const check = validateTopic(topic);
    if (!check.ok) {
      setError(check.message);
      setSuggestions(check.suggestions);
      return;
    }
    const id = createBook(topic.trim());
    router.push(`/book/${id}/describe`);
  }

  function choose(s: string) {
    setTopic(s);
    setError(undefined);
    setSuggestions([]);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Textarea
        label="What's your book about?"
        placeholder="e.g. Morning routines for remote workers"
        value={topic}
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
        error={error}
        hint="One sentence is enough. You can change everything later."
        rows={2}
        autoGrow
        className="text-lg"
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Suggestions">
          {suggestions.map((s) => (
            <Chip key={s} onToggle={() => choose(s)}>
              {s}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" icon={<ArrowRight aria-hidden className="size-4" />} className="flex-row-reverse">
          Start your book
        </Button>
        <Button
          variant="ghost"
          icon={<Sparkles aria-hidden className="size-4 text-accent" />}
          onClick={() => {
            setError(undefined);
            setSuggestions(shapeIdea(topic));
          }}
        >
          Help me shape this idea
        </Button>
      </div>
    </form>
  );
}
