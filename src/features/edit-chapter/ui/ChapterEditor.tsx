"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { useBooks, type Chapter } from "@/entities/book";
import { Button, Input, Textarea, useToast } from "@/shared/ui";
import { bodyToText, textToBody } from "../model/text";

/**
 * The author's own words: the chapter's title and text as plain fields. Saving keeps the previous text
 * as a version (Undo in the panel brings it back), so editing by hand is as safe as a suggested rewrite.
 */
export function ChapterEditor({
  bookId,
  chapter,
  onDone,
  onDirtyChange,
}: {
  bookId: string;
  chapter: Chapter;
  onDone: () => void;
  /** Tells the page whether there are unsaved changes, so leaving the chapter can ask first. */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const editChapter = useBooks((s) => s.editChapter);
  const { show } = useToast();
  const [title, setTitle] = useState(chapter.title);
  const [text, setText] = useState(() => bodyToText(chapter.body));
  const [errors, setErrors] = useState<{ title?: string; text?: string }>({});
  const dirty = title.trim() !== chapter.title || textToBody(text).join("\n\n") !== chapter.body.join("\n\n");

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  // Closing or reloading the tab with unsaved changes gets the browser's own "Leave site?" question.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save(e?: FormEvent) {
    e?.preventDefault();
    const body = textToBody(text);
    const next = {
      title: title.trim() ? undefined : "Give the chapter a title.",
      text: body.length ? undefined : "A chapter needs some text. To remove it, change the outline instead.",
    };
    setErrors(next);
    if (next.title || next.text) return;
    editChapter(bookId, chapter.id, { title: title.trim(), body });
    show({ tone: "success", message: "Chapter saved – Undo in the panel brings the previous text back" });
    onDone();
  }

  function onKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
  }

  return (
    <form
      onSubmit={save}
      onKeyDown={onKeyDown}
      aria-label="Edit chapter"
      className="mt-6 flex flex-col gap-5"
      noValidate
    >
      <Input
        label="Chapter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        className="font-display text-lg"
      />
      <Textarea
        label="Text"
        autoGrow
        value={text}
        onChange={(e) => setText(e.target.value)}
        error={errors.text}
        hint="Leave an empty line between paragraphs. A numbered list under “Try this today:” shows as a box."
        className="font-display text-reader"
      />
      {/* Pinned to the bottom of the reading view: a long chapter on a laptop screen pushed these out of sight. */}
      <div className="sticky bottom-0 z-10 -mx-2 flex items-center gap-3 border-t border-default bg-canvas/95 px-2 py-3 backdrop-blur-sm">
        <Button type="submit">Save changes</Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <span className="ml-auto text-xs text-secondary">⌘ Enter to save</span>
      </div>
    </form>
  );
}
