"use client";

import { Undo2, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button, ChipGroup, Textarea, useToast } from "@/shared/ui";
import { writeChapter, type RewriteDirection, useBooks, type Book, type Chapter } from "@/entities/book";
import { simulate } from "@/shared/api";

const directions: { value: RewriteDirection; label: string }[] = [
  { value: "simpler", label: "Simpler" },
  { value: "detailed", label: "More detailed" },
  { value: "shorter", label: "Shorter" },
  { value: "practical", label: "More practical" },
  { value: "warmer", label: "Warmer" },
];

export function ChapterPanel({ book, chapter, rewriteMs }: { book: Book; chapter: Chapter; rewriteMs: number }) {
  const { show } = useToast();
  const rewriteChapter = useBooks((s) => s.rewriteChapter);
  const undoChapter = useBooks((s) => s.undoChapter);
  const [direction, setDirection] = useState<RewriteDirection | "">("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);

  async function rewrite() {
    setBusy(true);
    try {
      const body = await simulate(
        "rewrite",
        () => writeChapter(book, chapter, { direction: direction || undefined, instruction }),
        { ms: rewriteMs },
      );
      rewriteChapter(book.id, chapter.id, body);
      setInstruction("");
      show({
        tone: "info",
        message: "Chapter rewritten",
        action: { label: "Undo", onClick: () => undoChapter(book.id, chapter.id) },
      });
    } catch {
      show({ tone: "error", message: "Couldn’t rewrite this chapter – your text is unchanged. Try again." });
    } finally {
      setBusy(false);
    }
  }

  const version = chapter.versions.length + 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium tracking-wider text-secondary uppercase">Adjust chapter</p>
        <p className="mt-1 font-display text-lg leading-snug font-medium">{chapter.title}</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Make it…</p>
        <ChipGroup
          label="Make it"
          options={directions}
          mode="single"
          value={direction as RewriteDirection}
          onChange={(v) => setDirection(v === direction ? "" : v)}
        />
      </div>

      <Textarea
        label="Or tell us what to change"
        placeholder="e.g. Add an example for a 3-person startup"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        rows={3}
        autoGrow
      />

      <Button
        onClick={() => void rewrite()}
        loading={busy}
        disabled={!direction && !instruction.trim()}
        icon={<Wand2 aria-hidden className="size-4" />}
      >
        Rewrite chapter
      </Button>

      <div className="flex items-center justify-between border-t border-default pt-4">
        <p className="text-sm text-secondary">
          Version {version}
          {version > 1 ? " · earlier versions kept" : ""}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={chapter.versions.length === 0}
          onClick={() => undoChapter(book.id, chapter.id)}
          icon={<Undo2 aria-hidden className="size-3.5" />}
        >
          Undo rewrite
        </Button>
      </div>
    </div>
  );
}
