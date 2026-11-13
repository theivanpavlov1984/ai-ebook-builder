import { Cover } from "@/components/book/Cover";
import { getCoverDesign, type ArtDirection, type Mood } from "@/components/book/cover-design";

const examples: { title: string; author: string; mood: Mood; direction: ArtDirection; note: string }[] = [
  { title: "Design Systems for Small Teams", author: "Ivan Pavlov", mood: "practical", direction: "editorial", note: "Practical guide" },
  { title: "Calm Mornings for Busy Founders", author: "Mara Lind", mood: "calm", direction: "organic", note: "Calm playbook" },
  { title: "The Freelance Pricing Playbook", author: "Sam Okafor", mood: "bold", direction: "typographic", note: "Bold handbook" },
];

export function ExampleShelf() {
  return (
    <section aria-label="Example books" className="flex items-end gap-6">
      {examples.map((e, i) => (
        <figure key={e.title} className={i === 1 ? "-translate-y-3" : undefined}>
          <Cover
            design={getCoverDesign({ title: e.title, mood: e.mood, direction: e.direction })}
            title={e.title}
            author={e.author}
            size="md"
          />
          <figcaption className="mt-2 text-xs text-secondary">{e.note}</figcaption>
        </figure>
      ))}
    </section>
  );
}
