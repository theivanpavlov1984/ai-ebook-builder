# Product flow

Status: **draft v1** (Nov 12). Built on `RESEARCH.md`. Open questions are listed at the end.

---

## 1. Who it's for

**Primary user (confirmed by the stakeholder): people who create an eBook as a lead magnet.**
Typically an expert, coach or creator who wants a short, useful non-fiction guide to give away
in exchange for an email. They know their subject, but they are not writers or designers,
and they've never made a book.

**Their job:** _"Turn what I know into something that looks professional, fast enough that I actually finish it."_

**What "lead magnet" changes:**

- **Short and practical:** 6–8 chapters, ~15–25 pages, actionable – not a novel.
- **The book has a goal beyond reading:** a closing page with the author's call to action
  (website, booking link, newsletter) – generated with the rest, editable.
- **The cover has to sell in a thumbnail:** it'll live on landing pages and social posts,
  so the title must read at small sizes.
- **Built (bonus):** the share link opens a lead-magnet landing page – cover, pitch, "What you'll learn"
  and an email form; the book and the PDF unlock after a valid email. Email sending is simulated.
  Contrast's own Designrr work ends in exactly this kind of page – it's where a lead magnet earns its keep.

**What they fear:** a blank page, a result that looks cheap or obviously AI-made, losing their work,
and a tool that's harder to learn than the book is to write.

## 2. Design principles

Each one comes from a finding in `RESEARCH.md`.

1. **Never a blank page.** Every input has examples, suggestions and a "help me" option.
2. **Every AI decision is visible and reversible.** The AI suggests; the user can see why and change it.
3. **Waiting is reading.** The book appears as it's written – the wait becomes the first review.
4. **Control without starting over.** Change one chapter, one title, one cover – never the whole book.
5. **Finish the job.** Cover, structure, content, download and share in one flow.
6. **Honest about AI.** Remind the user to check facts before sharing.

## 3. The flow

```
Home → Describe → Title → Outline → Build → Review & adjust → Finalize → Shared book
            (1)        (2)      (3)       (4)          (5)             (6)         (7)
```

A persistent **book card** stays visible through steps 1–3: it fills in as the user answers
(topic, audience, mood, title) – the book takes shape before anything is generated.
Steps are shown in a simple progress bar; the user can go back to any completed step without losing data.

### 0. Home (inside the app)

**App shell:** a slim sidebar – _New book_ and _My books_. Familiar for a SaaS tool, but nothing more:
no stats, no achievements – they don't help someone who comes to make one lead magnet.

**First visit** – no empty dashboard ("0 eBooks" is a dead end). The home screen _is_ the start:

- One sentence: what it does and how long it takes (~5 minutes).
- The first question right there: "What's your book about?" – typing it starts step 1.
- A shelf of 3 example books in **different cover styles** – proof of quality before the first click.

**Returning user** – _My books_: a shelf of covers with status (draft / finalized), share link and download.
The covers are the hero of the screen, not numbers.

### 1. Describe the book

Three short questions on one screen:

| Question                            | Input                                                 | Help                                                                 |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| **What's your book about?** (topic) | Short text                                            | Example chips; "Help me shape this idea"                             |
| **Who is it for?** (audience)       | Short text                                            | Suggested audiences based on the topic                               |
| **Theme & tone** (mood)             | Choice: practical · inspiring · calm · bold · playful | Each option shows a mini cover preview – mood drives the cover style |

- _Interpretation:_ the brief asks for "topic, theme and audience". I read **theme** as the book's
  mood and voice, because that's what a non-writer can answer, and it's what both the writing tone
  and the cover design need.
- Optional fourth question: **What should readers do after reading?** (book a call, join a newsletter,
  visit a site) – it becomes the closing call-to-action page. Reviews and forums show this is the
  whole point of a lead magnet.
- Validation is a conversation, not an error: too short or too vague → a clarifying question with chips
  ("Design systems – for which team: startups, agencies, enterprise?").

### 2. Title

- 4 AI suggestions in different styles: clear · benefit-led · bold · playful.
- **The user's own wording is always one of the options** (getebook.ai silently rewrote it).
- Optional subtitle and author name.
- "More ideas" refreshes suggestions but keeps the selected one.

### 3. Outline (checkpoint)

- AI drafts 6–8 chapters, each with a one-line summary.
- Per chapter: rename, remove, reorder (drag), "suggest another idea". Plus "Add chapter".
- Shows the expected result: "6 chapters · ~16 pages · 20-minute read · ready in about a minute".
  If the outline grows past ~20 pages, a gentle nudge: lead magnets work best short.
- One button: **Write my book**. "Looks good" is the default – editing is optional.
- _Why a separate step:_ it's the cheapest moment to steer the AI, and it answers
  "control without starting over" before the long generation.

### 4. Build (generation)

Not a spinner – the book is assembled in front of the user:

- **Left:** the list of steps, each with status – outline ✓ → chapter 1…n → cover → layout.
- **Center:** the book itself. Chapters appear as they are written and are readable immediately.
  The cover fades in from a sketch to the final design.
- **Top:** honest progress ("Writing chapter 3 of 8 · about 40 seconds left").
- The user can read chapter 1 while the rest is being written.
- Simulated timing: ~45–60 seconds in total – realistic, but short enough for a demo.

### 5. Review & adjust ("the studio")

Three columns:

- **Left – Structure:** table of contents with status of each chapter.
- **Center – Book:** reading view of the selected chapter (or the cover).
- **Right – Adjust:** actions for whatever is selected.

**Adjust a chapter:**

- One-click directions: _simpler · more detailed · shorter · more practical (add steps) · warmer tone_.
- Or a free instruction: "Add an example for a 3-person startup".
- A rewrite arrives as a **suggestion**: changed paragraphs are highlighted, Original / Suggestion compares them,
  Keep or Discard decides. Kept rewrites become **versions** – undo restores the previous one.

**Adjust the cover:**

- 3 options in **different art directions** (see section 5).
- "Shuffle" varies the composition inside the chosen direction.
- Edit title, subtitle, author name – the cover re-fits automatically.

Global **undo** for every change.

### 6. Finalize

- Full preview as book spreads.
- A short check before sharing: author name set · facts reviewed ("AI can make mistakes – skim the
  chapters before you share") – a gentle checklist, not a blocker.
- **Download PDF** and **Share link** (copy). The book stays editable – finalize is not a dead end.

### 7. Shared book (public page)

- A clean reading page: cover, table of contents, chapters.
- Works without a backend: the book is encoded into the link.
- Small "Made with Primer" link – the growth loop.

## 4. States and failures

Every step has loading, empty, error and success states. Specific cases:

| Situation                             | What the user sees                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Topic empty or a single word          | Clarifying question + example chips                                                |
| Gibberish ("asdf")                    | "I couldn't make sense of that – here are some examples to start from"             |
| Topic too broad ("business")          | "Let's narrow it down" + chips with narrower topics                                |
| Title too long                        | Soft hint; cover auto-fits the text, never crops it                                |
| All chapters removed from the outline | "A book needs at least 3 chapters" + restore last removed                          |
| **One chapter fails to generate**     | That chapter is marked, with "Try again"; the rest of the book continues           |
| **The whole generation fails**        | Inputs and finished parts are kept; "Resume" continues from the last finished step |
| Cover fails                           | Falls back to another art direction automatically                                  |
| Tab closed or refreshed               | State is saved locally; "Continue your book" banner on return                      |
| Download fails                        | "Try again" + open a printable version as a fallback                               |
| Offline                               | Banner; actions that need "AI" wait and resume                                     |

**For the demo video:** a hidden "simulate failures" switch (dev menu) to show these states on purpose.

## 5. Cover system

The brief's bar: the cover must feel designed and reflect the theme, not a template with text swapped in.

- **4 art directions:** editorial (serif, big type, rules) · geometric (abstract shapes) ·
  organic (soft shapes, warm palettes) · bold typographic (oversized grotesk, color blocks).
- **Mood → direction and palette.** Practical → editorial/geometric, calm → organic, bold → typographic, etc.
- **Composition is generated, not fixed:** shapes, rhythm and color are derived from the title and topic,
  so two books never share the same cover. "Shuffle" changes the variation.
- **Typography rules:** the title always fits (auto-sized), contrast is checked, no fake micro-text.
- Rendered as SVG, so the same cover is used on screen and in the PDF.

## 6. How "AI" is simulated

No backend and no real AI – the brief allows simulation. To keep it convincing:

- **Demo topic** ("Design Systems for Small Teams"): fully written, hand-reviewed content.
  I know this subject, so the demo book is something I'd actually stand behind.
- **Any other topic** (reviewers will try their own): titles, outline and chapters are built from
  templates that use the user's topic, audience and mood. Chapter 1 is always fully written;
  quality will be lower than the demo book – an honest limit of a prototype.
- Generation runs on timers with streaming text, so it feels like a real model.

## 7. Out of scope (and why)

| Cut                                             | Why                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Accounts, sign-up                               | Not needed to prove the experience; removes friction. "My books" is stored locally |
| Stats, achievements, credits on the home screen | Vanity for a one-book user; the home screen should start the book                  |
| Real AI / backend                               | Allowed by the brief; time goes to UX and craft instead                            |
| Full text editor                                | The brief says it's not needed; intent-based adjustments fit non-writers better    |
| Images inside chapters                          | Nice to have; cover quality matters more                                           |
| EPUB                                            | The stakeholder confirmed PDF is enough                                            |
| Mobile layout                                   | The brief asks for a desktop web tool                                              |
| Multiple languages                              | Not in the brief                                                                   |

## 8. How I'd measure success (if this were live)

- **Time to first readable chapter** – the core promise.
- **Completion rate:** idea → downloaded or shared book.
- **Adjust vs restart:** share of users who fix the result instead of starting over.
- **Share rate** – a book worth sharing is the real quality signal.

## 9. Open questions

- [x] Primary user – lead-magnet creators (confirmed).
- [x] PDF only (confirmed).
- [x] Product name – **Primer** (working name): a primer is a short introductory book on a subject –
      exactly what a lead magnet is.
- [ ] Validate principles and the flow with 3–5 potential users before building the studio.
