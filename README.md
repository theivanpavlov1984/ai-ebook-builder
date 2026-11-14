# Primer – an AI eBook builder (prototype)

Primer takes a first-time creator from a rough idea to a finished lead-magnet eBook: describe the idea,
pick a title, shape the outline, let AI write the chapters, review, then download a PDF or share a landing page
that collects readers' emails.

**Live:** https://ai-ebook-builder-mu.vercel.app

This is a home-assignment prototype: no backend and no real model. The AI layer is simulated in the browser
with realistic latency and failures you can switch on (`?fail=ch2,cover,all` or the Demo controls in the header).

## Docs

- [FLOW.md](FLOW.md) – the user flow and its states
- [RESEARCH.md](RESEARCH.md) – who it's for and what competitors do
- [docs/design-system.md](docs/design-system.md) – tokens, components, rules
- [PROCESS.md](PROCESS.md) – how AI was used, day by day: what worked and where it was wrong

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest + Testing Library
npm run lint         # ESLint, incl. architecture boundaries
npm run format       # Prettier (+ Tailwind class order)
```

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, zustand (books saved in
localStorage), @react-pdf/renderer (real PDF in the browser), lz-string (share links in the URL hash).

## Architecture

The code follows [Feature-Sliced Design](https://feature-sliced.design). `src/` is split into layers; a layer
may only import from the layers below it.

```
src/
  app/        Next.js routes, root layout, global styles. Pages are thin: they render a view.
  views/      Screens. FSD calls this layer "pages" – renamed so Next.js doesn't treat it as the Pages Router.
    landing/  create-book/ (5 wizard steps)  review/  books/  shared-book/  design-system/
  widgets/    Big reusable blocks: layout (app shell, creation layout), live-preview, example-shelf
  features/   User actions: start-book, rewrite-chapter, change-cover, download-pdf, simulate-failures
  entities/   Business entities: book – its types, store, cover generation, share links, simulated AI writer
  shared/     No product knowledge: ui (design-system components), lib, api (simulated network), styles (tokens)
```

Each slice has segments by purpose (`ui/`, `model/`, `api/`, `lib/`) and a public API in `index.ts`.

Three rules, enforced by ESLint (`eslint.config.mjs`), so a wrong import fails `npm run lint`:

1. **Only downward imports.** `features` can use `entities` and `shared`, never `widgets` or `views`.
2. **No cross-imports between slices** of one layer (e.g. `rewrite-chapter` doesn't know `change-cover`).
3. **Only through the public API.** `@/entities/book`, not `@/entities/book/model/store`. Inside a slice – relative imports.

A few placement decisions worth knowing:

- **The AI writer lives in `entities/book/api`.** It's the simulated backend for book content, used by many features
  and views, so it sits below them. The generic part (latency, injected failures) is in `shared/api`.
- **The cover is part of the book entity.** Cover design and the cover "scene" are computed once and drawn twice:
  as SVG on screen and by react-pdf in the PDF, so the two can't drift apart.
- **`download-pdf` exposes only `downloadPdf()`.** react-pdf and the fonts load on click, not with the page.
- **The five wizard steps are one view slice** (`create-book`): they share the generation model and tests.

Tests sit next to the code they cover. `src/test/no-raw-colors.test.ts` fails if a hex/rgb color appears
outside the token file (covers and the PDF's print palette are the documented exceptions).
