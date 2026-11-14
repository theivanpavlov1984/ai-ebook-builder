# Research

Status: **round 1 – desk research** (Nov 12). Next rounds: hands-on testing of competitors,
short conversations with potential users, UI pattern review.

Claims from vendor websites are marked _(vendor claim)_ – they describe positioning, not verified facts.

---

## 1. Landscape: two families of tools

**A. Repurpose-and-design tools** – you bring content, they make it look like a book.

| Tool                  | How it works                                                                                                                                                                   | Who it's for                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Designrr**          | Import a blog post, Doc, PDF, video or podcast (or write with its AI, Wordgenie, added in 2023) → edit draft → pick a template → tweak → export PDF / EPUB / Kindle / flipbook | Content marketers, coaches, podcasters, course creators – mostly for **lead magnets** |
| **Canva, Piktochart** | Design-first: template + AI draft, then manual layout and styling                                                                                                              | Marketers who already know design tools                                               |
| **FlipHTML5**         | Topic or file → outline → AI-designed pages → interactive flipbook                                                                                                             | Marketers who want an online, trackable book                                          |

**B. One-prompt generators** – you bring an idea, they write the whole book.

| Tool              | How it works                                                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **getebook.ai**   | One sentence → title suggestions → editable outline → chapters written one by one → cover from theme → PDF / EPUB / DOCX. "Complete eBook in 10 minutes", 8–18K words _(vendor claim)_ |
| **Inkfluence AI** | Prompt → outline → chapters → cover → PDF (EPUB / DOCX on paid plan)                                                                                                                   |

## 2. The common flow

Almost every generator converges on the same skeleton:

**idea → title → outline → chapters → cover → export**

Two details stand out:

- **The outline is the main control point.** getebook.ai and FlipHTML5 let you edit the outline
  _before_ chapters are written. It's the cheapest moment to steer the AI.
- **Cover is generated separately from the text**, often as the last step.

## 3. Pain points

| Pain                                                 | Evidence                                                                                                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Steep learning curve in editors**                  | Designrr's own comparison page admits the learning curve is real and that its help center has 65+ tutorials because of it. Software Advice and Trustpilot reviewers say the same; one review calls the editor "functional, not elegant". |
| **Expectation gap: "generator" that doesn't finish** | A Google Play review of an AI ebook app: it produced a chapter list, wrote "end of Ebook" and stopped. Same reviewer: no pictures, no covers.                                                                                            |
| **Generic output that still needs editing**          | Independent reviews stress that AI books still need proofreading, fact-checking and quality control before they're ready for readers.                                                                                                    |
| **Cover is the weak spot**                           | getebook.ai positions its cover as the step "most AI writing tools leave you to solve alone" _(vendor claim, but telling that it's their main selling point)_.                                                                           |

## 4. What this means for our design (hypotheses to validate)

1. **Primary user (pending stakeholder answer):** an expert, coach or marketer making a short
   non-fiction eBook as a lead magnet – the audience Designrr already serves.
2. **Simplicity beats editor power.** The incumbent's weakness is complexity. A first-timer should
   never see a layout editor; adjustments are made through intent ("simpler", "shorter", "warmer cover").
3. **Make the outline a visible checkpoint**, not a hidden step: cheap control before the long generation,
   and the main answer to "control without starting over".
4. **Generation should feel like watching the book being built**, readable as it appears,
   so waiting time becomes reviewing time.
5. **Finish the job.** Cover, structure, content and export in one flow – the expectation gap
   ("it stopped at the outline") is the fastest way to lose trust.
6. **Cover as a design system, not a template:** art direction, palette and type chosen from the
   book's theme and mood.
7. **Be honest about AI output:** nudge the user to review facts before publishing.

## 5. Designrr: what the problem was (Contrast case study, 2023)

Contrast redesigned Designrr's onboarding and core editor (contrastux.com/work/designrr).
The stated problem: despite powerful features, **users weren't reaching the "aha moment" fast enough,
and many churned before completing their first project**. Result reported: +97% engagement.

I couldn't get into Designrr to test it hands-on (its site leads to paid plans, and I couldn't sign in),
so this case study and public reviews are my main sources on it.

**What this means for us:** the riskiest part of an eBook tool isn't generation quality –
it's the first minutes. Success = the user reaches a book they like before they lose patience.
That's why the flow aims for a readable chapter in under a minute and keeps every early step optional.

## 6. Hands-on: getebook.ai (Nov 12)

Same input I'll use in our prototype: **"Design Systems for Small Teams"** – a topic I know well,
so I can judge the content, not just the UI.

**Flow:** one text field → AI guesses the format ("How-To Guide", change if wrong) → sign-in →
title picked automatically → outline of 10 chapters → build (checklist of steps) → pick a cover from 2 →
preview → paywall to download. About 8 minutes from outline to finished book.

**Worth keeping**

- A single, friendly starting field with "See examples" and "Help me pick" – zero blank-page anxiety.
- Smart default + easy override: "We think this is a How-To Guide – Not this? Change it".
- Generation shown as a named checklist (idea → angle → outline → each chapter → layout → cover → build).
- Outline is shown before the long build, as a checkpoint.

**Where it falls short**

| Issue                                                                                                                              | Why it matters                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Never asks who the book is for.**                                                                                                | The outline went deep into "three-tier semantic tokens from JSON to CSS" and "fluid typography scales". As a design-system practitioner I'd say that's too technical for founders and small teams – the audience was guessed, not asked. |
| **Title is chosen for you** ("Design Systems for _Small Product_ Teams"), only a "Change" link.                                    | The user's own idea gets silently rewritten.                                                                                                                                                                                             |
| **Outline control is all-or-nothing:** "Regenerate" the whole outline for 3 credits; no editing a single chapter.                  | Control means starting over.                                                                                                                                                                                                             |
| **8 minutes of ticking checkboxes.** Chapter text isn't readable until the end.                                                    | Waiting time could be reviewing time.                                                                                                                                                                                                    |
| **Both covers share one look** (dark navy, "tech" 3D or heavy type), one has the title cropped at the top, tiny unreadable labels. | Looks generated, not designed; low variety between options.                                                                                                                                                                              |
| **No adjustment step after generation** in the flow – editing lives in a separate "Editor" section.                                | No way to say "make chapter 2 simpler" in context.                                                                                                                                                                                       |
| **Cost estimate was off:** "about 35 credits", actually spent 42 (50 → 8).                                                         | Small, but it erodes trust right before the paywall.                                                                                                                                                                                     |
| **No share option**, download only after paying.                                                                                   | (The paywall is their business model; not relevant for us, but sharing is in our brief.)                                                                                                                                                 |

**What this changes for us**

1. Ask for the audience explicitly (the brief requires it anyway) and use it visibly in the outline.
2. Offer several titles, keep the user's own wording as one of them.
3. Let people edit the outline per chapter (rename, remove, reorder) before writing.
4. Make the wait readable: show chapters as they are written.
5. Covers: different art directions per option, never crop the title, no fake micro-text.
6. Adjust in context after generation: per-chapter regenerate with a direction.

> Note: screenshots for the deliverable must be cropped – the originals show my account details.

## 7. Voice of users: review and forum mining (Nov 13)

Instead of interviews (no time to recruit within the deadline), I read what real users write:
Designrr reviews on Trustpilot (positive and 1–3 star) and Reddit threads from people making
lead-magnet eBooks (r/DigitalMarketing, r/Emailmarketing, r/GrowthHacking).

_Limitation:_ this is secondary research – self-selected reviewers, small forum sample, no follow-up questions.
It shows motivations and pains, not how people would behave in our product.

### Why they make a lead-magnet eBook

- **To get emails and clients.** A life coach turning her 50+ blog posts into a free PDF "in exchange for emails";
  a new agency writing a guide with a call-to-action to a paid audit; a sales team sharing a PDF on LinkedIn.
- **They already have the knowledge – writing is the bottleneck.** A Designrr reviewer had wanted to write for years
  but found the "extra fill-in words" too laborious; AI writing the connective text is what unblocked them.
- **They want it to sound like them.** Positive reviews praise output that "sounds exactly like me";
  the harshest one says no real author wants generated content.

### What goes wrong

- **Scope creep.** An agency founder: a planned 7–15 page guide "keeps getting longer" and they worry it hurts conversion.
  Replies: keep it under ~20 pages, "no one is going to sit and read 15 pages usually".
- **Fighting the editor.** "Feels like Word and isn't intuitive"; page numbers redone 10+ times;
  images can't be placed as intended; formatting lost on import. One reviewer was still working
  on a "2-minute" book after 4 weeks.
- **Overpromising and upsells erode trust:** fake countdown timers, features locked behind upgrades,
  surprise renewals. (Business-model issues, but they show how fragile trust is in this category.)
- **Export doesn't work** where they need it (file "unsupported").

### What they expect

- **PDF is the lead-magnet format;** EPUB is for selling on Kindle (a Reddit reply makes exactly this split –
  consistent with the stakeholder's answer).
- **Actionable over comprehensive:** "solve an acute problem" – the format is just the vehicle.
- **A next step inside the book:** a call-to-action to the author's paid offer.

### What this changes for us

1. **Short by default:** target 10–20 pages, show page count and reading time, and nudge when the outline grows.
2. **Ask "what should readers do next?"** and turn the answer into the closing call-to-action page.
3. **Keep the user's voice:** tone choice now; optionally "paste a paragraph you wrote" to match the voice (bonus idea).
4. **No layout editing at all** – formatting is automatic, adjustments are made by intent.
5. **Honest promises:** real time estimates, no fake urgency, the download just works.
6. **One problem, one audience:** the Describe step pushes toward a specific, actionable topic.

## 8. Next steps

- [x] Hands-on: getebook.ai (above)
- [ ] Hands-on: one more tool (e.g. Inkfluence AI) – optional if time is short.
- [x] Voice of users from reviews and forums (above) – instead of interviews, given the deadline.
- [ ] UI patterns: onboarding, multi-step creation, long-running progress, AI regeneration controls.

## Sources

- Contrast UX, Designrr case study – contrastux.com/work/designrr
- Designrr homepage – designrr.io
- Designrr vs Canva – designrr.io/designrr-vs-canva
- Software Advice, Designrr reviews – softwareadvice.com
- Trustpilot, designrr.io reviews – trustpilot.com/review/designrr.io
- Metablogue, Designrr review – metablogue.com/designrr-ebook-creator-review
- getebook.ai – getebook.ai/ai-ebook-generator
- Inkfluence AI – inkfluenceai.com/ai-ebook-generator
- Piktochart AI ebook generator – piktochart.com/ai-ebook-generator
- FlipHTML5 AI ebook generator – fliphtml5.com/ai/ai-ebook-generator
- Google Play, "AI Ebook Generator – Create Book" reviews – play.google.com
- Trustpilot, Designrr reviews incl. 1–3 star – trustpilot.com/review/designrr.io
- Reddit: "Long or short PDFs as lead magnets" (r/DigitalMarketing), "Client wants an ebook"
  (r/Emailmarketing), "Are eBooks and checklists still effective as lead magnets?" (r/GrowthHacking)
- Designrr blog, "How long should your lead magnet ebook be" – designrr.io _(vendor content)_
