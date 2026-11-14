/**
 * Demo book: "Design Systems for Small Teams".
 * Draft – to be reviewed by Ivan (the subject-matter expert) before submission.
 */

export function isDemoTopic(topic: string): boolean {
  return /design[- ]?systems?/i.test(topic);
}

export const demoOutline: { title: string; summary: string }[] = [
  {
    title: "What a design system really is",
    summary: "Why a team of three needs one too – and why it's smaller than you think.",
  },
  {
    title: "Start with an audit, not a library",
    summary: "Collect what you already ship, find the duplicates and decide what to keep.",
  },
  {
    title: "One source of truth for color, type and spacing",
    summary: "Name your decisions once, so every screen and every developer uses the same ones.",
  },
  {
    title: "Your first five building blocks",
    summary: "The handful of UI pieces that cover most of your product, and how to build them well.",
  },
  {
    title: "Keeping design and code in sync",
    summary: "Simple habits that stop Figma and the codebase from drifting apart.",
  },
  {
    title: "Running it on two hours a week",
    summary: "Who owns what, how changes get in, and how to keep it alive without a dedicated team.",
  },
];

const chapters: string[][] = [
  [
    "If you work in a small product team, you've probably felt it. The same button exists in four slightly different blues. A new screen takes a week because someone has to decide, again, how much space goes between a title and a paragraph. A developer asks which grey is the 'right' grey, and nobody is sure.",
    "None of this is anyone's fault. It's what happens when a product grows faster than the decisions behind it. Every screen is designed on its own, every developer makes reasonable guesses, and after a year the product looks like it was made by several companies. That is exactly the problem a design system solves.",
    "So what is a design system? Strip away the conference talks and it's simple: a shared set of decisions about how your product looks and behaves, written down once and used everywhere. Colors, type, spacing, a few reusable pieces of interface, and a short guide on when to use what. That's it.",
    "Big companies have whole teams maintaining theirs, which is why many founders assume it's a luxury for later. It isn't. In fact, small teams benefit the most, because every hour spent re-deciding a detail is an hour not spent on the product. When there are only three of you, those hours are expensive.",
    "A design system for a small team is not a giant library. It's closer to a good kitchen: the knives are where you expect them, the ingredients are labelled, and anyone can cook without asking where things are. You don't need two hundred components. You need the twenty decisions you make every day to stop being decisions.",
    "The payoff shows up quickly. Designers stop redrawing the same parts and spend their time on real problems. Developers build screens faster because the pieces already exist and behave predictably. Reviews get shorter, because 'does this match?' has a clear answer. And the product starts to feel like one product, which users notice even if they can't name it.",
    "In my own work I've seen a modest system – a few dozen components on a clear set of rules – cut the number of design fixes requested after development by a quarter. Not because anyone worked harder, but because fewer things were left to interpretation.",
    "There's also a less obvious benefit: onboarding. When a new person joins, a design system is the fastest way to learn how the product is put together. Instead of reverse-engineering old screens, they read the rules and see the pieces. A good system is documentation that people actually use.",
    "It's worth being clear about what a design system is not. It isn't a style guide PDF that lives in a shared drive and slowly goes out of date. It isn't a pixel-perfect component library that took six months and covers cases you'll never meet. And it isn't a rulebook that stops designers from trying new ideas. A healthy system is a living agreement: it records what the team has already decided, so new decisions can focus on what's genuinely new.",
    "A useful test is to ask: if our best designer went on holiday for a month, would the product still look like itself? If the answer is 'probably not', the knowledge lives in someone's head instead of in a shared place. Moving it into a system is less about control and more about resilience – the product stops depending on any single person remembering the details.",
    "Does that mean you should stop everything and build one? No. The biggest mistake small teams make is treating a design system as a separate project, with its own roadmap and its own launch. That version rarely ships. The approach in this book is the opposite: build it from what you already have, a little at a time, while you keep shipping features.",
    "Over the next chapters we'll go step by step. First, an audit of what's already in your product, so you know where the mess is. Then a single source of truth for color, type and spacing. Then the first five building blocks that cover most screens. Then a few habits that keep design and code in sync. And finally, a way to run all of this on about two hours a week.",
    "You won't need special tools or a dedicated team. If you have a design file, a codebase and a bit of discipline, you have everything required. Let's start with what you already have.",
  ],
  [
    "Before you design anything new, look at what you already ship. An audit sounds formal, but for a small team it's an afternoon with screenshots and a big board.",
    "Open your product and capture every screen that matters: sign-up, the main dashboard, settings, the empty states, the error messages. Then cut them up and group similar things together – all the buttons in one place, all the text styles in another, all the form fields together.",
    "The result is usually humbling. You'll find seven button styles where you meant to have two, a dozen shades of grey, and headings that change size from page to page for no reason. Don't fix anything yet. Just count and label.",
    "Now make decisions. For each group, pick the version that works best and mark the rest as duplicates. If two variations exist for a real reason – a destructive button that must look different, for example – keep both and write down why. Everything else gets merged.",
    "Be pragmatic about scope. You're not aiming for perfection; you're aiming for a short, honest list: the colors we use, the text styles we use, the spacing we use, the components we use. That list is the first version of your design system.",
    "Share the board with your developers before moving on. They'll spot variations designers never see, like one-off styles hidden in the code. Agreeing on the list together is what makes the next steps stick.",
    "A quick way to prioritise is to look at frequency and pain. Something that appears on every screen and varies a lot – usually buttons, text styles and spacing – goes to the top. Something rare and harmless, like a slightly different tooltip on one settings page, can wait. You'll fix the expensive inconsistencies first and get visible results within days.",
    "Finally, keep the board. It becomes your 'before' picture. In a few months, when the product looks noticeably calmer and screens ship faster, you'll want to show the team – and maybe your investors – how far it has come.",
  ],
  [
    "Once you know what you use, give each decision a name and store it in one place. These named values – the color of a primary button, the size of a heading, the gap between sections – are what the industry calls design tokens. Think of them as a shared vocabulary.",
    "The trick that saves small teams the most time is naming decisions by their role, not their appearance. 'Background' and 'text-secondary' age well. 'Light-beige' and 'grey-500' don't, because the day you change the beige, the name starts lying.",
    "A simple structure works best. At the bottom, a short palette of raw values: your actual colors, sizes and spacing steps. On top of it, the role names that screens use: background, surface, primary text, accent, error. Components refer only to roles, never to raw values. Change a role once and every screen follows.",
    "Keep the scales short. Six or seven text sizes are plenty. A spacing scale based on multiples of four or eight covers almost everything. Two or three corner radiuses, two shadows. Fewer options mean faster decisions and fewer accidental variations.",
    "Then put the same names in both places: as styles or variables in your design file, and as variables in the code. When a designer says 'accent' and a developer writes 'accent', they mean exactly the same thing. That single shared word does more for consistency than any review meeting.",
    "This structure also makes bigger changes cheap. A rebrand, a dark theme or a second product for a different audience stops being a redesign and becomes an exercise in swapping values. The screens don't change; only the values behind the role names do. For a small team, that flexibility is worth far more than the hour it takes to set up.",
    "Start with color, type and spacing only. It's tempting to name everything – animation speeds, border widths, icon sizes – but each name is something to maintain. Add more once the basics are used everywhere and you feel a real need.",
  ],
  [
    "With the basics in place, build the pieces you use everywhere. In most products, five building blocks cover the majority of screens: buttons, form fields, a card or panel, a list item, and a dialog. Start there.",
    "Build each one properly rather than quickly. A button isn't one picture; it's a set of states: default, hover, focus, pressed, disabled and loading. Most inconsistency comes from states nobody designed, so design them all once and you'll never have to improvise them again.",
    "Make accessibility part of the definition, not a later fix. Visible focus for keyboard users, enough contrast, labels on every field, errors that use words and an icon rather than color alone. It costs little when the piece is born and a lot when it's retrofitted across fifty screens.",
    "Write a few lines of guidance next to each piece: when to use it, when not to, and one example. Three sentences are enough. The goal is that someone new can use the piece correctly without asking.",
    "Resist the urge to add more until these five are used everywhere. A small set used consistently beats a large set used occasionally. When a sixth piece is truly needed, it will be obvious – the same pattern will appear on three screens in a row.",
    "Build in the code, not only in the design file. A building block that exists only as a drawing still has to be interpreted by every developer, and that's where the variations creep back in. When the button exists once in the codebase, with its states and its rules, nobody can accidentally make a fifth version.",
    "And give each piece a home where people can see it working: the real thing, with real states, clickable. Seeing a loading button or an error message in place answers more questions than any specification.",
  ],
  [
    "The quiet killer of small-team design systems isn't bad design. It's drift: the design file says one thing, the code says another, and nobody notices until a customer does.",
    "The first habit is to treat names as the contract. If a value exists in the design file, it exists in the code under the same name, and vice versa. When something new is needed, it's added in both places in the same week.",
    "The second habit is to review real screens, not just mockups. Once a feature is built, the designer spends ten minutes in the product looking for anything that doesn't match. Small mismatches fixed early stay small. Doing it on a real device, with real data and long names, catches the problems a tidy mockup hides.",
    "The third habit is a single place to see everything. A simple page in your product that shows every color, text style and component in every state is worth more than a beautiful document nobody opens. Developers check it before building; designers check it before designing.",
    "Modern tools help. Plugins and AI assistants can read the values from your design file and use them when generating code, which removes a whole class of copying mistakes. But the tools only work if the names and the structure are clear. The discipline comes first; automation makes it cheaper.",
    "It also helps to agree on who changes what. A useful rule for small teams: designers propose, developers confirm, and nothing new is added to one side without the other. It sounds bureaucratic, but in practice it's a two-line message in your team chat – and it saves hours of detective work later.",
    "When drift does happen, treat it as information rather than a failure. Every mismatch points to a decision that wasn't clear enough. Fix the screen, then fix the rule, so the same mismatch can't appear again.",
  ],
  [
    "Most small teams can't give anyone a full-time design-system role, and they don't need to. What they need is a clear owner, a simple process and a fixed slot in the week.",
    "Name one owner – usually the designer closest to the product – with a developer as a partner. Ownership doesn't mean doing all the work; it means making the final call when there's a disagreement and keeping the list of decisions up to date.",
    "Agree on how changes get in. Anyone can propose one, with a screenshot and a sentence about why. The owner and the developer partner review proposals once a week. Most are quick yeses or nos; the rest become small tasks.",
    "Then protect two hours a week for that work – the same slot every week, in the calendar, so it doesn't get eaten by urgent features: reviewing proposals, fixing drift, improving one building block. Two hours sounds small, but over a quarter it adds up to a system that keeps pace with the product instead of falling behind it.",
    "Finally, measure something. Count how many design fixes come back after development, or how long a typical new screen takes. When those numbers improve, the system has earned its time – and you'll have the evidence to give it a little more.",
    "Expect the system to change as the product does. Some building blocks will be replaced, some rules will turn out to be wrong, and that's healthy. A design system that never changes is usually one nobody uses. The aim isn't a finished system; it's a reliable way of making and recording decisions.",
    "If you take one thing from this book, let it be this: start small, start from what you have, and protect a little time every week. That's how a team of three ends up with a product that feels like the work of a much bigger one.",
  ],
];

export function demoChapter(index: number): string[] {
  return chapters[index] ? [...chapters[index]] : [];
}

export const demoTitles = {
  clear: ["Design Systems for Small Teams: A Practical Guide"],
  benefit: ["Ship Consistent UI Without a Design-System Team"],
  bold: ["Stop Redrawing Buttons"],
  playful: ["One Button to Rule Them All"],
};

export const demoAudiences = [
  "Founders of early-stage startups",
  "Product teams of 3–10 people",
  "Freelance designers",
];
