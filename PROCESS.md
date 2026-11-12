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

---

## Template for the next entries

**What I asked AI** –
**What worked** –
**What I threw away / where it was wrong** –
**My decision and why** –
