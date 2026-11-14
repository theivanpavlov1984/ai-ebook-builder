/**
 * Photo covers (FLOW.md §5). A curated set of Pexels photos ships with the app in /public/covers/photos.
 * Nothing is generated or downloaded at run time: photos are matched to the book's topic by keywords.
 */

export type PhotoLayout = "full" | "band" | "framed";
export const photoLayouts: PhotoLayout[] = ["full", "band", "framed"];

export type CoverPhoto = { id: string; alt: string; author: string; tags: readonly string[] };

/** What the user picked: a photo from the library, or their own upload (a JPEG data URL). */
export type PhotoChoice = { kind: "library"; id: string } | { kind: "upload"; src: string; name: string };

const design = ["design", "system", "brand", "color", "colour", "ui", "ux", "product", "creative", "style", "interior"];
const planning = [
  "planning",
  "plan",
  "team",
  "workshop",
  "strategy",
  "project",
  "agile",
  "meeting",
  "idea",
  "brainstorm",
];
const morning = ["morning", "routine", "remote", "work", "home", "office", "productivity", "productive", "habit"];
const money = ["money", "pricing", "price", "freelance", "freelancer", "finance", "budget", "invoice", "rate"];
const business = ["business", "income", "tax", "saving", "client", "consulting", "consultant", "sale"];
const calm = ["calm", "mindful", "mindfulness", "meditation", "wellbeing", "wellness", "stress", "sleep", "rest"];
const calmMore = ["balance", "burnout", "anxiety", "slow", "self-care", "busy", "founder", "focus"];
const food = ["baking", "bake", "bread", "sourdough", "cooking", "cook", "recipe", "kitchen", "food", "meal"];
const fitness = ["fitness", "running", "run", "runner", "marathon", "training", "workout", "exercise", "sport"];
const health = ["health", "healthy", "gym", "strength", "coach"];
const family = ["parenting", "parent", "kid", "children", "child", "family", "mom", "dad", "toddler", "school"];
const learning = ["reading", "teaching", "teacher", "learning", "education"];
const writing = ["writing", "write", "writer", "newsletter", "blog", "blogging", "content", "author", "copywriting"];
const story = ["email", "story", "storytelling", "journal", "journaling", "marketing", "audience", "creator"];

/** Shown first when nothing matches the topic: calm textures that suit any book. */
const general = ["general"];

export const coverPhotos: CoverPhoto[] = [
  { id: "pexels-10202724", alt: "Neutral colour swatches on brown paper", author: "cottonbro studio", tags: design },
  { id: "pexels-4968695", alt: "Fabric swatches on a marble table", author: "Kaboompics", tags: design },
  { id: "pexels-6065409", alt: "Paint swatches and scissors", author: "Eva Bronzini", tags: design },
  { id: "pexels-5292198", alt: "Hands choosing colour samples", author: "Antoni Shkraba", tags: design },
  { id: "pexels-7680057", alt: "Sticky notes on a white wall", author: "Kaboompics", tags: planning },
  { id: "pexels-6580011", alt: "Design tools on a white desk", author: "cottonbro studio", tags: design },
  { id: "pexels-4201957", alt: "Sunlit window and a coffee cup", author: "Inga Seliverstova", tags: morning },
  { id: "pexels-11669112", alt: "Laptop and tulips by a window", author: "Albina White", tags: morning },
  { id: "pexels-7583435", alt: "Laptop and coffee on a window sill", author: "Mikhail Nilov", tags: morning },
  { id: "pexels-4166995", alt: "Laptop by a window over the city", author: "Caio", tags: [...morning, ...business] },
  { id: "pexels-6927337", alt: "Calculator, coins and a notebook", author: "Polina Tankilevitch", tags: money },
  {
    id: "pexels-7654592",
    alt: "Charts, notes and banknotes on a desk",
    author: "Pavel Danilyuk",
    tags: [...money, ...business],
  },
  { id: "pexels-6962993", alt: "Budget notes, a calculator and a laptop", author: "Mikhail Nilov", tags: money },
  {
    id: "pexels-8892017",
    alt: "Pampas grass in a glass vase",
    author: "Leeloo The First",
    tags: [...calm, ...calmMore],
  },
  { id: "pexels-6805411", alt: "Candle and dried palm leaves", author: "Kaboompics", tags: calm },
  { id: "pexels-9130753", alt: "Succulents and soft linen", author: "Katrin Bolovtsova", tags: [...calm, ...calmMore] },
  { id: "pexels-12486412", alt: "A candle on a book beside dried flowers", author: "Shan Chick", tags: calm },
  { id: "pexels-39113887", alt: "Scored sourdough loaf on parchment", author: "Feyza Daştan", tags: food },
  { id: "pexels-30785699", alt: "Golden loaf on a floured table", author: "Beyza Yalçın", tags: food },
  { id: "pexels-38667644", alt: "Bread with a wheat-leaf pattern", author: "Feyza Daştan", tags: food },
  { id: "pexels-8454901", alt: "Running shoe on a red track", author: "Mikhail Nilov", tags: [...fitness, ...health] },
  { id: "pexels-8455975", alt: "Runner's feet on a track", author: "Mikhail Nilov", tags: fitness },
  { id: "pexels-31756484", alt: "Running shoes at the 400 m line", author: "Sarawut Horpetch", tags: fitness },
  { id: "pexels-6668319", alt: "Children reading a picture book", author: "cottonbro studio", tags: family },
  {
    id: "pexels-7307952",
    alt: "Adult and child pointing at a book",
    author: "Leeloo The First",
    tags: [...family, ...learning],
  },
  { id: "pexels-7269495", alt: "Mother and child reading together", author: "Kaboompics", tags: family },
  { id: "pexels-7968072", alt: "Notebook with a typewriter print and pens", author: "Ron Lach", tags: writing },
  { id: "pexels-4065401", alt: "Vintage typewriter close up", author: "Markus Winkler", tags: [...writing, ...story] },
  { id: "pexels-4018812", alt: "Typewriter, cameras and notes", author: "Wallace Chuck", tags: [...writing, ...story] },
  { id: "pexels-16408396", alt: "Soft shadows on a textured wall", author: "Tim Mossholder", tags: general },
  { id: "pexels-8533218", alt: "Sheet of paper on a sunlit wall", author: "Hanna Pad", tags: general },
  { id: "pexels-8516752", alt: "Leaf shadows on a beige wall", author: "Hanna Pad", tags: general },
  { id: "pexels-4252166", alt: "Layers of brown paper", author: "Edward Jenner", tags: general },
];

export function photoSrc(id: string): string {
  return `/covers/photos/${id}.jpg`;
}

/** Lowercase words with a naive singular: "routines" and "routine" match the same tag. */
function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z-]*/g) ?? []).map((w) =>
    w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w,
  );
}

/**
 * The library ordered for a topic: the best keyword matches first, then the general textures, then the rest.
 * `matched` is false when no photo matches – the panel then says so and leads with the general ones.
 */
export function photosFor(topic: string): { photos: CoverPhoto[]; matched: boolean } {
  const topicWords = new Set(words(topic));
  const scored = coverPhotos.map((photo, index) => ({
    photo,
    index,
    score: photo.tags.filter((t) => topicWords.has(t)).length,
    general: photo.tags.includes("general"),
  }));
  scored.sort((a, b) => b.score - a.score || Number(b.general) - Number(a.general) || a.index - b.index);
  return { photos: scored.map((s) => s.photo), matched: scored[0].score > 0 };
}

/** Where to draw a choice from, and whom to credit. Unknown library ids resolve to nothing. */
export function resolvePhoto(choice?: PhotoChoice): { src: string; credit?: string } | undefined {
  if (!choice) return undefined;
  if (choice.kind === "upload") return { src: choice.src };
  const photo = coverPhotos.find((p) => p.id === choice.id);
  return photo ? { src: photoSrc(photo.id), credit: `Photo by ${photo.author} · Pexels` } : undefined;
}

/** The photo a cover shows right now, if its artwork is a photo that still resolves. */
export function coverPhoto(cover: {
  artwork?: "shapes" | "photo";
  photo?: PhotoChoice;
  layout?: PhotoLayout;
}): { src: string; credit?: string; layout: PhotoLayout } | undefined {
  if (cover.artwork !== "photo") return undefined;
  const photo = resolvePhoto(cover.photo);
  return photo && { ...photo, layout: cover.layout ?? "full" };
}
