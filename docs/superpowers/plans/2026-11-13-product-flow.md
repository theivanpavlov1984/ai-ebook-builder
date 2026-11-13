# Primer Product Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Primer's full flow – Home → Describe → Title → Outline → Build → Review → Final (PDF + share), plus My books and the shared book page – on the existing design system, with simulated AI.

**Architecture:** A persisted client store holds books; each step is its own route under `/book/[id]/…`. A simulation layer (`src/lib/ai/`) mimics model calls (async, timed, streaming, injectable failures) and draws from a hand-written demo book or templates. Covers are computed once as a "scene" rendered by both the screen (SVG) and the PDF (react-pdf).

**Tech Stack:** Next.js 16.4.6 App Router, React 19.3, TypeScript, Tailwind 4.3 + Primer tokens, zustand 5 (persist), lz-string 1.5, @react-pdf/renderer 4.9, @fontsource WOFF files, Vitest + Testing Library.

**Spec:** `FLOW.md` (product), `docs/product-build.md` (build decisions), `docs/design-system.md` (look).

## Global Constraints

- Read docs for the installed version before using any library API (Next: `node_modules/next/dist/docs/`; others: Context7). No APIs from memory.
- Only design-system tokens and components (`src/components/ui`, `src/components/book`, `src/components/shell`); the no-raw-colors test must stay green. New UI pieces go through tokens too.
- Copy is English, short, friendly, second person. No fake urgency, no credits, no stats.
- Lead-magnet defaults: 6 chapters, target 10–20 pages; nudge (warning tone) when the outline would exceed ~20 pages.
- Every async step has loading, success, empty and error states (design-system rule).
- Desktop layout: creation steps = form column max 640 px + book panel 280 px; studio = 260 px / flexible / 320 px.
- Persist to localStorage key `primer:v1`; nothing is sent to any server.
- Public repo: no private notes or personal data. Demo author name is "Ivan Pavlov" (the candidate's own name, used on purpose).
- Commits: authored by Ivan, no AI attribution, only when Ivan says so – stage per task, ask at the end.

## Review Focus

1. **Refreshing or closing the tab mid-generation** → the book comes back with finished chapters kept and a "Resume" that continues from the first unfinished one. Test in Task 7.
2. **A reviewer types their own topic** (not the demo) → every step still produces sensible text using their topic and audience – no "Design systems" leaking in. Test in Task 2.
3. **Opening a share link that was cut off or edited** → a friendly "This link looks incomplete" page, not a crash. Test in Task 10.
4. **Going back to Describe after the outline exists and changing the topic** → the user is warned that the outline will be redrafted, and can undo. Test in Task 6.
5. **Rewriting a chapter several times then undoing** → each undo restores the previous version exactly; undo is unavailable at version 1. Test in Task 8.

---

## File structure

```
src/lib/book/types.ts            Book, Chapter, Stage types
src/lib/book/store.ts            zustand store + persist, actions, history (undo)
src/lib/book/useHydrated.ts      gate client-only rendering after store hydration
src/lib/book/estimate.ts         page / reading-time estimates
src/lib/ai/validate.ts           topic validation (empty / short / gibberish / broad)
src/lib/ai/generate.ts           suggestAudiences, suggestTitles, draftOutline, writeChapter, ctaText
src/lib/ai/simulate.ts           delay + streaming + failure injection (?fail=…)
src/lib/ai/content/demo.ts       hand-written "Design Systems for Small Teams" book
src/lib/ai/content/templates.ts  topic-agnostic templates
src/lib/share.ts                 encodeBook / decodeBook (lz-string)
src/components/book/cover-scene.ts   scene computation (moved out of Cover.tsx)
src/components/book/Cover.tsx        renders scene as SVG (refactor)
src/components/book/BookPanel.tsx    right-hand "Your book" panel
src/components/book/CreationLayout.tsx  stepper + form column + panel
src/lib/pdf/fonts.ts, BookPdf.tsx, PdfCover.tsx, download.ts
public/fonts/*.woff
src/app/page.tsx (Home), src/app/books/page.tsx, src/app/book/[id]/{describe,title,outline,build,review,final}/page.tsx, src/app/b/page.tsx
```

---

### Task 1: Book model, store, estimates

**Files:** Create `src/lib/book/types.ts`, `store.ts`, `useHydrated.ts`, `estimate.ts`, `store.test.ts`, `estimate.test.ts`; add `zustand`.

**Interfaces:**
- Produces:
```ts
type Stage = 'describe' | 'title' | 'outline' | 'build' | 'review' | 'final';
type ChapterStatus = 'idle' | 'writing' | 'done' | 'failed';
type Chapter = { id: string; title: string; summary: string; body: string[]; status: ChapterStatus; versions: string[][] };
type Book = { id: string; createdAt: number; updatedAt: number; stage: Stage;
  topic: string; audience: string; mood: Mood; cta: string;
  title: string; subtitle: string; author: string;
  chapters: Chapter[]; cover: { direction: ArtDirection; variant: number; status: 'idle' | 'working' | 'done' | 'failed' };
  finalizedAt?: number };
```
- Store `useBooks` with state `{ books: Record<string, Book>; history: Record<string, Book[]> }` and actions:
  `createBook(topic: string): string` (id, stage 'describe', mood 'practical', author 'Ivan Pavlov', cover editorial/0) ·
  `updateBook(id, patch: Partial<Book>, opts?: { snapshot?: boolean }): void` ·
  `updateChapter(id, chapterId, patch: Partial<Chapter>): void` ·
  `rewriteChapter(id, chapterId, body: string[]): void` (pushes current body to `versions`) ·
  `undoChapter(id, chapterId): boolean` (pops last version; false at version 1) ·
  `undo(id): boolean` (restores last book snapshot) · `deleteBook(id)`.
  Persist key `primer:v1`.
- `useHydrated(): boolean`.
- `estimate(book: Pick<Book,'chapters'>): { pages: number; minutes: number }` – 1 page per ~250 words, 2 pages per outlined-but-unwritten chapter, +2 (cover, contents) +1 (CTA); minutes = words / 200, rounded up.

- [ ] **Step 1: Write the failing tests**
```ts
it('createBook returns an id and a describe-stage book', ...); // stage 'describe', topic set, chapters []
it('rewriteChapter keeps versions and undoChapter restores them in order', () => {
  /* body A → rewrite B → rewrite C; undo → B; undo → A; undo → false and body stays A */ });
it('undo restores the last snapshot only when one exists', ...);
it('updateBook bumps updatedAt', ...);
it('estimate: 6 outlined chapters ≈ 15 pages', () => expect(estimate({ chapters: six }).pages).toBe(15));
it('estimate counts written words', ...); // 2 chapters × 750 words → pages 2+3+3+... computed exactly
```
- [ ] **Step 2: Run** `npx vitest run src/lib/book` → FAIL.
- [ ] **Step 3: Implement** (zustand `create` + `persist` – read zustand 5 docs; ids via `crypto.randomUUID()`; history capped at 20 per book).
- [ ] **Step 4: Run** → PASS. **Step 5: Stage** – `feat: book model and store`

---

### Task 2: AI simulation and templates

**Files:** Create `src/lib/ai/validate.ts`, `generate.ts`, `simulate.ts`, `content/templates.ts`, tests `validate.test.ts`, `generate.test.ts`, `simulate.test.ts`; add `lz-string` later (Task 10) – not here.

**Interfaces:**
- `validateTopic(topic: string): { ok: true } | { ok: false; kind: 'empty' | 'short' | 'gibberish' | 'broad'; message: string; suggestions: string[] }` – empty → "What's your book about?"; < 3 words → short; no vowels / repeated keyboard runs → gibberish ("I couldn't make sense of that"); a single broad word from a list (`business, marketing, health, design, money, life, fitness, productivity`) → broad ("Let's narrow it down") with 3 narrower suggestions.
- `suggestAudiences(topic: string): string[]` (3).
- `shapeIdea(roughIdea: string): string[]` – 3 specific, actionable topic phrasings built from the rough idea ("Help me shape this idea"); for an empty idea, 3 example topics.
- `suggestTitles(b: { topic: string; audience: string; mood: Mood }): { style: 'yours' | 'clear' | 'benefit' | 'bold' | 'playful'; title: string }[]` – first item is always `{ style: 'yours', title: <topic in title case> }`.
- `draftOutline(b: Pick<Book,'topic'|'audience'|'mood'>): { title: string; summary: string }[]` – 6 items; uses the demo pack when `isDemoTopic(topic)` (contains "design system"), otherwise templates.
- `writeChapter(b, chapter: Pick<Chapter,'title'|'summary'>, opts?: { direction?: 'simpler' | 'detailed' | 'shorter' | 'practical' | 'warmer'; instruction?: string }): string[]` – paragraphs (≥ 4 normally, ≤ 3 when `shorter`; `practical` adds a numbered-steps paragraph; `instruction` adds a paragraph that addresses it).
- `ctaText(b: Pick<Book,'cta'|'author'|'title'>): { heading: string; body: string }`.
- `simulate<T>(key: string, produce: () => T, opts?: { ms?: number }): Promise<T>` – resolves after `ms` (default 600), rejects with `SimulatedFailure` if `key` is in active failures; `setFailures(keys: string[])`, `failuresFromUrl(search: string): string[]` (`?fail=ch2,cover` / `all`); a failure fires **once** per key, then clears (so "Try again" succeeds).
- `streamParagraphs(paragraphs: string[], onChunk: (text: string) => void, opts?: { cps?: number }): Promise<void>`.

- [ ] **Step 1: Write the failing tests**
```ts
it.each([['', 'empty'], ['design', 'broad'], ['asdf qwer', 'gibberish'], ['ux', 'short']])('validateTopic(%s) → %s', ...);
it('accepts a specific topic', () => expect(validateTopic('Morning routines for remote workers').ok).toBe(true));
it('custom topics never leak demo content', () => {
  const b = { topic: 'Sourdough baking for busy parents', audience: 'Parents with full-time jobs', mood: 'calm' as const };
  const text = JSON.stringify([draftOutline(b), writeChapter(b, draftOutline(b)[0])]);
  expect(text).not.toMatch(/design system|token|component/i);
  expect(text).toMatch(/sourdough/i);
});
it('suggestTitles puts the user wording first', ...);
it('shorter rewrite is shorter; practical adds steps', ...);
it('a failure fires once, then the retry succeeds', async () => {
  setFailures(['ch2']); await expect(simulate('ch2', () => 1, { ms: 0 })).rejects.toThrow();
  await expect(simulate('ch2', () => 1, { ms: 0 })).resolves.toBe(1); });
it('fail=all fails every key once', ...);
it('failuresFromUrl parses ?fail=ch2,cover', ...);
```
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Templates are deterministic (seeded by `hashSeed(topic)`) and read naturally for how-to guides. **Step 4: Run** → PASS. **Step 5: Stage** – `feat: simulated AI layer`

---

### Task 3: Demo book content

**Files:** Create `src/lib/ai/content/demo.ts`, `demo.test.ts`.

**Interfaces:** `isDemoTopic(topic: string): boolean`; `demoOutline: { title: string; summary: string }[]` (6 chapters for founders and teams of 3–10); `demoChapter(index: number): string[]` (chapter 1 fully written ~700–900 words; others 300–500 words); used by `generate.ts` (Task 2) via these names.

- [ ] **Step 1: Test** – 6 chapters; chapter 1 between 700 and 900 words; every chapter non-empty; no chapter repeats a paragraph; `isDemoTopic('Design systems for small teams')` true, `isDemoTopic('Sourdough')` false.
- [ ] **Step 2: Run** → FAIL. **Step 3: Write the content** – practical, accurate (tokens in three tiers, start with an audit, a small component set first, Figma↔code sync, governance on a small budget); avoid the over-technical jargon flagged in RESEARCH §6. Mark the file header "Draft – to be reviewed by Ivan". **Step 4: Run** → PASS. **Step 5: Stage** – `feat: demo book content`

---

### Task 4: Cover scene + layout pieces

**Files:** Create `src/components/book/cover-scene.ts`, `cover-scene.test.ts`, `BookPanel.tsx`, `CreationLayout.tsx`, `CreationLayout.test.tsx`; modify `Cover.tsx` to render the scene.

**Interfaces:**
- `type Shape = { kind: 'rect' | 'circle' | 'ellipse' | 'line'; attrs: Record<string, number | string> }`;
  `coverScene(design: CoverDesign, title: string, opts?: { author?: string; subtitle?: string }): { width: 200; height: 280; bg: string; shapes: Shape[]; title: { lines: string[]; x: number; y: number; size: number; lineGap: number; font: 'display' | 'ui' | 'brand'; weight: number; color: string }; author?: {...}; subtitle?: {...} }` – the logic now in `Cover.tsx` (wrap, fit, rng, art) moves here unchanged.
- `Cover` keeps its props; existing Cover tests must stay green.
- `BookPanel({ book }: { book: Book })` – cover (from `book.cover` + `getCoverDesign`), title or "Untitled book", audience, mood, `estimate`.
- `CreationLayout({ book, stage, children, aside? })` – `AppShell active="new"`, `Stepper` (Describe, Title, Outline, Build, Review; Final counts as Review done), 640 px column, `BookPanel` on the right.

- [ ] **Step 1: Tests** – scene is deterministic; scene title lines join to the title; Cover tests unchanged; CreationLayout shows the stepper with the right current step and the panel with the book title.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (pure move + render). **Step 4: Run** full suite → PASS. **Step 5: Stage** – `refactor: cover scene; feat: creation layout`

---

### Task 5: Home and My books

**Files:** Modify `src/app/page.tsx`; create `src/app/books/page.tsx`, `src/components/home/StartForm.tsx`, `StartForm.test.tsx`, `src/components/home/ExampleShelf.tsx`.

**Interfaces:** Consumes `useBooks.createBook`, `validateTopic`, `useHydrated`, `BookCard`. Produces routes `/` and `/books`.

- [ ] **Step 1: Tests** – StartForm: submitting a valid topic calls `router.push('/book/<id>/describe')` (mock `next/navigation`); an invalid topic shows the validation message + suggestion chips and doesn't navigate; clicking a suggestion fills the field. Home shows "Continue your book" when an unfinished book exists.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Home: wordmark headline "Turn what you know into a book." (display 3xl), one line "A finished, designed eBook in about five minutes.", StartForm, ExampleShelf (3 covers in different directions: the demo + "Calm Mornings for Busy Founders" + "The Freelance Pricing Playbook"). `/books`: shelf of BookCards (newest first), empty state with a "Start your first book" button.
- [ ] **Step 4: Run** → PASS. **Step 5: Stage** – `feat: home and my books`

---

### Task 6: Describe, Title, Outline steps

**Files:** Create `src/app/book/[id]/describe/page.tsx`, `title/page.tsx`, `outline/page.tsx`, `src/components/steps/DescribeStep.tsx`, `TitleStep.tsx`, `OutlineStep.tsx`, tests for each step component; a shared `useBook(id)` hook in `src/lib/book/useBook.ts` (returns `Book | undefined` + `notFound` state).

**Interfaces:** Consumes store actions, `validateTopic`, `suggestAudiences`, `suggestTitles`, `draftOutline`, `simulate`, `estimate`, `CreationLayout`. Each step sets `stage` when moving on.

- [ ] **Step 1: Tests**
  - Describe: topic + audience + mood (ChipGroup with mini covers) + optional "What should readers do after reading?"; Continue disabled until topic valid and audience non-empty; validation shown inline on blur/submit; "Help me shape this idea" shows 3 chips from `shapeIdea(topic)`, clicking one fills the topic.
  - **Review Focus 4:** on a book that already has chapters, changing the topic and pressing Continue opens a Dialog "Redraft your outline?"; confirming clears chapters (snapshot first) and shows a toast with Undo that restores them.
  - Title: shows 5 options, "yours" first and selected by default; "More ideas" refreshes the 4 AI ones but keeps the selection; optional subtitle and author; custom title input.
  - Outline: draft appears after a loading state (`simulate('outline')`); rename inline, remove (min 3 – "A book needs at least 3 chapters" + restore), reorder (up/down buttons, keyboard accessible), "Suggest another idea" per chapter, "Add chapter"; estimate line updates; > 20 pages shows the warning nudge; "Write my book" → `/build`. Outline failure shows an error with "Try again".
  - Unknown id → "We couldn't find this book" + link home.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS. **Step 5: Stage** – `feat: describe, title and outline steps`

---

### Task 7: Build (generation) step

**Files:** Create `src/app/book/[id]/build/page.tsx`, `src/components/steps/BuildStep.tsx`, `useGeneration.ts`, tests.

**Interfaces:** Consumes `writeChapter`, `simulate`, `streamParagraphs`, `failuresFromUrl`, store actions, `ProgressList`. Produces `useGeneration(bookId): { items: ProgressItem[]; activeChapterId?: string; streamingText: string; done: boolean; retry(id: string): void; resume(): void }`.

- [ ] **Step 1: Tests**
  - Generation runs chapters in order then the cover (`simulate('cover')`), streaming text into the open chapter; progress line "Writing chapter 3 of 6 · about 40 seconds left".
  - A failed chapter (`?fail=ch2`) is marked failed, the rest continue; "Try again" rewrites only it.
  - Cover failure falls back to the next art direction automatically and the cover still completes.
  - **Review Focus 1:** with a persisted book where chapters 1–2 are `done` and 3 is `writing`, mounting the step shows "Resume" status and continues from chapter 3 without rewriting 1–2.
  - When all done → button "Review your book" → `/review`; the user can open any finished chapter while the rest are writing.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Layout per FLOW §3.4: steps list left, the book (current chapter reading view + cover fading in) centre. Total simulated time ~45–60 s (per-chapter `ms` + streaming). **Step 4: Run** → PASS. **Step 5: Stage** – `feat: generation step`

---

### Task 8: Review studio

**Files:** Create `src/app/book/[id]/review/page.tsx`, `src/components/studio/Studio.tsx`, `ChapterPanel.tsx`, `CoverPanel.tsx`, tests.

**Interfaces:** Consumes `rewriteChapter`, `undoChapter`, `updateBook`, `writeChapter`, `simulate`, `getCoverDesign`, `directionsForMood`, `Cover`, `useToast`.

- [ ] **Step 1: Tests**
  - Three columns: structure (cover + chapters, statuses), reading view (selected chapter in `font-display text-reader`, or the cover), adjust panel for the selection.
  - Chapter: direction chips (simpler · more detailed · shorter · more practical · warmer) + free instruction + "Rewrite"; loading state; result replaces the body; version label "Version 2 of 2"; **Review Focus 5:** rewrite twice → undo twice restores v1 exactly; undo disabled at v1.
  - Cover: 3 options from `directionsForMood(mood)`; selecting one updates the book; "Shuffle" increments `variant`; title/subtitle/author fields re-fit the cover.
  - Rewrite failure → error toast + body unchanged.
  - "Finalize" → `/final`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS. **Step 5: Stage** – `feat: review studio`

---

### Task 9: PDF export

**Files:** Copy WOFF files to `public/fonts/` (from `@fontsource/newsreader` 400, 500, 400-italic; `@fontsource/geist` 400, 600; `@fontsource/bricolage-grotesque` 800 – latin subset); create `src/lib/pdf/fonts.ts`, `PdfCover.tsx`, `BookPdf.tsx`, `download.ts`, `pdf.test.tsx`; add `@react-pdf/renderer`.

**Interfaces:** `registerPdfFonts(baseUrl: string): void` (idempotent); `BookPdf({ book, fonts }: { book: Book; fonts: 'embedded' | 'standard' })` – pages: cover (full-bleed `PdfCover` from `coverScene`), contents, one section per chapter (Newsreader 11pt / 16pt leading, chapter title display), CTA page from `ctaText`, page numbers in footer from page 3; `downloadPdf(book: Book): Promise<void>` – dynamic import of react-pdf, `pdf(...).toBlob()`, file name `slugify(title).pdf`.

- [ ] **Step 1: Tests** (`// @vitest-environment node`) – rendering `BookPdf` with `fonts: 'standard'` to a buffer yields a file starting with `%PDF` and > 5 KB; `slugify('Design Systems for Small Teams!')` → `design-systems-for-small-teams`; `PdfCover` uses the same title lines as `coverScene`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (read react-pdf 4 docs: `Font.register`, `Svg` primitives, `pdf().toBlob`, Next.js notes). **Step 4: Run** → PASS; **manual check:** download from the browser, open the file, compare the cover with the screen.
- [ ] **Step 5: Stage** – `feat: PDF export`

---

### Task 10: Final step and shared book

**Files:** Create `src/lib/share.ts`, `share.test.ts`, `src/app/book/[id]/final/page.tsx`, `src/components/steps/FinalStep.tsx`, `src/app/b/page.tsx`, `src/components/reader/SharedBook.tsx`, tests; add `lz-string`.

**Interfaces:** `encodeBook(book: Book): string`, `decodeBook(hash: string): Book | null` (strips `#`, validates shape, null on garbage); `SharedBook({ book })`.

- [ ] **Step 1: Tests**
  - Round-trip `decodeBook(encodeBook(b))` equals the shareable fields of `b`.
  - **Review Focus 3:** truncated / edited / empty hash → `null`; `/b` then shows "This link looks incomplete" with a link home.
  - Final: spreads preview; gentle checklist (author name set; "I've skimmed the chapters – AI can make mistakes"); "Download PDF" (loading state; on failure: error toast + "Try again"); "Copy share link" (toast "Link copied"); finalize sets `finalizedAt`; "Keep editing" back to review.
  - Shared page: cover, contents, chapters, CTA, "Made with Primer" link.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS. **Step 5: Stage** – `feat: finalize, download and share`

---

### Task 11: Demo controls, offline banner, end-to-end pass

**Files:** Create `src/components/shell/DemoControls.tsx` (sidebar footer: toggles for "Fail chapter 2", "Fail cover", "Fail everything once" → `setFailures`), `src/components/shell/OfflineBanner.tsx`; modify `AppShell.tsx` to include both; tests.

- [ ] **Step 1: Tests** – toggles call `setFailures` with the right keys; OfflineBanner appears on the `offline` event and hides on `online`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** full suite, lint, build → all pass.
- [ ] **Step 5: Browser pass** (dev server, 1280 and 1600 px): demo topic end to end; a custom topic end to end; each failure from Demo controls; refresh mid-generation; download PDF and open it; open the share link in a new tab; keyboard-only run through Describe → Outline. Fix what breaks (each fix with a failing test first).
- [ ] **Step 6: Stage** – `feat: demo controls and offline banner`; ask Ivan to commit, merge and deploy; verify on the Vercel URL.
