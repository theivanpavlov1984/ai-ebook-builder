# Process log

How Primer was built in four days, Friday to Monday, and how AI was used along the way: what I asked, what worked, what I threw
away, and where my own judgment took over. A short version first, then the day-by-day log.

## In short

**The method: AI makes, evidence decides, I judge.** The brief weighs design and building equally, and AI makes
both cheap – so the scarce part is judgment. I kept the decisions and made AI bring evidence instead of claims:
a failing test, a screenshot, a measurement.

1. **Think in writing first.** The brief became a checklist, then research (`RESEARCH.md`) and a flow (`FLOW.md`)
   where every design principle points to a finding. Stakeholder questions settled who it is for.
2. **Design before code, on a shared canvas.** Moodboards, the landing page, wireframes and the UI kit live in Doop,
   a canvas where AI draws and I comment; early directions were live HTML mockups side by side.
3. **Build test-first.** Tests for the cases a reviewer would try – a reload mid-generation, their own topic, a cut
   share link – then the code, mostly written by AI. ESLint enforces the architecture (Feature-Sliced Design).
4. **Check like a stranger would.** A real browser after every change, then a first-time walkthrough, a pass on
   phones, keyboard and contrast, and a Nielsen / NN/g audit of the live site.

**Where AI sped me up:** desk research and reading reviews; three visual directions in minutes; nearly all of the
code; walking the product as a newcomer and listing what breaks; measuring what I would have guessed – contrast
from the tokens, real PDF pages per chapter, the timing of a reference animation.

**Where it fell short:** it writes plausible code for the framework it remembers, not the one installed – Next.js 16
titles, react-pdf bookmarks. A script it wrote corrupted twelve files. Tests passed while the screen was broken – a
cover three times too big, overlapping PDF contents, a phone layout one word wide. Recreating a reference effect by eye, it
got the look and missed the mechanics. And neither of us questioned the strip of invented brand logos we had
settled on – the UX audit flagged it.

**Where my judgment took over:** who the product is for (a lead magnet, confirmed by the stakeholder) and what to cut
for that person – a pro editor, a dashboard, credits, pricing, EPUB (the brief: "Full editing capabilities are not
needed"); a warm palette over the default AI blue; a rewrite that arrives as a suggestion, never an overwrite; no
number on the page we can't back; dropping features that would look broken in a simulation.

**Tools.** Claude Code for research, design on the canvas, building and browser checks, with library docs pulled
for the installed versions; ChatGPT for a second opinion and the sample covers on the landing page; Doop for design;
Playwright for motion, phones and the PDF.

---

## Day 1 – Fri, Nov 13: brief, research, direction

**Brief → plan.** I used Claude to break the brief into a checklist of every requirement
and evaluation criterion, then into a 4-day plan: research → design system → build → test → video.
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
To review with fresh eyes before any design work.

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

## Day 2 – Sat, Nov 14: building the flow and the landing page

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
Title and Outline with the defaults they would suggest – the express path several creation tools offer. I didn't add a separate
"Decide for me" button: the audience chips already are one-click decisions, tone has a default, and "Write it now"
fills an empty audience itself – a third button would only repeat them. During Build the tab title counts
"Writing 3 of 6" and ends with "✓ Your book is ready". AI's first version set `document.title` directly; in the
browser that fought with the `<title>` Next.js renders from metadata and left the next page with an empty title.
Rendering React's `<title>` didn't help either – Next's element comes first in `<head>`, so the browser ignored ours.
The fix: put our own `<title>` element before Next's for the time of the Build step and remove it on leaving.
It still failed on Vercel: in a production build React moves the metadata `<title>` back to the top after navigation.
Our element now stays first by watching `<head>` and moving only itself.

**Landing hero, from a moodboard.** The old hero read as a generic AI template, so I collected landing pages of
competitors and AI products I rate in Doop, next to ours, and commented on what worked and why. One pattern fitted
Primer best: a centred prompt card as the whole first screen – Primer is "one field" at heart. AI drew two variants
of it in Doop: in our warm palette and in the cool blue-lavender common to AI tools. I picked warm: the cool one
looks like every other AI tool and fights the book covers. Headings moved to Bricolage Grotesque – the wordmark's
face – at 700, not 800, because a direct competitor uses exactly Bricolage 800. The tone switch above the field is real: it restyles
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
with stock portraits (Pexels), labelled "Sample reviews – Primer is a prototype". A "2,000+ experts" line under
the prompt was placeholder copy; before review it became "Built for experts with no time to write" – who the
product is for and their problem, with no number we can't back. A "Kit" icon was dropped: the library's mark didn't clearly match the brand.
Late in review I compared the page with a competitor's home and noted two blocks we lacked. We added a FAQ ("Before
you ask"): six questions answering the doubts from our research – will it sound like me, who owns it, why PDF, where it
is stored – each answer checked against what the prototype actually does. We skipped a pricing table: with no payments,
every price would be invented, so "How much does it cost?" is answered in the FAQ instead – free, it's a prototype.

**Photo covers.** Contrast's Designrr has a new lifetime-offer video; I asked AI to break it down frame by frame.
My assumption was that its images were AI-generated – the video shows an Unsplash/Pixabay search plus uploads, so
that was wrong. The idea I adapted: photos suggested for the topic, plus your own upload. What I left out: free
stock search and the layout editor – the complexity Primer avoids. AI drew the panel and its states in Doop,
I approved it as is. 33 Pexels photos ship with the app and are matched to the topic by keywords; three fixed
layouts keep the title readable. AI's first PDF cover had hard bands where the shading should fade: react-pdf
ignores gradient stop opacity. Thin strips with stepped opacity left visible lines where they overlapped; the fix
was nested strips whose opacities add up exactly, with a test for the math.

---

## Day 3 – Sun, Nov 15: walkthroughs, accessibility, a UX audit

**A first-time walkthrough before review.** I asked AI to go through Primer as a new user, from the landing page to
the reader's link, and list what a reviewer would notice. What it found and we fixed: every new book carried my name
as its author (on the cover, the last page and the share page) – now the field starts empty, the cover shows no
name until one is given, and the final checklist asks for it. The outline promised "~15 pages" and the finished
book said "~9": the estimate assumed 250 words a page, while the PDF fits about 150 under a chapter heading. We
measured real PDF pages per chapter and fitted the estimate to them, so the outline, the finished book and the
file agree. Each chapter now ends with "Try this today", as chapter 1 promises. Audience suggestions follow the
topic ("junior designers" for a salary-negotiation book, not "busy professionals"), the build screen stops saying
"start reading as soon as the first chapter appears" once the book is done, and the reader's tab shows the book's
title.

**Phones, then the topic parser.** The same walkthrough on a 375 px screen showed the reader's page – the one a
lead magnet's readers open from an email or a message, usually on a phone – cut off on the right, and the landing
page breaking apart. Both are now built phones-first: one column below 1024 px, the desktop design from there up
(unchanged at 1280), checked at 375, 768 and 1280 with no sideways scrolling. For now the creation flow stays a desktop tool,
as the brief says – the UX audit changed that later the same day. Last, topics like "Negotiating your first salary as a junior designer" put the whole sentence into
every title and chapter, so titles got cut off and the text read oddly. The parser now treats "as a …" like "for …":
the subject goes into the titles, "junior designers" becomes the audience.

**After a second look at the competition.** I ran a competitor's flow twice, pasted fifteen screenshots into Doop
and asked AI to put them in order and say where Primer fell short. Its ranked list: direct text editing, a clickable call to action,
set-off boxes inside the book, clickable contents, a summary of what the AI understood, a page-by-page PDF preview.
I took three for now. The last page gets a link and a brand, edited next to its preview; the link is clickable
in the PDF and on the shared page, and an address that isn't one gets a hint instead of a dead link. Each chapter's
"Try this today" list is set as a box, on screen and in the PDF, from one parser, so the two never disagree.
The PDF contents now link to their chapters, and every chapter is a bookmark. AI first put the bookmark on the
chapter heading, as the docs show; the installed react-pdf types only allow it on a page, so it moved there. We
checked the file itself with PDFKit: six contents links to the right pages, six bookmarks, one external link.

Then the other three. **Edit text**: the chapter's title and text as two fields, paragraphs split by an empty
line, saved as a version so the panel's undo – renamed "Undo last change" – works for hand edits too. **How
Primer planned your book** on the final step: audience, voice, shape and ending, each from what the author chose.
AI's first copy said what the voice does to the writing; in this prototype it sets each chapter's opening line and
the cover, so it now says exactly that. **Flip through the PDF** builds the same file as Download and shows it in
the browser's PDF viewer. It came up blank in the app's built-in browser pane, which has no PDF viewer for
frames; in real Chromium (checked with Playwright) it shows all 15 pages with thumbnails and the chapter
bookmarks. A new-tab link covers browsers without a viewer, and the frame opens at whole-page fit.

**A second pass: keyboard, failures, contrast.** Leaving a chapter with unsaved hand edits now asks first. Then
I asked AI to check accessibility properly. Its first idea – loading axe-core from a CDN into the page – was
blocked by the tool's safety rules, so it computed WCAG contrast from tokens.css instead and turned that into a
test. Three real failures: secondary text on the beige tints (4.2:1 and 3.7:1), field borders (1.3:1, under the
3:1 a form control needs) and the translucent focus ring (1.6:1). New shades fixed the first two. The focus ring
became a solid accent outline – and the browser check found the first try invisible: Tailwind's outline-hidden
sets the outline style to none and outline-2 inherits it, so focus-visible also needs outline-solid. Tabbing
through every screen found the rest: the outline lost focus when a chapter moved to the end or was removed, and
announced nothing; Review had two main landmarks and didn't mark the selected chapter; there was no skip link;
"Try again" had the same name for every failed part and dropped focus after a retry; Demo controls ignored
Escape; and a book waiting for a retry still said "Writing 6 of 6" in the tab. All fixed, each with a test.

**Bringing the landing page to life.** The page was nearly static, and its "Watch your book being written"
showed a still screenshot. I asked AI to go through competitors and top AI startups, list what moves on their
home pages and why it works. I took techniques, not looks, and bent each to the product: a prompt that plays
example requests – ours also switches the tone and redraws the cover, which only a book tool can show; live
mini-interfaces instead of videos; a layered hero light; a sticky scroll story for "How it works"; "new
subscriber" notifications, because sign-ups are the point of a lead magnet. What I left: floating books, pulsing
buttons, gradient text that stays on – the tells of AI slop. Checking it in a real browser found two
things the tests couldn't: the streaming chapter grew its card and pushed the page down (now it reserves its
height), and the sign-up times followed names instead of their place in the list. The app's built-in browser
pane renders no frames while hidden, so the motion was checked with Playwright, including reduced motion.

Reviewing it, I pushed back on three things. The hero cover flickered: its colours come from the title, so every
typed letter repainted it – it read as a bug, not as life. Now the demo colours the cover from the whole example
topic, and real typing repaints it only after a 600 ms pause. The "How it works" screens were cropped into
fragments; each step now shows the whole screen in a browser frame. And I did keep one gradient after all:
heading endings that light up as they scroll in. Ours runs once through our own ember gradient
(terracotta → ember → amber, one token) and settles back into the heading's colour, so it stays an accent on
arrival, not decoration that sits there.

**A UX audit of the live build.** Before submitting I asked AI to walk the production site as a first-time user
against Nielsen's heuristics, NN/g form and wizard guidance and WCAG, at 375, 768, 1024 and 1440 px, including
empty and invalid input, the browser's Back button mid-generation and broken share links. It found what tests
couldn't. The phone landing invited people to start a book, and then the creation flow broke: the 220 px sidebar
stayed and squeezed the form into a column one word wide. The Review studio, documented as working from 1024 px,
left the chapter about 110 px there. An empty start showed an error under a field still "typing" an example, so the
field looked filled while the error said it was empty. And I had kept a strip of invented brands under "Used by…" –
the reviews were labelled as samples, the logos were not, which is exactly the kind of claim a UX reviewer
distrusts. Fixed: the sidebar becomes a top bar below 1024 px and every step reflows to one column; Review keeps
three columns only from 1280 px; a failed start puts the cursor back in the field, which stops the demo; "Help me
shape this idea" on an empty field asks for a rough idea instead of repeating the examples; the brand strip is
gone.

**The rest of the audit list, the same day.** The checkbox "I've skimmed the chapters" gated nothing – Download and
Share worked either way – so it became what it really was: a note that AI makes mistakes, with a link to read the
chapters in Review. The stepper looked like navigation and wasn't; now every step the book has reached is a link, and
leaving Review through it passes the same "Discard your changes?" check as the chapter list. Going back raised the
real question – what does a change do to a book already written? So Describe and Outline say it: a new audience or tone
doesn't rewrite chapters, renamed or moved chapters keep their text, a swapped chapter is written again. Back during
generation now lands on an outline that says "2 of 6 chapters are done – writing pauses here", with Continue writing
instead of Write my book. Smaller ones: the cursor goes to the first field to fix on Describe; a disabled Rewrite says
what it's waiting for; My books shows where each book stands and can rename or delete (with Undo); a Primer 404 instead
of the framework's; the "AI is simulated" note shows on Title, where the template titles first appear, not only on
Build; the Final screen says why the share link is so long. Walking the fixes in the browser turned up one more, which
the audit had missed: Back from Build to Describe showed the form still busy from "Write it now" – Next keeps the left
page mounted, state and all – so the page now clears what belonged to the last visit when it is left.

---

## Day 4 – Mon, Nov 16: checking against the brief

**Why there is no pro editor.** Next to getebook.ai, Gamma and Inkfluence – dashboards with credits and profiles,
editors close to Word – Primer looked plain to me, and I asked whether we had cut too much. We re-read the brief
together: a "desktop web tool" for "first time users with no writing or design background", where "full editing
capabilities are not needed". Those products serve people who make books again and again, and their sidebars
mostly serve the business – credits, upgrades, word counts that read zero on day one. For someone making one lead
magnet that is noise, and Contrast's own Designrr work started from exactly that pain. The cut stays, now quoted
from the brief in `FLOW.md`. The comparison did surface one real gap: I couldn't find the cover in Review myself –
it was one small row above the chapters. It is now a card with "Edit cover" leading the structure, and the cover
preview on Final links straight to it. Making that link open the cover every time took a second try: Next keeps a
page you leave mounted, so Review came back on the chapter last read; the request now lives in the store.

**The heading sweep, tuned by measurement.** Ours looked already played by the time I saw it, while in the
reference I had in mind the effect plays in front of you. Tuning by eye had missed why. Measuring it showed the
trigger was the same – half the line on screen, near the bottom edge. The difference was the motion: a 1.2 s wipe,
the words appearing behind a coloured band from an invisible start, against our 2.6 s fade of the whole phrase, most
of which happened before the eye arrived. Ours is now a wipe in our own ember colours, timed to be seen.

**Five comments on the landing page.** I reviewed a full-length screenshot of the landing page in Doop and left the
notes on the canvas; Claude read them from there. Three were quick: the prompt text went from 20 to 16 px in a
lighter grey, the size most tools in the category use; the shelf of covers ("What will yours be
about?") moved up to second place, before the writing demo; the closing headline now uses the hero's type. For the
reviews I asked for something less generic than a grid of six cards. We looked at how strong startup sites tell
customer stories and adapted one technique: one story at a time, with the ones beside it shrunk to a mark. In Primer
the mark is the reviewer's own book cover, so the section also shows what Primer makes, and three numbers sit
beside the quote. The numbers are as invented as the
reviews, and the section still says so.

**The wait before the outline.** I ran a presentation tool twice and dropped the screenshots into Doop; Claude put
them in order and listed what Primer could use. The useful part was the moment between asking and seeing a plan:
theirs fills it with the request echoed back and stages that tick off, then the plan arrives item by item; ours
showed six grey bars. Primer now does the same in its own terms – "You asked for" with the topic, three stages
("Choosing chapters for junior designers"), chapters arriving one at a time – and "Write my book" sits in a bar at
the bottom of the screen: at 1280 × 800 it used to start below the fold. Their auto-start timer and tips carousel
stayed out: one decides for the user, the other fills the wait with filler, while ours fills it with the book.

**The finish line, made ours.** Comparing finals, I asked whether Primer should page through the book in spreads, as
some tools do. We decided against it: Primer already shows the real PDF, and a spread viewer is a teaser for a
paywall we don't have. What none of the tools I tried show is the point of a lead magnet – the page a reader lands
on. Final now ends with that page in a browser frame: a sample reader types an email, gets the book, and a "New
subscriber" note pops up for the author. It is a loop over a pure time-to-frame function, like the landing demos,
labelled as an example, and it stays still with reduced motion.

**After a design review: checked on a laptop.** A review of the app on a 16-inch laptop found what I had missed
designing on a large monitor. Final had nine actions of equal weight, with the reader page – the point of the book –
at the bottom; while editing a chapter, Save sat below the fold. The review was right that I should have seen it
myself, so the fixes were checked at 1728 × 980. Final now has one job, sharing: the reader page leads, Copy share
link is the only primary button, the PDF comes second, and Last page, the link details and the book plan are folded.
The editor's Save bar is pinned to the bottom; it only stuck once the reading column stopped being its own scroll
box, which Claude found by walking up the element tree instead of guessing. Two smaller bugs went with it. On
Describe the cover was seeded by the topic, so its shapes jumped on every keystroke; an untitled cover is now seeded
by the book's id. And "Start my book" sometimes left the browser on an empty /new after Back: it went through /new
and redirected from there. It now opens the blank book in one step, and /new stays only for direct visits.
