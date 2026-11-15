"use client";

import { Info, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CreationLayout, NotFound } from "@/widgets/layout";
import {
  directionsForMood,
  type Mood,
  shapeIdea,
  suggestAudiences,
  validateTopic,
  useBooks,
  useBook,
  forwardStage,
} from "@/entities/book";
import { Button, Chip, ChipGroup, Dialog, Input, Textarea, useToast, SectionLabel, StepHeader } from "@/shared/ui";
import { simulate } from "@/shared/api";
import { fastTrack } from "../model/fastTrack";

const moods: { value: Mood; label: string }[] = [
  { value: "practical", label: "Practical" },
  { value: "inspiring", label: "Inspiring" },
  { value: "calm", label: "Calm" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
];

export function DescribeStep({ id }: { id: string }) {
  const { book, hydrated, notFound } = useBook(id);
  if (notFound) return <NotFound />;
  if (!hydrated || !book) return null;
  return <DescribeForm id={id} />;
}

function DescribeForm({ id }: { id: string }) {
  const router = useRouter();
  const { show } = useToast();
  const book = useBooks((s) => s.books[id]);
  const updateBook = useBooks((s) => s.updateBook);
  const undo = useBooks((s) => s.undo);
  const initialTopic = useRef(book.topic);

  const [topicError, setTopicError] = useState<string>();
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [audienceError, setAudienceError] = useState<string>();
  const [confirmRedraft, setConfirmRedraft] = useState(false);
  const [writing, setWriting] = useState(false);

  // Next keeps a page the user left mounted but hidden, and Back shows it again with its old state. Leaving
  // clears what belonged to that visit – a spinner from "Write it now", errors fixed since – so Back never
  // lands on a form that looks busy or wrong.
  useEffect(
    () => () => {
      setWriting(false);
      setTopicError(undefined);
      setAudienceError(undefined);
    },
    [],
  );

  const audiences = suggestAudiences(book.topic);
  const written = book.chapters.filter((c) => c.status === "done").length;

  /** After a failed check the cursor goes to the first field to fix, so nobody hunts for the error. */
  function focusField(fieldId: string) {
    document.getElementById(fieldId)?.focus();
  }

  function goNext(clearOutline: boolean) {
    if (clearOutline) {
      updateBook(id, { chapters: [] }, { snapshot: true });
      show({
        tone: "info",
        message: "Outline cleared – it will be redrafted.",
        action: { label: "Undo", onClick: () => undo(id) },
      });
    }
    updateBook(id, { stage: forwardStage(useBooks.getState().books[id], "title") });
    router.push(`/book/${id}/title`);
  }

  async function writeNow() {
    const check = validateTopic(book.topic);
    setTopicError(check.ok ? undefined : check.message);
    setTopicSuggestions(check.ok ? [] : check.suggestions);
    if (!check.ok) return focusField("describe-topic");

    const redraft = book.chapters.length > 0 && book.topic.trim() !== initialTopic.current.trim();
    setWriting(true);
    try {
      const current = useBooks.getState().books[id];
      const picks = await simulate("outline", () => fastTrack(current, { redraft }), { ms: 600 });
      updateBook(id, { ...picks, stage: forwardStage(current, "build") }, { snapshot: redraft });
      router.push(`/book/${id}/build`);
    } catch {
      setWriting(false);
      show({ tone: "error", message: "Couldn’t draft the outline. Try again, or continue step by step." });
    }
  }

  function submit() {
    const check = validateTopic(book.topic);
    const audienceOk = book.audience.trim().length > 0;
    setTopicError(check.ok ? undefined : check.message);
    setTopicSuggestions(check.ok ? [] : check.suggestions);
    setAudienceError(audienceOk ? undefined : "Who is this book for? A few words is enough.");
    if (!check.ok) return focusField("describe-topic");
    if (!audienceOk) return focusField("describe-audience");

    const topicChanged = book.topic.trim() !== initialTopic.current.trim();
    if (book.chapters.length > 0 && topicChanged) {
      setConfirmRedraft(true);
      return;
    }
    goNext(false);
  }

  return (
    <CreationLayout book={book} stage="describe">
      <StepHeader title="Tell us about your book" intro="Three quick questions. You can change everything later." />

      {written > 0 && (
        <p className="-mt-4 mb-6 flex items-start gap-2 rounded-md bg-subtle p-3 text-sm text-primary">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" />
          <span>
            Your book is already written. A new audience or tone won’t rewrite the chapters – rewrite them one by one in
            Review. A new topic starts a fresh outline.
          </span>
        </p>
      )}

      <form
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-3">
          <Textarea
            id="describe-topic"
            label="What's your book about?"
            value={book.topic}
            onChange={(e) => {
              updateBook(id, { topic: e.target.value });
              setTopicError(undefined);
            }}
            onBlur={() => {
              const check = validateTopic(book.topic);
              setTopicError(check.ok ? undefined : check.message);
              setTopicSuggestions(check.ok ? [] : check.suggestions);
            }}
            error={topicError}
            rows={2}
            autoGrow
          />
          <div className="flex flex-wrap items-center gap-2">
            {topicSuggestions.map((s) => (
              <Chip
                key={s}
                onToggle={() => {
                  updateBook(id, { topic: s });
                  setTopicError(undefined);
                  setTopicSuggestions([]);
                }}
              >
                {s}
              </Chip>
            ))}
            {topicSuggestions.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Sparkles aria-hidden className="size-3.5 text-accent" />}
                onClick={() => {
                  if (!book.topic.trim()) {
                    setTopicError("Write a rough idea first – a few words is enough.");
                    return focusField("describe-topic");
                  }
                  setTopicSuggestions(shapeIdea(book.topic));
                }}
              >
                Help me shape this idea
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Input
            id="describe-audience"
            label="Who is it for?"
            placeholder="e.g. Founders of early-stage startups"
            value={book.audience}
            onChange={(e) => {
              updateBook(id, { audience: e.target.value });
              setAudienceError(undefined);
            }}
            error={audienceError}
          />
          <div role="group" aria-label="Suggested audiences" className="flex flex-wrap gap-2">
            {audiences.map((a) => (
              <Chip
                key={a}
                selected={book.audience === a}
                onToggle={() => {
                  updateBook(id, { audience: a });
                  setAudienceError(undefined);
                }}
              >
                {a}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Theme &amp; tone</SectionLabel>
          <ChipGroup
            label="Theme and tone"
            options={moods}
            mode="single"
            value={book.mood}
            onChange={(mood) =>
              updateBook(id, { mood, cover: { ...book.cover, direction: directionsForMood(mood)[0], variant: 0 } })
            }
          />
          <p className="mt-2 text-sm text-secondary">
            How your book should feel. It sets the voice of the writing and the style of your cover – watch the cover
            change as you pick.
          </p>
        </div>

        <Textarea
          label="What should readers do after reading? (optional)"
          hint="Book a call, join your newsletter, visit your site – it becomes the last page of your book."
          value={book.cta}
          onChange={(e) => updateBook(id, { cta: e.target.value })}
          rows={2}
          autoGrow
        />

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={writing}>
              Continue
            </Button>
            <Button
              variant="secondary"
              loading={writing}
              icon={<Zap aria-hidden className="size-4 text-accent" />}
              onClick={() => void writeNow()}
            >
              Write it now
            </Button>
          </div>
          <p className="text-sm text-secondary">
            In a hurry? “Write it now” skips the title and outline steps and uses our suggestions
            {book.audience.trim() ? "" : ", including who it’s for"}. You can rename the book and rewrite any chapter
            later.
          </p>
        </div>
      </form>

      <Dialog
        open={confirmRedraft}
        onOpenChange={setConfirmRedraft}
        title="Redraft your outline?"
        description={
          written > 0
            ? `You changed the topic, so we’ll draft a new outline and write the book again – your ${written} written chapters will be replaced. You can undo this.`
            : "You changed the topic, so your current outline may no longer fit. We'll draft a new one – you can undo this."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRedraft(false)}>
              Keep my outline
            </Button>
            <Button
              onClick={() => {
                setConfirmRedraft(false);
                goNext(true);
              }}
            >
              Redraft outline
            </Button>
          </>
        }
      />
    </CreationLayout>
  );
}
