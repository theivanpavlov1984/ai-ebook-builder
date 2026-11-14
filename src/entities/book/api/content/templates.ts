/**
 * Topic-agnostic templates for any book that isn't the demo.
 * Placeholders: {topic} (as typed, lower-cased start), {audience} (lower-cased start).
 * Keep these free of demo vocabulary – a test guards against leaks.
 */
import type { Mood } from "../../model/cover-design";

export type Slot = { titles: string[]; summary: string; body: string[]; steps: string[]; deeper: string[] };

export const slots: Slot[] = [
  {
    titles: ["Why {topic} is worth your time", "Where to start with {topic}", "The case for {topic}"],
    summary: "What {audience} gain from {topic}, and what usually stands in the way.",
    body: [
      "Most people put off {topic} not because it's hard, but because it's unclear where to begin. This chapter fixes that by showing what changes once you start, and why the first small step matters more than the perfect plan.",
      "For {audience}, the payoff is practical: less guesswork, fewer repeated mistakes, and a result you can point to. You don't need special talent or a free month – you need a clear path and a little consistency.",
      "Think of the last time something felt harder than it should. Often the problem wasn't effort, it was the lack of a simple method. That's exactly what the next chapters give you.",
      "By the end of this book you'll have a plan you can start this week, and a way to keep going when motivation dips.",
    ],
    steps: [
      "Write down why {topic} matters to you right now.",
      "Pick one result you'd like to see in 30 days.",
      "Block 20 minutes this week to start.",
    ],
    deeper: [
      "It helps to name what's at stake. When {audience} skip this step, they tend to start strong and drift within two weeks. A single sentence about why you care is enough to pull you back on track.",
      "There's also a cost to waiting. Every month without a method is a month of small, invisible losses – time, energy, confidence. Starting imperfectly beats waiting for the right moment.",
    ],
  },
  {
    titles: ["Take stock of where you are", "Start with what you already have", "A quick, honest check-up"],
    summary: "A short self-check so you know your starting point before changing anything.",
    body: [
      "Before you change anything, look at what's already there. With {topic}, most of us have more to work with than we think – habits, tools and experience we simply haven't organised.",
      "Spend fifteen minutes listing what you do today, what works and what feels like friction. Don't judge it yet. The goal is a clear picture, not a verdict.",
      "{audience} often discover that two or three small things cause most of the trouble. Fixing those first gives you quick wins and the energy to keep going.",
      "Keep your list – you'll come back to it in the next chapter, where it becomes the starting point of your plan.",
    ],
    steps: [
      "List what you already do for {topic}.",
      "Mark what works with a tick and what hurts with a cross.",
      "Circle the two crosses that cost you the most.",
    ],
    deeper: [
      "A useful trick is to ask someone else to look at your list. An outside view spots patterns you've stopped noticing because you live with them every day.",
      "If you track anything at all – time, money, results – bring those numbers in. Even rough numbers turn vague feelings into decisions you can make.",
    ],
  },
  {
    titles: ["The method, step by step", "A simple routine that works", "The few things that matter most"],
    summary: "The core approach to {topic}, broken into steps you can follow this week.",
    body: [
      "Here is the heart of the book: a simple method for {topic} that fits into a normal week. It has three parts – prepare, do, review – and each one takes less time than you'd expect.",
      "Prepare by choosing one clear goal and removing one obstacle. Do the work in short, focused sessions rather than rare marathons. Review what happened so the next session is easier than the last.",
      "For {audience}, the biggest change is rhythm. A small amount, done regularly, beats a big effort done once. The method is designed so that missing a day doesn't break it.",
      "Try it for one week exactly as written. After that, adjust it to your life – but only after you've seen it work as intended.",
    ],
    steps: [
      "Choose one goal for this week.",
      "Schedule three 25-minute sessions.",
      "After each session, write one line: what worked, what didn't.",
      "On Sunday, adjust next week's plan.",
    ],
    deeper: [
      "Each part has a reason. Preparing removes decisions from the moment of doing, which is when willpower is lowest. Reviewing turns experience into improvement instead of repetition.",
      "If you only remember one thing, remember this: make the next step obvious. A plan you can start without thinking is a plan you'll actually follow.",
    ],
  },
  {
    titles: ["Common mistakes (and easy fixes)", "What to avoid in the first month", "Traps that slow everyone down"],
    summary: "The pitfalls {audience} hit most often, and how to step around them.",
    body: [
      "Everyone makes mistakes with {topic}. The good news is that they're predictable, which means you can avoid most of them before they cost you anything.",
      "The first is doing too much at once. Excitement makes us plan for our best week, not our average one. Plan for the average week and you'll finish what you start.",
      "The second is comparing yourself to people further ahead. Their results took years; yours are measured in weeks. Compare yourself to where you were a month ago instead.",
      "The third is skipping the review. Without it, the same problems repeat. Five minutes of looking back is the cheapest improvement you'll ever make.",
    ],
    steps: [
      "Cut your plan for next week in half.",
      "Unfollow one source that makes you feel behind.",
      "Put a 5-minute review in your calendar.",
    ],
    deeper: [
      "A fourth, quieter mistake is waiting to feel ready. With {topic}, readiness usually arrives after you start, not before. Treat the first attempts as practice that doesn't count.",
      "When a mistake does happen, name it and move on. A short note – what happened, what you'll try next – turns a bad day into useful information.",
    ],
  },
  {
    titles: ["Make it stick", "Turn it into a routine", "A 7-day plan to get going"],
    summary: "How to keep going once the first excitement fades.",
    body: [
      "Starting is exciting; continuing is where results come from. This chapter is about making {topic} part of your normal week, so it doesn't depend on motivation.",
      "Attach it to something you already do. After your morning coffee, before you close your laptop, on the way home – a fixed anchor makes the habit almost automatic.",
      "{audience} also benefit from a visible tracker. A simple tick on a calendar is enough. Seeing a streak makes you want to keep it, and seeing a gap tells you something needs adjusting.",
      "Expect a dip around week three. It's normal. Lower the bar for that week rather than stopping – a smaller habit kept is worth more than a perfect one dropped.",
    ],
    steps: [
      "Pick an anchor for your daily habit.",
      "Print or draw a 30-day tracker.",
      "Decide now what your 'minimum version' is for hard days.",
    ],
    deeper: [
      "Make it easy to start and slightly hard to skip. Prepare what you need the night before; tell one person what you're doing. Small frictions in the right places add up.",
      "Celebrate small wins on purpose. It sounds trivial, but noticing progress is what keeps a routine alive through the boring middle.",
    ],
  },
  {
    titles: ["Your next steps", "Where to go from here", "Keep the momentum"],
    summary: "A short checklist and what to do after you close this book.",
    body: [
      "You now have everything you need to make real progress with {topic}: a starting point, a method, a list of traps to avoid and a way to keep going.",
      "The next step is small on purpose. Choose one action from this book and do it in the next 24 hours. Momentum comes from doing, not from finishing the reading.",
      "As you go, keep your notes in one place. In a month you'll be surprised how far you've come – and you'll know exactly what to work on next.",
      "If you'd like help along the way, the last page tells you how to reach me.",
    ],
    steps: [
      "Pick one action from this book.",
      "Do it within 24 hours.",
      "Book a 15-minute check-in with yourself in two weeks.",
    ],
    deeper: [
      "When you're ready for more, go deeper on the one area that gave you the most trouble. Depth in one place beats a little of everything.",
      "And share what you learn. Explaining {topic} to someone else is one of the fastest ways to understand it yourself.",
    ],
  },
];

export const moodOpeners: Record<Mood, string> = {
  practical: "Let's keep this practical.",
  inspiring: "Every expert started exactly where you are now.",
  calm: "Take a breath – there's no rush here.",
  bold: "Here's the truth most guides won't tell you.",
  playful: "Good news: this part is more fun than it sounds.",
};

export const audiencePool = [
  "Busy professionals",
  "Complete beginners",
  "Small business owners",
  "Freelancers and solo founders",
  "Team leads",
  "Parents with full-time jobs",
  "Students and career changers",
];

export const titlePools = {
  clear: ["{T}: A Practical Guide", "The Practical Guide to {T}", "{T}, Step by Step"],
  benefit: ["{T}, Made Simple", "{T} Without the Overwhelm", "Get Started with {T} This Week"],
  bold: ["Stop Overthinking {T}", "{T}: No Fluff, Just What Works", "The Only {T} Guide You Need"],
  playful: ["{T}, Minus the Headaches", "{T} for the Rest of Us", "Yes, You Can Do {T}"],
};

export const exampleTopics = [
  "Morning routines for remote workers",
  "Pricing your freelance services",
  "Design systems for small teams",
];
