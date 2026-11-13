# Primer – design system

Status: **approved v1** (Nov 13). The visual language and the small design system for the prototype.
Product context: `FLOW.md`. Research behind it: `RESEARCH.md`.

---

## 1. Intent

Primer helps a first-time author make a lead-magnet eBook. The UI has two jobs:

1. **Feel familiar and calm** – a SaaS tool people trust with their work.
2. **Feel like a book product** – so the promise "your book will look professional" is visible
   from the first screen.

**Goals:** distinctive but quiet; covers are the visual hero; every screen built from the same tokens.
**Non-goals:** a brand book, dark mode, mobile layouts (the brief asks for desktop).
**Anti-goals – this fails even if it works:** looks like a generic AI SaaS (coral gradient, glossy cards,
stats dashboard); looks like a template; inconsistent spacing or type between screens.

## 2. Direction

**"Warm editorial"** – paper tones, a dark-ink text color, one terracotta accent, serif headlines.
Logo from a bolder direction: a heavy grotesk wordmark **Primer\*** with a terracotta asterisk.

Chosen from three mockups (warm editorial / quiet studio / bold publisher):
- *Warm editorial* keeps the warmth Ivan liked in getebook.ai but adds a book character, so it doesn't
  read as a competitor's clone.
- *Quiet studio* was more premium but colder and further from the brief's audience.
- *Bold publisher* was memorable but too loud for a calm step-by-step flow – kept only its wordmark.

## 3. Approaches considered (how it's built)

| Approach | Trade-off | Decision |
|---|---|---|
| **Own tokens (3 tiers) in CSS variables + Tailwind reading them + own components; Radix primitives only for dialog/menu accessibility** | A bit more work up front; full control and a design system that's genuinely ours | **Picked** – the brief asks to *define* a design system, and this mirrors how I build them in production |
| shadcn/ui themed with our colors | Fastest; but the result looks like every shadcn app, and the "system" is mostly someone else's | Rejected – works against "distinctive" |
| Plain CSS Modules, no Tailwind | No utility layer; slower to build screens in 4 days | Rejected – no benefit for a prototype |

## 4. Token architecture

Three tiers, like a production system:

```
primitive  →  semantic  →  component
paper-50      bg-canvas     button-primary-bg
ink-900       text-primary  input-border-focus
...
```

- **Primitives** – raw values. Never used directly in components.
- **Semantic** – meaning: background, text, border, accent, status. Components use these.
- **Component** – only where a component needs its own decision (buttons, inputs, chips, cover).
- All tokens are CSS custom properties in one file (`src/styles/tokens.css`).
  Tailwind's theme maps to the semantic tokens, so utilities like `bg-canvas` or `text-secondary` exist
  and raw hex values never appear in components.

### 4.1 Color – primitives

| Token | Value | Token | Value |
|---|---|---|---|
| `paper-0` | `#FFFFFF` | `ink-900` | `#1F1B16` |
| `paper-50` | `#FBF8F3` | `ink-700` | `#3D362E` |
| `paper-100` | `#F5F0E8` | `ink-500` | `#7A7166` |
| `paper-200` | `#EDE6DA` | `ink-400` | `#9A9085` |
| `paper-300` | `#E7DFD3` | | |
| `paper-400` | `#D6CBBB` | | |
| `terracotta-50` | `#FBF0EA` | `red-50` | `#FDECEC` |
| `terracotta-100` | `#F4DED3` | `red-600` | `#C0262D` |
| `terracotta-300` | `#E2A07F` | `green-50` | `#EAF4EE` |
| `terracotta-500` | `#C2512C` | `green-600` | `#2F7A4F` |
| `terracotta-700` | `#9A3B1C` | `amber-50` | `#FDF4E3` |
| | | `amber-600` | `#A86A10` |

### 4.2 Color – semantic

| Token | Maps to | Use |
|---|---|---|
| `bg-canvas` | paper-50 | Page background |
| `bg-surface` | paper-0 | Cards, inputs, panels |
| `bg-subtle` | paper-100 | Sidebar, side panels, hover |
| `bg-inverse` | ink-900 | Primary button, selected chip |
| `text-primary` | ink-900 | Body and headings |
| `text-secondary` | ink-500 | Hints, meta |
| `text-inverse` | paper-50 | On dark |
| `text-accent` | terracotta-700 | Links, active nav |
| `border-default` | paper-300 | Inputs, cards, dividers |
| `border-strong` | paper-400 | Hover borders |
| `accent` | terracotta-500 | Active step, focus, brand details |
| `accent-subtle` | terracotta-100 | Active nav background, highlights |
| `focus-ring` | terracotta-500 at 35% | Focus outline |
| `danger` / `danger-subtle` | red-600 / red-50 | Errors |
| `success` / `success-subtle` | green-600 / green-50 | Done states |
| `warning` / `warning-subtle` | amber-600 / amber-50 | Soft nudges (e.g. "the book is getting long") |

**Rules**
- The primary button is **dark ink, not the accent** – keeps the UI calm and away from the coral-SaaS look.
- Terracotta is close to red, so **errors use a cooler red and always come with an icon and text** –
  color is never the only signal.
- Text contrast meets WCAG AA on canvas and surface; verify `text-secondary` and `accent` on every background used.

### 4.3 Typography

| Role | Font | Use |
|---|---|---|
| `font-display` | **Newsreader** (500) | Screen headlines, book titles in UI, chapter text in the reader and PDF |
| `font-ui` | **Geist** (400 / 500 / 600) | Everything else in the interface |
| `font-brand` | **Bricolage Grotesque** (800) | The wordmark only |

Scale (size / line height, px):

| Token | Size | Font | Use |
|---|---|---|---|
| `text-xs` | 12 / 16 | UI | Labels, meta |
| `text-sm` | 13 / 20 | UI | Secondary UI text |
| `text-base` | 14 / 22 | UI | Default UI text |
| `text-md` | 16 / 24 | UI | Inputs, emphasized body |
| `text-lg` | 20 / 28 | Display | Section titles |
| `text-xl` | 28 / 34 | Display | Panel titles |
| `text-2xl` | 36 / 42 | Display | Screen headlines |
| `text-3xl` | 48 / 52 | Display | Home headline |
| `reader-body` | 18 / 30 | Display | Chapter text |

### 4.4 Spacing, radius, elevation, motion

- **Spacing:** 4 px base – 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Radius:** `sm` 6 · `md` 10 · `lg` 16 · `full` (chips, pills).
- **Shadows:** `sm` `0 1px 2px rgba(31,27,22,.06)` · `md` `0 4px 16px rgba(31,27,22,.08)` ·
  `book` `0 1px 2px rgba(0,0,0,.08), 0 12px 28px rgba(31,27,22,.18)` (covers only).
- **Motion:** `fast` 150 ms · `base` 250 ms · `slow` 400 ms, easing `cubic-bezier(.2,.8,.2,1)`.
  With `prefers-reduced-motion`, movement is removed and only opacity changes remain.

### 4.5 Layout

- **App shell:** sidebar 220 px (wordmark, *New book*, *My books*) + content.
- **Creation steps (1–3):** form column max 640 px + book card panel 280 px on the right.
- **Studio (step 5):** three columns – structure 260 px · book (flexible) · adjust panel 320 px.
- Target desktop widths 1280–1600 px; works down to 1024 px.

## 5. Components (v1)

Each has default, hover, focus, active, disabled and – where relevant – loading and error states.

| Component | Variants / notes |
|---|---|
| **Button** | primary (ink), secondary (surface + border), ghost; sizes md / sm; loading state |
| **Input** | label, hint, error message; focus ring in accent |
| **Textarea** | same as Input, auto-grow |
| **Chip** | choice (single / multi), suggestion; selected = ink background |
| **Card** | surface + border; interactive variant with hover |
| **Stepper** | the 5-step progress (Describe → Title → Outline → Build → Review); done / current / upcoming |
| **Progress list** | generation steps with status: waiting / working / done / failed + retry |
| **Toast** | success / error / info; with optional action ("Undo") |
| **Dialog** | built on Radix for focus and keyboard handling; our styling |
| **Cover** | renders a book cover from title, author, mood and art direction (see `FLOW.md` §5) |
| **Book card** | cover + title + status + actions (for *My books* and the side panel) |

**Covers have their own palettes** per art direction – they are content, not UI, so they don't use the
app's semantic tokens. They do follow the same typography rules: the title always fits, no fake micro-text.

## 6. The `/system` page

A page in the prototype that shows the whole system: color tokens with names, type scale, spacing,
radius, shadows, every component in every state, and sample covers in each art direction.
Reviewers can check consistency without opening Figma.

## 7. Builder's calls (made during review)

- **Icons:** one outline icon set with a consistent stroke (Lucide), 16 / 20 px, `currentColor`.
- **Where things live:** tokens in `src/styles/tokens.css`; UI components in `src/components/ui/`;
  product components (Cover, Book card, Progress list) in `src/components/book/`.

## 8. Left to the builder

- Exact Tailwind 4.3 syntax for mapping CSS variables into the theme – check the docs for the installed version.
- Loading fonts through Next.js 16's font API – check the docs for the installed version.
- Radix packages and versions for Dialog (and a menu, if needed) – check the docs before use.
- Fine-tuning values that look off in the real UI is expected; any change goes into `tokens.css`, never inline.
