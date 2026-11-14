"use client";

import { useState, type ReactNode } from "react";
import { BookCard, Cover, getCoverDesign, type ArtDirection } from "@/entities/book";
import {
  ProgressList,
  Wordmark,
  Button,
  Card,
  Chip,
  ChipGroup,
  Dialog,
  Input,
  Textarea,
  Stepper,
  useToast,
} from "@/shared/ui";

const TITLE = "Design Systems for Small Teams";
const LONG = "Design Systems for Small Teams: A Practical Field Guide for Founders and First Hires";

const colors = [
  { name: "bg-canvas", cls: "bg-canvas", maps: "paper-50", use: "Page background" },
  { name: "bg-surface", cls: "bg-surface", maps: "paper-0", use: "Cards, inputs" },
  { name: "bg-subtle", cls: "bg-subtle", maps: "paper-100", use: "Sidebar, panels" },
  { name: "bg-inverse", cls: "bg-inverse", maps: "ink-900", use: "Primary button" },
  { name: "text-secondary", cls: "bg-secondary", maps: "ink-500", use: "Hints, meta" },
  { name: "border-default", cls: "bg-default", maps: "paper-300", use: "Borders" },
  { name: "border-strong", cls: "bg-strong", maps: "paper-400", use: "Hover borders" },
  { name: "accent", cls: "bg-accent", maps: "terracotta-500", use: "Active step, focus" },
  { name: "accent-subtle", cls: "bg-accent-subtle", maps: "terracotta-100", use: "Active nav" },
  { name: "text-accent", cls: "bg-accent-strong", maps: "terracotta-700", use: "Links" },
  { name: "danger", cls: "bg-danger", maps: "red-600", use: "Errors (+ icon + text)" },
  { name: "success", cls: "bg-success", maps: "green-600", use: "Done" },
  { name: "warning", cls: "bg-warning", maps: "amber-600", use: "Soft nudges" },
];

const type = [
  { name: "text-hero · brand", cls: "font-brand text-hero font-bold", sample: "Turn what you know" },
  { name: "text-2xl · brand", cls: "font-brand text-2xl font-bold tracking-tight", sample: "Tell us about your book" },
  { name: "text-xl · brand", cls: "font-brand text-xl font-bold tracking-tight", sample: "Your outline" },
  {
    name: "text-lg · display (book)",
    cls: "font-display text-lg font-medium",
    sample: "Chapter 1 — Start with an audit",
  },
  {
    name: "reader · display (book)",
    cls: "font-display text-reader",
    sample: "A design system is a shared language. Start small.",
  },
  { name: "text-md · ui", cls: "text-md", sample: "Founders and product teams of 3–10 people" },
  { name: "text-base · ui", cls: "text-base", sample: "Three quick questions. You can change everything later." },
  { name: "text-sm · ui", cls: "text-sm", sample: "~6 chapters · ~16 pages · 20-minute read" },
  { name: "text-xs · ui", cls: "text-xs", sample: "YOUR BOOK" },
];

const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
const moods = ["Practical", "Inspiring", "Calm", "Bold", "Playful"].map((l) => ({ value: l.toLowerCase(), label: l }));
const directions: ArtDirection[] = ["editorial", "geometric", "organic", "typographic"];

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="border-t border-default py-10">
      <h2 className="font-brand text-xl font-bold tracking-tight">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-base text-secondary">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Showcase() {
  const { show } = useToast();
  const [mood, setMood] = useState("practical");
  const [tags, setTags] = useState<string[]>(["calm"]);
  const [dialog, setDialog] = useState(false);
  const [topic, setTopic] = useState("");

  return (
    <div className="mx-auto max-w-5xl px-10 py-12">
      <header className="pb-10">
        <Wordmark className="text-[40px]" />
        <h1 className="mt-6 font-brand text-3xl font-bold tracking-tight">Design system</h1>
        <p className="mt-2 max-w-2xl text-md text-secondary">
          Warm editorial: paper tones, ink text, one terracotta accent. Grotesk headlines in the interface, a serif for
          the book itself. Tokens in three tiers — primitive → semantic → component. Everything on this page is built
          from them.
        </p>
      </header>

      <Section
        title="Color"
        note="Semantic tokens and the primitive each one maps to. Components never use primitives directly."
      >
        <div className="grid grid-cols-3 gap-4">
          {colors.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className={`size-12 shrink-0 rounded-md border border-default ${c.cls}`} />
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-secondary">
                  {c.maps} · {c.use}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Typography"
        note="Newsreader for the book voice, Geist for the interface, Bricolage Grotesque for the wordmark only."
      >
        <div className="flex flex-col gap-4">
          {type.map((t) => (
            <div key={t.name} className="grid grid-cols-[180px_1fr] items-baseline gap-6">
              <span className="text-xs text-secondary">{t.name}</span>
              <span className={t.cls}>{t.sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Spacing, radius, shadows"
        note="4 px base. Radius 6 / 10 / 16 / full. Two UI shadows plus a book shadow for covers."
      >
        <div className="flex items-end gap-3">
          {spacing.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <span className="block bg-accent-subtle" style={{ width: s, height: s }} />
              <span className="text-xs text-secondary">{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-6">
          {["rounded-sm", "rounded-md", "rounded-lg", "rounded-full"].map((r) => (
            <div
              key={r}
              className={`flex size-20 items-center justify-center border border-default bg-surface text-xs text-secondary ${r}`}
            >
              {r.replace("rounded-", "")}
            </div>
          ))}
          {["shadow-sm", "shadow-md", "shadow-book"].map((s) => (
            <div
              key={s}
              className={`flex size-20 items-center justify-center rounded-md bg-surface text-xs text-secondary ${s}`}
            >
              {s.replace("shadow-", "")}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons" note="Primary is ink, not the accent. Loading disables the button and announces busy.">
        <div className="flex flex-col gap-4">
          {(["primary", "secondary", "ghost"] as const).map((v) => (
            <div key={v} className="flex items-center gap-3">
              <span className="w-24 text-xs text-secondary">{v}</span>
              <Button variant={v}>Write my book</Button>
              <Button variant={v} size="sm">
                Small
              </Button>
              <Button variant={v} disabled>
                Disabled
              </Button>
              <Button variant={v} loading>
                Writing…
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fields" note="Errors always come with an icon and text — never color alone.">
        <div className="grid max-w-3xl grid-cols-2 gap-6">
          <Input
            label="Topic"
            placeholder="e.g. Design systems for small teams"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input label="Who is it for?" hint="One sentence is enough" defaultValue="Founders and product teams" />
          <Input label="Topic" error="Tell us a bit more — what should the reader learn?" defaultValue="asdf" />
          <Textarea label="What should readers do after reading?" hint="Becomes the last page of your book" autoGrow />
        </div>
      </Section>

      <Section title="Chips" note="Single choice is a radio group (arrow keys); multi choice uses toggle buttons.">
        <div className="flex flex-col gap-5">
          <ChipGroup label="Theme and tone" options={moods} mode="single" value={mood} onChange={setMood} />
          <ChipGroup label="Tags" options={moods} mode="multi" value={tags} onChange={setTags} />
          <div className="flex gap-2">
            <Chip>for startups</Chip>
            <Chip selected>first design system</Chip>
          </div>
        </div>
      </Section>

      <Section title="Stepper and cards">
        <Stepper steps={["Describe", "Title", "Outline", "Build", "Review"]} current={2} />
        <div className="mt-6 flex gap-4">
          <Card className="w-64 p-5">
            <p className="font-display text-lg font-medium">Static card</p>
            <p className="mt-1 text-sm text-secondary">Surface, default border.</p>
          </Card>
          <Card interactive className="w-64 p-5">
            <p className="font-display text-lg font-medium">Interactive card</p>
            <p className="mt-1 text-sm text-secondary">Hover for border and shadow.</p>
          </Card>
        </div>
      </Section>

      <Section title="Generation progress" note="Each step has a text status; a failed step retries on its own.">
        <Card className="max-w-md p-5">
          <ProgressList
            items={[
              { id: "outline", label: "Outline · 6 chapters", status: "done" },
              { id: "ch1", label: "Chapter 1 — Start with an audit", status: "done" },
              {
                id: "ch2",
                label: "Chapter 2 — Tokens before components",
                status: "working",
                detail: "About 10 seconds left",
              },
              { id: "ch3", label: "Chapter 3 — Your first five components", status: "failed" },
              { id: "cover", label: "Cover", status: "waiting" },
            ]}
            onRetry={(id) => show({ tone: "info", message: `Retrying ${id}…` })}
          />
        </Card>
      </Section>

      <Section title="Feedback">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => show({ tone: "success", message: "Book saved" })}>
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              show({ tone: "info", message: "Chapter rewritten", action: { label: "Undo", onClick: () => {} } })
            }
          >
            Toast with undo
          </Button>
          <Button
            variant="secondary"
            onClick={() => show({ tone: "error", message: "Couldn't create the PDF. Try again." })}
          >
            Error toast
          </Button>
          <Button variant="secondary" onClick={() => setDialog(true)}>
            Open dialog
          </Button>
        </div>
        <Dialog
          open={dialog}
          onOpenChange={setDialog}
          title="Regenerate the outline?"
          description="Your chapter edits will be replaced. You can undo this."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialog(false)}>
                Keep my outline
              </Button>
              <Button onClick={() => setDialog(false)}>Regenerate</Button>
            </>
          }
        />
      </Section>

      <Section
        title="Covers"
        note="Four art directions. Composition comes from the title, palette from the mood; the title always fits — even 83 characters."
      >
        <div className="flex flex-wrap gap-6">
          {directions.map((d) => (
            <div key={d} className="flex flex-col gap-2">
              <Cover
                design={getCoverDesign({ title: TITLE, mood: "practical", direction: d })}
                title={TITLE}
                author="Ivan Pavlov"
              />
              <span className="text-xs text-secondary">{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-6">
          {directions.map((d) => (
            <Cover
              key={d}
              design={getCoverDesign({ title: LONG, mood: "calm", direction: d, variant: 1 })}
              title={LONG}
              author="Ivan Pavlov"
              size="sm"
            />
          ))}
        </div>
      </Section>

      <Section title="Book cards">
        <div className="flex gap-4">
          <BookCard
            title={TITLE}
            status="draft"
            design={getCoverDesign({ title: TITLE, mood: "practical" })}
            author="Ivan Pavlov"
          />
          <BookCard
            title="Calm Mornings for Busy Founders"
            status="finalized"
            design={getCoverDesign({ title: "Calm Mornings for Busy Founders", mood: "calm" })}
            author="Ivan Pavlov"
          />
        </div>
      </Section>
    </div>
  );
}
