@AGENTS.md

# eBook builder – home assignment prototype

A desktop web tool that takes a first-time user from a rough idea to a finished eBook with AI.
Prototype only: no backend, no real AI. Generation is simulated on the client.

## Stack (pinned – check docs for these exact versions)

- Next.js 16.4.6 (App Router, `src/` dir), React 19.3.0, TypeScript 5
- Tailwind CSS 4.3.3
- Before writing code against a library API, read the docs for the installed version
  (`node_modules/next/dist/docs/` for Next.js, Context7 for the rest). Do not write APIs from memory.

## Rules

- Design tokens live in one place (CSS variables) and every component uses them. No hard-coded colors or sizes.
- Every async step has loading, success, empty and error states.
- Log meaningful AI moments in `PROCESS.md`: what we asked, what worked, what was thrown away, where the model was wrong.
- This repository is shared with reviewers: no private notes, rates or personal data in it.
- Commit and push only when Ivan asks. Commits are authored by Ivan, with no AI attribution lines.
