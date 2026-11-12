# Research

Status: **round 1 – desk research** (Nov 12). Next rounds: hands-on testing of competitors,
short conversations with potential users, UI pattern review.

Claims from vendor websites are marked *(vendor claim)* – they describe positioning, not verified facts.

---

## 1. Landscape: two families of tools

**A. Repurpose-and-design tools** – you bring content, they make it look like a book.

| Tool | How it works | Who it's for |
|---|---|---|
| **Designrr** | Import a blog post, Doc, PDF, video or podcast (or write with its AI, Wordgenie, added in 2023) → edit draft → pick a template → tweak → export PDF / EPUB / Kindle / flipbook | Content marketers, coaches, podcasters, course creators – mostly for **lead magnets** |
| **Canva, Piktochart** | Design-first: template + AI draft, then manual layout and styling | Marketers who already know design tools |
| **FlipHTML5** | Topic or file → outline → AI-designed pages → interactive flipbook | Marketers who want an online, trackable book |

**B. One-prompt generators** – you bring an idea, they write the whole book.

| Tool | How it works |
|---|---|
| **getebook.ai** | One sentence → title suggestions → editable outline → chapters written one by one → cover from theme → PDF / EPUB / DOCX. "Complete eBook in 10 minutes", 8–18K words *(vendor claim)* |
| **Inkfluence AI** | Prompt → outline → chapters → cover → PDF (EPUB / DOCX on paid plan) |

## 2. The common flow

Almost every generator converges on the same skeleton:

**idea → title → outline → chapters → cover → export**

Two details stand out:
- **The outline is the main control point.** getebook.ai and FlipHTML5 let you edit the outline
  *before* chapters are written. It's the cheapest moment to steer the AI.
- **Cover is generated separately from the text**, often as the last step.

## 3. Pain points

| Pain | Evidence |
|---|---|
| **Steep learning curve in editors** | Designrr's own comparison page admits the learning curve is real and that its help center has 65+ tutorials because of it. Software Advice and Trustpilot reviewers say the same; one review calls the editor "functional, not elegant". |
| **Expectation gap: "generator" that doesn't finish** | A Google Play review of an AI ebook app: it produced a chapter list, wrote "end of Ebook" and stopped. Same reviewer: no pictures, no covers. |
| **Generic output that still needs editing** | Independent reviews stress that AI books still need proofreading, fact-checking and quality control before they're ready for readers. |
| **Cover is the weak spot** | getebook.ai positions its cover as the step "most AI writing tools leave you to solve alone" *(vendor claim, but telling that it's their main selling point)*. |

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

## 5. Next steps

- [ ] Hands-on: create one book in 2 tools (e.g. getebook.ai and Inkfluence AI) – screenshots of each step,
      time to first value, where it confused me.
- [ ] 3–5 short conversations with people who could use this (coaches, experts, marketers).
- [ ] UI patterns: onboarding, multi-step creation, long-running progress, AI regeneration controls.

## Sources

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
