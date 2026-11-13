# Primer – how the product is built

Status: **approved** (Nov 13). Companion to `FLOW.md` (what) and `docs/design-system.md` (look).
This file records the build decisions for the product screens.

## Decisions

| Area | Decision | Why |
|---|---|---|
| **PDF download** | A real PDF file generated in the browser with `@react-pdf/renderer` – cover, contents, chapters, call-to-action page, our fonts embedded | The brief says "download it"; a print dialog reads as a workaround and Build Quality is graded. *Chosen by Ivan over browser print.* |
| **Cover in two renderers** | Cover geometry is computed once as a "scene" (shapes + title lines); the screen renders it as SVG, the PDF renders the same scene with react-pdf's SVG primitives | One source of truth – the PDF cover always matches the screen |
| **Fonts in the PDF** | Static WOFF files (Newsreader 400/500 + italic, Geist 400/600, Bricolage 800) from `@fontsource`, copied to `public/fonts/` | react-pdf supports TTF/WOFF only, and not variable fonts |
| **State** | One client store (zustand + persist to localStorage). Each step has its own URL: `/book/[id]/describe → title → outline → build → review → final` | Back button works, refresh keeps the book (FLOW §4 "tab closed") |
| **Sharing** | Book compressed into the URL hash (`/b#…`, lz-string). Read-only page, no server | No backend in scope; the hash never reaches a server |
| **"AI"** | A simulation layer with the same shape as a real model call: async, timed, streaming text, injectable failures | Lets the UI be built exactly as it would be against a real model; failures can be demoed on purpose |
| **Content** | Hand-written demo book for "Design Systems for Small Teams" (Ivan reviews as the expert) + templates for any other topic | Reviewers will type their own topics; the demo topic shows the quality bar |
| **Failure demo** | `?fail=ch2`, `?fail=cover`, `?fail=all` URL flags and a small "Demo controls" menu | To show error recovery in the video |

## Cut order if time runs out
1. "Paste a paragraph you wrote" voice matching (bonus).
2. Side-by-side version compare (undo / restore stays).
3. "My books" shrinks to the last book only.
