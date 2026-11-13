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

## Template for the next entries

**What I asked AI** –
**What worked** –
**What I threw away / where it was wrong** –
**My decision and why** –
