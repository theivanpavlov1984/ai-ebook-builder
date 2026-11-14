/**
 * Topic-agnostic templates for any book that isn't the demo.
 * Placeholders: {subject} – the topic without its "for whom" part ("sourdough baking"), {audience} – lower-cased.
 * {S} / {T} – the subject / the whole topic in Title Case. Templates only use {subject} where both a noun
 * ("morning routines") and a verb phrase ("brewing coffee at home") read correctly, never as a sentence's subject.
 * Keep these free of demo vocabulary – a test guards against leaks.
 */
import type { Mood } from "../../model/cover-design";

export type Slot = { titles: string[]; summary: string; body: string[]; steps: string[]; deeper: string[] };

export const slots: Slot[] = [
  {
    titles: ["What {subject} can change for you", "The real case for {subject}", "Why now is a good time to start"],
    summary: "What you get from {subject}, and why the first step is smaller than it looks.",
    body: [
      "Most people put off {subject} not because it's hard, but because it's unclear where to begin. Advice is everywhere, and much of it contradicts itself. This chapter cuts through that and shows what actually changes once you start.",
      "For {audience}, the payoff is practical: less guesswork, fewer repeated mistakes and a result you can point to. You don't need special talent or a free month. You need a clear path and a little consistency.",
      "Think about the last time something felt harder than it should have. Usually the problem wasn't effort – it was the lack of a simple method. The same effort with a method behind it turns into progress instead of frustration.",
      "There's also a cost to waiting. Every month without a plan is a month of small, invisible losses – time, energy and confidence. Starting imperfectly beats waiting for the perfect moment, because the perfect moment rarely comes.",
      "This book is deliberately short. Each chapter ends with something you can do the same day, and none of it needs special tools or a big budget. Read it in one sitting, then come back to the chapter you need.",
      "By the last page you'll have a plan you can start this week, and a way to keep going when motivation dips. Let's begin with an honest look at where you are today.",
    ],
    steps: [
      "Write down why {subject} matters to you right now – one sentence is enough.",
      "Pick one result you'd like to see in 30 days.",
      "Block 20 minutes in your calendar this week to start.",
    ],
    deeper: [
      "It helps to name what's at stake. When {audience} skip this step, they tend to start strong and drift within two weeks. A single sentence about why you care is enough to pull you back on track.",
      "It also helps to picture the finish line. Imagine it's three months from now and things went well: what's different on an ordinary Tuesday? That picture is more motivating than any abstract goal.",
    ],
  },
  {
    titles: [
      "Where you are with {subject} today",
      "Start with what you already have",
      "A 15-minute check-up before you begin",
    ],
    summary: "A short, honest look at your starting point – so you fix what matters first.",
    body: [
      "Before you change anything, look at what's already there. When it comes to {subject}, most of us have more to work with than we think – habits, tools and experience we simply haven't organised yet.",
      "Spend fifteen minutes writing down what you do today: what works, what feels like friction and what you quietly avoid. Don't judge it yet. The goal is a clear picture, not a verdict.",
      "Then look for patterns. {audience} often discover that two or three small things cause most of the trouble – a missing step, an unclear goal, a time of day that never works. Fixing those first gives you quick wins and the energy to keep going.",
      "Be specific. 'I'm bad at this' is not something you can fix; 'I give up when the first attempt goes wrong' is. The more concrete your notes, the easier the next chapters become.",
      "If you track anything at all – time, money, results – bring those numbers in. Even rough numbers turn vague feelings into decisions you can actually make.",
      "Keep your list somewhere you'll see it. In the next chapter it becomes the starting point of your plan.",
    ],
    steps: [
      "List what you already do when it comes to {subject}.",
      "Mark what works with a tick and what hurts with a cross.",
      "Circle the two crosses that cost you the most.",
    ],
    deeper: [
      "A useful trick is to ask someone else to look at your list. An outside view spots patterns you've stopped noticing because you live with them every day.",
      "Look at your best recent day, too. What was different about it – the time, the place, the preparation? Your best days are the most useful data you have.",
    ],
  },
  {
    titles: ["The core method for {subject}", "A simple weekly plan for {subject}", "The few things that matter most"],
    summary: "The heart of the book: a three-part approach to {subject} that fits into a normal week.",
    body: [
      "Here is the heart of the book: a simple method for {subject} that fits into a normal week. It has three parts – prepare, do, review – and each one takes less time than you'd expect.",
      "Prepare by choosing one clear goal and removing one obstacle. A goal like 'get better' is too vague to act on; 'do it three times this week and note what happens' is not. Remove the obstacle that showed up most often in your notes from the last chapter.",
      "Do the work in short, focused sessions rather than rare marathons. Twenty-five minutes is enough. Put the sessions in your calendar like any other appointment, so the decision is already made when the time comes.",
      "Review each session in one line: what worked, what didn't, what to try next. It takes two minutes, and it's the part most people skip – which is exactly why their tenth attempt looks like their first.",
      "For {audience}, the biggest change is rhythm. A small amount done regularly beats a big effort done once, and the method is designed so that missing a day doesn't break it. Just pick it up at the next session.",
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
    titles: [
      "Common mistakes with {subject} – and easy fixes",
      "What to avoid in your first month",
      "The traps that slow {audience} down",
    ],
    summary: "The pitfalls {audience} hit most often, and how to step around them.",
    body: [
      "Everyone makes mistakes with {subject}. The good news is that they're predictable, which means you can avoid most of them before they cost you anything.",
      "The first is doing too much at once. Excitement makes us plan for our best week, not our average one. Plan for the average week and you'll finish what you start.",
      "The second is comparing yourself to people further ahead. Their results took years; yours are measured in weeks. Compare yourself to where you were a month ago instead.",
      "The third is copying someone else's routine wholesale. What works for an expert with different time, money and goals rarely fits {audience} as it is. Borrow ideas, not entire systems.",
      "The fourth is skipping the review. Without it, the same problems repeat, and it feels like nothing is improving even when it is. Five minutes of looking back is the cheapest improvement you'll ever make.",
      "When a mistake does happen, name it and move on. A short note – what happened, what you'll try next – turns a bad day into useful information.",
    ],
    steps: [
      "Cut your plan for next week in half.",
      "Unfollow one source that makes you feel behind.",
      "Put a 5-minute review in your calendar.",
    ],
    deeper: [
      "A quieter mistake is waiting to feel ready. With {subject}, readiness usually arrives after you start, not before. Treat the first attempts as practice that doesn't count.",
      "Another is changing everything when one thing goes wrong. Change one variable at a time, so you know what actually made the difference.",
    ],
  },
  {
    titles: [
      "Making {subject} part of your week",
      "A 30-day plan to make it stick",
      "Staying on track when motivation dips",
    ],
    summary: "How to keep going once the first excitement fades.",
    body: [
      "Starting is exciting; continuing is where results come from. This chapter is about making {subject} part of your normal week, so it doesn't depend on motivation.",
      "Attach it to something you already do. After breakfast, before you close your laptop, on the way home – a fixed anchor makes the habit almost automatic.",
      "Make it easy to start and slightly hard to skip. Prepare what you need the night before, and tell one person what you're doing. Small frictions in the right places add up.",
      "{audience} also benefit from a visible tracker. A simple tick on a calendar is enough. Seeing a streak makes you want to keep it, and seeing a gap tells you something needs adjusting.",
      "Expect a dip around week three. It's normal. Lower the bar for that week rather than stopping – a smaller habit kept is worth more than a perfect one dropped.",
      "Finally, notice your progress on purpose. Once a week, look back at the notes you made in the first chapters. It's the easiest way to see how far you've come.",
    ],
    steps: [
      "Pick an anchor for your daily habit.",
      "Print or draw a 30-day tracker.",
      "Decide now what your 'minimum version' is for hard days.",
    ],
    deeper: [
      "Plan for the days that go wrong. Decide in advance what you'll do when you're tired, travelling or ill – a two-minute version keeps the habit alive without any guilt.",
      "Celebrate small wins on purpose. It sounds trivial, but noticing progress is what keeps a routine going through the boring middle.",
    ],
  },
  {
    titles: ["Your next steps", "Where to go from here", "A one-page plan to start tomorrow"],
    summary: "A short checklist and the first thing to do after you close this book.",
    body: [
      "You now have everything you need to make real progress with {subject}: a starting point, a method, a list of traps to avoid and a way to keep going.",
      "The next step is small on purpose. Choose one action from this book and do it in the next 24 hours. Momentum comes from doing, not from finishing the reading.",
      "Here's a one-page summary worth keeping: your goal, your weekly sessions, your two biggest obstacles and your minimum version for hard days. If you keep only one page from this book, keep that one.",
      "As you go, keep your notes in one place. In a month you'll be surprised how far you've come – and you'll know exactly what to work on next.",
      "When you're ready for more, go deeper on the one area that gave you the most trouble. Depth in one place beats a little of everything. And share what you learn: explaining {subject} to someone else is one of the fastest ways to understand it yourself.",
      "If you'd like help along the way, the last page tells you how to reach me.",
    ],
    steps: [
      "Pick one action from this book.",
      "Do it within 24 hours.",
      "Book a 15-minute check-in with yourself in two weeks.",
    ],
    deeper: [
      "Choose one person to tell about your plan. A friend who asks 'how's it going?' once a week is worth more than any app.",
      "And revisit this book in a month. Chapters that felt obvious today will read differently once you've tried the method yourself.",
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
  clear: ["{T}: A Practical Guide", "The Practical Guide to {S}", "{S}, Step by Step"],
  benefit: ["{S}, Made Simple", "{S} Without the Overwhelm", "{S} in 30 Days: A Simple Plan"],
  bold: ["{S}: What Actually Works", "The No-Fluff Guide to {S}", "{S}, Without the Guesswork"],
  playful: ["{S}, Minus the Headaches", "{S} for the Rest of Us", "Wait, {S} Can Be This Easy?"],
};

export const exampleTopics = [
  "Morning routines for remote workers",
  "Pricing your freelance services",
  "Design systems for small teams",
];
