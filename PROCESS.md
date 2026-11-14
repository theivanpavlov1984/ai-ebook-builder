# Process log

A running log of how this project was built and how AI was used along the way:
what I asked, what worked, what I threw away, and where my own judgment took over.

Main AI tool: Claude Code (planning, research support, building). Design: Figma.

---

## Day 1 – Thu, Nov 12: brief, plan, setup

**Brief → plan.** I used Claude to break the brief into a checklist of every requirement
and evaluation criterion, then into a 5-day plan: research → design system → build → test → video.
The checklist is what I'll verify against before submitting.

**Stakeholder questions.** Claude drafted three questions for the stakeholder. I cut one of them
(how sharing should work): it didn't change the product in a meaningful way, and it's a decision
I should make and justify myself. Sent two: who the primary user is, and whether PDF is enough.

**Setup.** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. No backend: AI generation
is simulated on the client, which the brief allows. Deployed to Vercel from day one
(https://ai-ebook-builder-mu.vercel.app), so every push to `main` is live.

**Desk research, round 1.** Claude searched the web and read competitor sites and reviews;
I asked it to separate vendor claims from independent evidence, because marketing pages
say "best" and "10 minutes" about everything. Output: `RESEARCH.md` – two families of tools,
the common flow, pain points, design hypotheses. What AI can't do here: actually use the tools
and talk to people – that's round 2, done by me.

**Hands-on with a competitor.** I made a real book in getebook.ai with the same topic I'll use
in the demo. This part AI couldn't do for me: Claude read my screenshots and helped structure the notes,
but the judgment on content quality (the outline was too technical for the audience) is mine.

**Flow, draft v1.** Claude drafted `FLOW.md` from the research: principles, screens, failure states,
cover system, cuts. Each principle is tied to a research finding, so decisions aren't based on taste alone.
To review tomorrow with fresh eyes before any design work.

---

## Day 2 – Fri, Nov 13: stakeholder answers, second opinion

**Stakeholder answers.** Primary user: people creating a lead magnet. PDF is enough.
This changed the flow: shorter practical books, a call-to-action page at the end,
covers that must read as thumbnails, and EPUB moved out of scope.

**Second opinion from another model.** I asked ChatGPT for references and compared its list
with my research. Kept two ideas: a browsable gallery of real example books on the landing page
(supports a decision I'd already made), and Reedsy as a reference for interior book typography.
Threw away the rest: two tools are built around "I already have content", which is not our scenario –
the brief starts from a rough idea. And a template catalog (Gamma) is the opposite of what the brief asks:
choosing a template before content is exactly "a template with text swapped in".
I also didn't copy its claims into research unverified – only what I opened and saw myself.

**Visual direction.** Claude built three directions of the same screen as live HTML mockups
(warm editorial / quiet studio / bold publisher). I picked warm editorial and took the wordmark from
the bold one. Seeing them side by side settled in minutes what would have been a long discussion in words.

**Design system.** Written as a spec first (`docs/design-system.md`), then a step-by-step build plan,
then built test-first: 3-tier tokens in CSS variables (the same architecture I use in production),
Tailwind mapped to the semantic tier, ~10 components, and a `/system` page.
Where the AI's plan was wrong, I kept a record of the decision:

- Tailwind's `--color-*` namespace would have collided with my semantic token names – renamed to `--primer-*`.
- One planned cover palette failed contrast – a test caught it, the color was darkened.
- A test guards against raw colors in components, so the system can't quietly drift.

---

## Day 3 – Sat, Nov 14: building the flow

**Build decisions first, then a plan.** Before code, I wrote down the few build choices a reviewer would
notice (`docs/product-build.md`). The one real trade-off – a real PDF file vs the browser's print dialog –
was my call: a real file, because the brief says "download" and a print dialog reads as a workaround.

**Test-first, with AI writing most of the code.** Each step of the flow was built against tests written
before the code – including the cases most likely to break in a review: refreshing mid-generation,
a reviewer's own topic, a cut share link, changing the topic after the outline exists, undoing rewrites.

**Where AI was wrong, and how we caught it:**

- The first demo chapter came out ~600 words against a 700–900 target; the content test failed and it was expanded.
- A test for the cover fallback was set up with the wrong starting style – the test was wrong, not the code.
- Next.js 16's prerendering rejected reading the book id outside a Suspense boundary – fixed with a route layout.
- Rasterizing the generated PDF showed chapter titles overlapping their summaries in the contents –
  invisible in unit tests, fixed after looking at the actual pages.
- A cover thumbnail rendered 3× too large because two width classes fought each other – spotted in the browser.

**Comparing with Contrast's own work.** Looking at the Designrr redesign screens, two things stood out:
the single big prompt on the start screen (we'd made the same call) and a book landing page with an email form.
Our share page was only a reader, so I turned it into a lead-magnet landing page – it's what the user
actually needs the book for.

**Code quality pass.** To make the code easy to review, I added Prettier (with Tailwind class sorting)
and restructured `src/` into Feature-Sliced Design layers, with ESLint rules that fail the build when a layer
imports from above or a slice is reached by a deep path. AI proposed the layer for each file and did the moving.
The first run of AI's import-merging script used stale text offsets and corrupted twelve files – Prettier
refused to parse them, we reset to the last commit and reran the fixed script. Same tests before and after (148).

**Self-review against the brief.** Running the generator on a reviewer-style topic ("Brewing great coffee at home")
showed the weak spot: the whole topic was pasted into every template ("Stop Overthinking Brewing Great Coffee at Home"),
and chapters were ~110 words. Templates now split the topic into a subject and an audience, use the subject only where
both a noun and a verb phrase read correctly, and chapters are about twice as long. The Build step says plainly that the
AI is simulated and points to the hand-written demo topic. The mood field is now labelled "Theme & tone" to match the brief.

**Flow references.** I asked AI to check the five key moments of the live prototype against AI creation tools
(Gamma, Notion AI, Canva, Beautiful.ai, plus my getebook.ai test) and put each Primer screen next to them on a board.
Mobbin needed a paid plan, so the sources are the products' help centers – the summary is in `RESEARCH.md` §8.
The verdict: outline and sharing hold up, but a rewrite silently replaced the chapter, while Gamma and Notion
treat it as a suggestion you accept or discard. `FLOW.md` had promised "compare with the previous one" and we hadn't built it.

**Rewrite as a suggestion.** Now the chapter dims with "Rewriting this chapter…" while it works, then the result
arrives as a suggestion: changed paragraphs are highlighted, an Original / Suggestion toggle compares them, and
Keep or Discard decides. The text only changes on Keep, so Undo and versions work as before.
AI proposed a "Try again" button too; I dropped it – the simulated rewrite is deterministic, so it would return the same
text and look broken. "Rewrite again" with another direction does the honest version of it.

**Fast path and tab progress.** The other two changes from the references. "Write it now" on the Describe step skips
Title and Outline with the defaults they would suggest – Gamma's "Express" idea. I didn't add a separate
"Decide for me" button: the audience chips already are one-click decisions, tone has a default, and "Write it now"
fills an empty audience itself – a third button would only repeat them. During Build the tab title counts
"Writing 3 of 6" and ends with "✓ Your book is ready". AI's first version set `document.title` directly; in the
browser that fought with the `<title>` Next.js renders from metadata and left the next page with an empty title.
Rendering React's `<title>` didn't help either – Next's element comes first in `<head>`, so the browser ignored ours.
The fix: put our own `<title>` element before Next's for the time of the Build step and remove it on leaving.
It still failed on Vercel: in a production build React moves the metadata `<title>` back to the top after navigation.
Our element now stays first by watching `<head>` and moving only itself.

**Landing hero, from a moodboard.** The old hero read as a generic AI template, so I collected five landing pages
in Doop (getebook.ai, Inkfluence, Squibler, Jet Admin, Lovable) next to ours and commented on what to take.
Jet Admin's centered prompt card won – Primer is "one field" at heart. AI drew two variants in Doop with that
layout: our warm palette and Jet's blue-lavender one. I picked warm: the cool one looks like every other AI tool
and fights the book covers. Headings moved to Bricolage Grotesque – the wordmark's face – at 700, not 800, because
Inkfluence, a direct competitor, uses exactly Bricolage 800. The tone switch above the field is real: it restyles
the visitor's cover live and is saved on the new book. AI's first build broke silently: `weight: "700 800"` is not
valid for this font in `next/font`, the dev server kept serving stale CSS, and the headline rendered at 14 px;
a production build showed the classes were fine and a dev-server restart fixed it.
Then the same headings across the app: screen, dialog and empty-state titles moved to Bricolage, while everything the book's reader sees – book and chapter titles, chapter text, the shared page – stays in the Newsreader serif.

**The rest of the landing.** Designed in Doop first as one long page, commented by me, then built. Every section shows
the real product: Build in a browser frame, crops of real screens in "How it works" and the bento. I generated
30 book covers with ChatGPT; 14 that read like practical guides now drift in two rows under "What will yours be about?"
– as range, not as output, because Primer draws its own vector covers. Social proof was the hard part. I wanted logos
and reviews; AI pushed back on real company logos and "As seen in WIRED", since on a public page that is a false claim
about real brands. We settled on: fictional brands drawn as type for "Used by…", real logos only where the claim is
true ("Works wherever a PDF and a link do": Gumroad, Mailchimp, Substack, LinkedIn, Notion), and six generated reviews
with stock portraits (Pexels), labelled "Sample reviews – Primer is a prototype". The "2,000+ experts" line is
placeholder copy. A "Kit" icon was dropped: the library's mark didn't clearly match the brand.

---

## Template for the next entries

**What I asked AI** –
**What worked** –
**What I threw away / where it was wrong** –
**My decision and why** –
