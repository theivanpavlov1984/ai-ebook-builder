"use client";

import { Shuffle } from "lucide-react";
import { useState } from "react";
import { Cover, directionsForMood, getCoverDesign, type ArtDirection, useBooks, type Book } from "@/entities/book";
import { Button, ChipGroup, focusRing, Input } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { PhotoPicker } from "./PhotoPicker";

type Artwork = "shapes" | "photo";
const artworkOptions: { value: Artwork; label: string }[] = [
  { value: "shapes", label: "Shapes" },
  { value: "photo", label: "Photo" },
];

const styleName: Record<ArtDirection, string> = {
  editorial: "Editorial",
  geometric: "Geometric",
  organic: "Organic",
  typographic: "Typographic",
};

export function CoverPanel({ book }: { book: Book }) {
  const updateBook = useBooks((s) => s.updateBook);
  // The tab can show Photo before a photo is on the cover: the picker puts the first one there once it loads.
  const [artwork, setArtwork] = useState<Artwork>(book.cover.artwork ?? "shapes");

  function chooseArtwork(next: Artwork) {
    setArtwork(next);
    if (next === "shapes" || book.cover.photo)
      updateBook(book.id, { cover: { ...book.cover, artwork: next } }, { snapshot: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wider text-secondary uppercase">Adjust cover</p>
        <ChipGroup
          label="Artwork"
          options={artworkOptions}
          mode="single"
          value={artwork}
          onChange={chooseArtwork}
          appearance="segmented"
        />
      </div>

      {artwork === "photo" ? <PhotoPicker book={book} /> : <ShapeStyles book={book} />}

      <div className="flex flex-col gap-4 border-t border-default pt-4">
        <Input label="Title" value={book.title} onChange={(e) => updateBook(book.id, { title: e.target.value })} />
        <Input
          label="Subtitle"
          value={book.subtitle}
          onChange={(e) => updateBook(book.id, { subtitle: e.target.value })}
        />
        <Input
          label="Author name"
          placeholder="Your name"
          value={book.author}
          onChange={(e) => updateBook(book.id, { author: e.target.value })}
        />
      </div>
    </div>
  );
}

function ShapeStyles({ book }: { book: Book }) {
  const updateBook = useBooks((s) => s.updateBook);
  const options = directionsForMood(book.mood);
  const title = book.title || book.topic;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-secondary">Three styles that fit a {book.mood} book.</p>

      <div role="radiogroup" aria-label="Cover style" className="grid grid-cols-3 gap-3">
        {options.map((direction) => {
          const checked = book.cover.direction === direction;
          return (
            <button
              key={direction}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${styleName[direction]} style`}
              onClick={() =>
                updateBook(book.id, { cover: { ...book.cover, direction, variant: 0 } }, { snapshot: true })
              }
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border p-2",
                checked ? "border-inverse bg-surface" : "border-transparent hover:border-default",
                focusRing,
              )}
            >
              <Cover
                design={getCoverDesign({
                  title,
                  mood: book.mood,
                  direction,
                  variant: checked ? book.cover.variant : 0,
                })}
                title={title}
                size="none"
                className="w-full"
              />
              <span className="text-xs text-secondary">{styleName[direction]}</span>
            </button>
          );
        })}
      </div>

      <Button
        variant="secondary"
        size="sm"
        icon={<Shuffle aria-hidden className="size-3.5" />}
        onClick={() =>
          updateBook(book.id, { cover: { ...book.cover, variant: book.cover.variant + 1 } }, { snapshot: true })
        }
      >
        Shuffle this style
      </Button>
    </div>
  );
}
