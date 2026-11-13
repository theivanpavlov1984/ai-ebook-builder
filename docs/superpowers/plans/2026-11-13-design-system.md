# Primer Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Primer's design system – 3-tier tokens, fonts, ~10 components, the app shell and a `/system` page that shows it all.

**Architecture:** Tokens live as CSS custom properties in `src/styles/tokens.css` (primitive → semantic → component); Tailwind 4 maps its theme to the semantic tokens so components use utilities like `bg-canvas`, never raw values. UI components in `src/components/ui/`, book-specific ones in `src/components/book/`. Radix is used only for Dialog behavior. Screen layouts for the creation steps (form 640 px + book panel 280 px) and the studio (260 / flexible / 320 px) belong to the product-flow plan that follows this one.

**Tech Stack:** Next.js 16.4.6 (App Router, `src/`), React 19.3.0, TypeScript 5, Tailwind CSS 4.3.3, `next/font/google`, `@radix-ui/react-dialog`, `lucide-react`, Vitest + Testing Library (jsdom).

**Spec:** `docs/design-system.md` (product context: `FLOW.md`)

## Global Constraints

- Versions are pinned by the project: Next.js 16.4.6, React 19.3.0, Tailwind 4.3.3. Before writing code against any library API, read the docs for the installed version (`node_modules/next/dist/docs/` for Next.js, Context7 for the rest). No APIs from memory.
- No raw color values (`#hex`, `rgb(`, `hsl(`) in `src/components/**` and `src/app/**` – only tokens. Single exception: cover palettes in `src/components/book/cover-design.ts` (covers are content).
- Fonts: `font-display` = Newsreader 500; `font-ui` = Geist 400/500/600; `font-brand` = Bricolage Grotesque 800 (wordmark only).
- Primary button = ink (`bg-inverse`), never the accent. Errors = `danger` color **plus** icon **plus** text.
- Every interactive element has a visible `:focus-visible` ring using `focus-ring`.
- `prefers-reduced-motion`: remove movement, keep opacity transitions only.
- UI copy is English.
- Repository is public: no private notes or personal data in code or comments.
- Commits: authored by Ivan, **no AI attribution lines**, and only after Ivan says so – "Commit" steps mean *stage and ask*; batch them at checkpoints if Ivan prefers.

## Review Focus

1. **A very long book title** (60+ characters) on a cover → the title shrinks to fit inside the cover, never crops or overflows. Test in Task 7.
2. **Double-clicking a primary action while it's loading** → only one action fires; the button is disabled and announces busy. Test in Task 2.
3. **Keyboard-only use of the mood selector** (single-choice chips) → arrow keys move the selection, it's announced as a radio group. Test in Task 3.
4. **A field error read by a screen reader or a color-blind user** → error has text, an icon and `aria-invalid` + `aria-describedby`, not just red. Test in Task 2.
5. **A generation step that fails** → the failed item shows an error label and a "Try again" button that calls retry with that item's id only. Test in Task 5.

---

## File structure

```
src/styles/tokens.css              all tokens (3 tiers) + reduced-motion rule
src/app/globals.css                Tailwind import + theme mapping to semantic tokens
src/app/fonts.ts                   next/font definitions → CSS variables
src/app/layout.tsx                 applies font variables, body = canvas/ui font
src/lib/cn.ts                      class joiner
src/components/ui/Button.tsx
src/components/ui/Field.tsx        Input + Textarea (shared label/hint/error)
src/components/ui/Chip.tsx         Chip + ChipGroup
src/components/ui/Card.tsx
src/components/ui/Stepper.tsx
src/components/ui/Toast.tsx        ToastProvider + useToast
src/components/ui/Dialog.tsx
src/components/book/ProgressList.tsx
src/components/book/cover-design.ts  pure cover logic (palettes, mood → direction, fit)
src/components/book/Cover.tsx
src/components/book/BookCard.tsx
src/components/shell/AppShell.tsx  sidebar + Wordmark
src/app/system/page.tsx            the design-system page
src/test/setup.ts, vitest.config.mts, *.test.ts(x) next to the code
```

---

### Task 1: Tokens, theme mapping, fonts, test setup

**Files:**
- Create: `src/styles/tokens.css`, `src/app/fonts.ts`, `src/lib/cn.ts`, `vitest.config.mts`, `src/test/setup.ts`, `src/styles/tokens.test.ts`, `src/test/no-raw-colors.test.ts`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `package.json` (scripts `test`, `test:watch`), `src/app/page.tsx` (replace starter content with a placeholder that uses tokens)

**Interfaces:**
- Produces: CSS variables `--{primitive}` (e.g. `--paper-50`), semantic `--color-*`, component `--button-primary-bg` etc.; Tailwind utilities `bg-canvas bg-surface bg-subtle bg-inverse text-primary text-secondary text-inverse text-accent border-default border-strong bg-accent bg-accent-subtle text-danger bg-danger-subtle text-success bg-success-subtle text-warning bg-warning-subtle ring-focus`, font utilities `font-display font-ui font-brand`, shadow `shadow-sm shadow-md shadow-book`, radius `rounded-sm/md/lg/full` with spec values, text sizes `text-xs … text-3xl` and `text-reader` with spec line heights.
- Produces: `cn(...parts: Array<string | false | null | undefined>): string`.

- [ ] **Step 1: Install test tooling** – `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` as devDependencies; `vitest.config.mts` with jsdom, `@/` alias to `src/`, setup file importing jest-dom matchers. Check each package's docs for the current setup.

- [ ] **Step 2: Write the failing tests**

`src/styles/tokens.test.ts` – reads `tokens.css` as text:
```ts
const semantic = ['bg-canvas','bg-surface','bg-subtle','bg-inverse','text-primary','text-secondary',
  'text-inverse','text-accent','border-default','border-strong','accent','accent-subtle','focus-ring',
  'danger','danger-subtle','success','success-subtle','warning','warning-subtle'];
it('defines every semantic color token', () => semantic.forEach(t => expect(css).toMatch(new RegExp(`--color-${t}:`))));
it('semantic tokens reference primitives, not raw values', () =>
  semantic.forEach(t => expect(css).toMatch(new RegExp(`--color-${t}:\\s*(var\\(|color-mix\\()`))));
it('defines primitives with spec values', () => {
  expect(css).toMatch(/--paper-50:\s*#FBF8F3/i); expect(css).toMatch(/--ink-900:\s*#1F1B16/i);
  expect(css).toMatch(/--terracotta-500:\s*#C2512C/i); expect(css).toMatch(/--red-600:\s*#C0262D/i);
});
it('has a reduced-motion rule', () => expect(css).toMatch(/prefers-reduced-motion:\s*reduce/));
```
`src/test/no-raw-colors.test.ts` – walks `src/components` and `src/app` (`.ts`, `.tsx`, `.css` except `globals.css`), skips `cover-design.ts`, asserts no match for `/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i`.

- [ ] **Step 3: Run** `npm test` → token tests FAIL (file missing).

- [ ] **Step 4: Implement** `tokens.css` with every primitive and semantic from spec §4.1–4.2, spacing is Tailwind's default 4px scale, radius/shadow/motion values from §4.4, component tokens: `--button-primary-bg: var(--color-bg-inverse)`, `--button-primary-text: var(--color-text-inverse)`, `--input-border: var(--color-border-default)`, `--input-border-focus: var(--color-accent)`, `--chip-selected-bg: var(--color-bg-inverse)`; `focus-ring` = accent at 35% via `color-mix`. Map Tailwind theme to semantic tokens in `globals.css` (check Tailwind 4.3 docs for `@theme` and variable references). `fonts.ts`: Newsreader (500), Geist (400/500/600), Bricolage Grotesque (800) via `next/font/google` exposing CSS variables consumed by `font-display/ui/brand` (check Next 16 font docs). `layout.tsx`: apply variables, `<body class="bg-canvas text-primary font-ui text-base">`.

- [ ] **Step 5: Run** `npm test` → PASS; `npm run build` → succeeds; `npm run lint` → clean.

- [ ] **Step 6: Commit** (stage, ask Ivan) – `feat: design tokens, theme mapping and fonts`

---

### Task 2: Button and form fields

**Files:** Create `src/components/ui/Button.tsx`, `Button.test.tsx`, `src/components/ui/Field.tsx`, `Field.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 1).
- Produces: `Button(props: ButtonHTMLAttributes & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'md' | 'sm'; loading?: boolean; icon?: ReactNode })` – default `primary`/`md`.
- Produces: `Input(props: InputHTMLAttributes & { label: string; hint?: string; error?: string })`, `Textarea(props: TextareaHTMLAttributes & { label: string; hint?: string; error?: string; autoGrow?: boolean })`.

- [ ] **Step 1: Write the failing tests**
```tsx
it('loading button is disabled, busy, and fires once', async () => {
  const onClick = vi.fn(); render(<Button loading onClick={onClick}>Write my book</Button>);
  const b = screen.getByRole('button', { name: /write my book/i });
  expect(b).toBeDisabled(); expect(b).toHaveAttribute('aria-busy', 'true');
  await userEvent.dblClick(b); expect(onClick).not.toHaveBeenCalled();
});
it('primary uses inverse tokens', () => { render(<Button>Go</Button>);
  expect(screen.getByRole('button')).toHaveClass('bg-inverse', 'text-inverse'); });
it('input error is announced with text, icon and aria', () => {
  render(<Input label="Topic" error="Tell us a bit more about the topic" />);
  const input = screen.getByLabelText('Topic');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  const msg = screen.getByText('Tell us a bit more about the topic');
  expect(input.getAttribute('aria-describedby')).toContain(msg.id);
  expect(msg.closest('[data-field-error]')?.querySelector('svg')).not.toBeNull();
});
it('hint is linked when there is no error', () => { render(<Input label="Topic" hint="One sentence is enough" />);
  expect(screen.getByLabelText('Topic')).toHaveAccessibleDescription('One sentence is enough'); });
it('textarea autoGrow grows with content', ...); // assert style.height changes after typing 5 lines
```

- [ ] **Step 2: Run** → FAIL (modules missing).
- [ ] **Step 3: Implement** both files (add `lucide-react` for icons). Ids via `useId`. Error icon: Lucide `AlertCircle` 16px. Focus: `focus-visible:ring-2 ring-focus`. Loading: spinner + `aria-busy`, `disabled`.
- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Commit** (stage, ask) – `feat: button and form fields`

---

### Task 3: Chips, Card, Stepper

**Files:** Create `src/components/ui/Chip.tsx`, `Chip.test.tsx`, `Card.tsx`, `Stepper.tsx`, `Stepper.test.tsx`

**Interfaces:**
- Produces: `Chip(props: { selected?: boolean; onToggle?: () => void; children: ReactNode })` – a `button` with `aria-pressed`.
- Produces: `ChipGroup<T extends string>(props: { label: string; options: { value: T; label: string }[]; mode: 'single' | 'multi'; value: T | T[]; onChange: (v: T | T[]) => void })` – `single` renders `role="radiogroup"` with `role="radio"` + `aria-checked`, roving tabindex, Arrow keys move and select; `multi` renders Chips.
- Produces: `Card(props: HTMLAttributes & { interactive?: boolean })`.
- Produces: `Stepper(props: { steps: string[]; current: number })` – current item `aria-current="step"`, done items marked with a check and `data-state="done"`.

- [ ] **Step 1: Write the failing tests**
```tsx
const moods = ['Practical','Inspiring','Calm','Bold','Playful'].map(l => ({ value: l.toLowerCase(), label: l }));
it('single ChipGroup is a radio group operable by arrow keys', async () => {
  const onChange = vi.fn();
  render(<ChipGroup label="How should it feel?" options={moods} mode="single" value="practical" onChange={onChange} />);
  expect(screen.getByRole('radiogroup', { name: 'How should it feel?' })).toBeInTheDocument();
  screen.getByRole('radio', { name: 'Practical' }).focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(onChange).toHaveBeenCalledWith('inspiring');
  expect(screen.getByRole('radio', { name: 'Inspiring' })).toHaveFocus();
});
it('multi ChipGroup toggles values', ...); // click 'Calm' with value ['bold'] → onChange(['bold','calm'])
it('Stepper marks current and done steps', () => {
  render(<Stepper steps={['Describe','Title','Outline','Build','Review']} current={2} />);
  expect(screen.getByText('Outline').closest('li')).toHaveAttribute('aria-current', 'step');
  expect(screen.getByText('Describe').closest('li')).toHaveAttribute('data-state', 'done');
});
```
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Selected chip: `bg-inverse text-inverse`; Stepper current underline in `accent` (as in the approved mockup).
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** (stage, ask) – `feat: chips, card and stepper`

---

### Task 4: Toast and Dialog

**Files:** Create `src/components/ui/Toast.tsx`, `Toast.test.tsx`, `src/components/ui/Dialog.tsx`, `Dialog.test.tsx`; add `@radix-ui/react-dialog`.

**Interfaces:**
- Produces: `ToastProvider({ children })`, `useToast(): { show(t: { tone: 'success' | 'error' | 'info'; message: string; action?: { label: string; onClick: () => void }; durationMs?: number }): void }` – default duration 5000 ms; error toasts use `role="alert"`, others `role="status"`.
- Produces: `Dialog(props: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children?: ReactNode; footer?: ReactNode })`.

- [ ] **Step 1: Write the failing tests**
```tsx
it('toast action runs once and dismisses', async () => { /* show({tone:'info', message:'Chapter rewritten', action:{label:'Undo', onClick}}) → click Undo → onClick called once, toast gone */ });
it('error toast is an alert', () => { /* tone 'error' → getByRole('alert') has message */ });
it('toast auto-dismisses after durationMs', () => { /* vi.useFakeTimers, advance 5000 → gone */ });
it('dialog traps focus and closes on Escape', async () => {
  /* open → title is the accessible name of role dialog; Escape → onOpenChange(false) */ });
```
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** (read Radix Dialog docs for the installed version). Overlay uses `bg-inverse` with opacity; panel `bg-surface rounded-lg shadow-md`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** (stage, ask) – `feat: toast and dialog`

---

### Task 5: ProgressList (generation steps)

**Files:** Create `src/components/book/ProgressList.tsx`, `ProgressList.test.tsx`

**Interfaces:**
- Produces: `type StepStatus = 'waiting' | 'working' | 'done' | 'failed'`; `ProgressList(props: { items: { id: string; label: string; status: StepStatus; detail?: string }[]; onRetry?: (id: string) => void })` – rendered as a list with `aria-live="polite"`.

- [ ] **Step 1: Write the failing tests**
```tsx
const items = [{ id:'outline', label:'Outline', status:'done' }, { id:'ch1', label:'Chapter 1', status:'working' },
  { id:'ch2', label:'Chapter 2', status:'failed' }, { id:'cover', label:'Cover', status:'waiting' }] as const;
it('failed step shows text and retries only itself', async () => {
  const onRetry = vi.fn(); render(<ProgressList items={[...items]} onRetry={onRetry} />);
  const row = screen.getByText('Chapter 2').closest('li')!;
  expect(within(row).getByText(/couldn't write this part/i)).toBeInTheDocument();
  await userEvent.click(within(row).getByRole('button', { name: /try again/i }));
  expect(onRetry).toHaveBeenCalledExactlyOnceWith('ch2');
});
it('each status has a text label for screen readers', ...); // done / in progress / waiting
```
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Icons: done `Check` (success), working spinner (accent), waiting dot (secondary), failed `AlertCircle` (danger). Failed copy: "Couldn't write this part."
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** (stage, ask) – `feat: generation progress list`

---

### Task 6: Cover design logic (pure)

**Files:** Create `src/components/book/cover-design.ts`, `cover-design.test.ts`

**Interfaces:**
- Produces: `type Mood = 'practical' | 'inspiring' | 'calm' | 'bold' | 'playful'`; `type ArtDirection = 'editorial' | 'geometric' | 'organic' | 'typographic'`.
- Produces: `directionsForMood(mood: Mood): [ArtDirection, ArtDirection, ArtDirection]` – practical → editorial, geometric, typographic; inspiring → organic, editorial, typographic; calm → organic, editorial, geometric; bold → typographic, geometric, editorial; playful → geometric, organic, typographic.
- Produces: `hashSeed(text: string): number` – deterministic, non-negative 32-bit.
- Produces: `titleFontSize(title: string, base: number, min: number): number` – non-increasing in title length, never below `min`.
- Produces: `type CoverDesign = { direction: ArtDirection; palette: { bg: string; ink: string; accent: string; accent2: string }; seed: number }`; `getCoverDesign(input: { title: string; mood: Mood; direction?: ArtDirection; variant?: number }): CoverDesign` – 3 palettes per direction, picked by `(hashSeed(title) + variant) % 3`; `variant` drives "Shuffle".

- [ ] **Step 1: Write the failing tests**
```ts
it('same input → same design; variant changes it', () => {
  expect(getCoverDesign({ title:'Design Systems for Small Teams', mood:'practical' }))
    .toEqual(getCoverDesign({ title:'Design Systems for Small Teams', mood:'practical' }));
  expect(getCoverDesign({ title:'X', mood:'calm', variant:1 }).seed).not.toBe(getCoverDesign({ title:'X', mood:'calm' }).seed);
});
it('mood picks the first direction by default', () => expect(getCoverDesign({ title:'X', mood:'bold' }).direction).toBe('typographic'));
it('long titles shrink but respect the minimum', () => {
  const short = titleFontSize('Design Systems', 28, 14);
  const long = titleFontSize('Design Systems for Small Teams: A Practical Field Guide for Founders and First Hires', 28, 14);
  expect(long).toBeLessThan(short); expect(long).toBeGreaterThanOrEqual(14);
});
it('every palette meets 4.5:1 contrast between bg and ink', ...); // compute WCAG ratio for all 12 palettes
```
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Palettes (hex allowed here only) must harmonize with the app (paper/ink/terracotta family + greens, ochres, deep blue); contrast helper lives in this file.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** (stage, ask) – `feat: cover design logic`

---

### Task 7: Cover and BookCard components

**Files:** Create `src/components/book/Cover.tsx`, `Cover.test.tsx`, `src/components/book/BookCard.tsx`

**Interfaces:**
- Consumes: `CoverDesign`, `titleFontSize`, `hashSeed` (Task 6); `Card` (Task 3).
- Produces: `Cover(props: { design: CoverDesign; title: string; subtitle?: string; author?: string; size?: 'sm' | 'md' | 'lg' })` – an SVG (aspect 5:7) with `role="img"` and `aria-label` "`{title}` by `{author}`"; composition per direction derived from `design.seed`; title wraps inside a safe area and uses `titleFontSize`.
- Produces: `BookCard(props: { title: string; status: 'draft' | 'finalized'; design: CoverDesign; author?: string; onOpen?: () => void })`.

- [ ] **Step 1: Write the failing tests**
```tsx
it('cover is labelled for assistive tech', () => { /* getByRole('img', {name:'Design Systems for Small Teams by Ivan Pavlov'}) */ });
it('long title stays inside the safe area', () => {
  /* render with the 83-char title; every <tspan> line has font-size === titleFontSize(title, base, min)
     and the number of lines ≤ 5 (safe area); no line's text is truncated (joined lines === title) */ });
it('renders a different composition per direction', () => { /* 4 directions → 4 distinct data-direction attrs */ });
```
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement.** Directions per spec: editorial (serif title, rules), geometric (shapes from seed), organic (soft circles/blobs), typographic (oversized grotesk title, color block). Shadow `shadow-book`. No decorative fake text.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** (stage, ask) – `feat: cover and book card`

---

### Task 8: App shell and `/system` page

**Files:** Create `src/components/shell/AppShell.tsx`, `AppShell.test.tsx`, `src/app/system/page.tsx`; modify `src/app/layout.tsx` (wrap in `ToastProvider`).

**Interfaces:**
- Consumes: everything above.
- Produces: `Wordmark()` – "Primer" in `font-brand` + asterisk in `text-accent`; `AppShell(props: { active: 'new' | 'books'; children: ReactNode })` – sidebar 220px with `nav` links "New book" (`/`) and "My books" (`/books`), active one `aria-current="page"` + `bg-accent-subtle text-accent`.

- [ ] **Step 1: Write the failing test**
```tsx
it('marks the active nav item', () => { render(<AppShell active="new">x</AppShell>);
  expect(screen.getByRole('link', { name: /new book/i })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: /my books/i })).not.toHaveAttribute('aria-current'); });
```
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** AppShell.
- [ ] **Step 4: Build `/system`** inside AppShell, sections in this order: Colors (each semantic token: swatch, name, primitive it maps to), Typography (each scale step with its name), Spacing, Radius & shadows, Buttons (all variants × default / disabled / loading), Fields (default / hint / error / focus), Chips (single + multi), Stepper, Progress list (all four statuses), Toasts (buttons that trigger each tone), Dialog (button that opens one), Covers (4 directions × "Design Systems for Small Teams" + the 83-char title), Book cards (draft + finalized).
- [ ] **Step 5: Verify** `npm test`, `npm run lint`, `npm run build` all pass; open `/system` in the browser at 1280 and 1600 px and check against the approved mockup (paper tones, ink primary button, Newsreader headings, Geist UI, Primer\* wordmark); check keyboard focus is visible on every control.
- [ ] **Step 6: Commit** (stage, ask) – `feat: app shell and design system page`; after push, check the page on the Vercel URL.
