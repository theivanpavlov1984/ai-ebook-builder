import { describe, expect, it } from "vitest";
import { sampleBooks } from "../model/samples";
import { coverPhotos } from "../model/cover-photos";
import { decodeBook, encodeBook } from "./share";

const book = sampleBooks()[0];

describe("share links and photo covers", () => {
  it("carry a library photo and its layout", () => {
    const cover = {
      ...book.cover,
      artwork: "photo" as const,
      photo: { kind: "library" as const, id: coverPhotos[3].id },
      layout: "band" as const,
    };
    const shared = decodeBook(encodeBook({ ...book, cover }));
    expect(shared?.cover).toMatchObject({
      artwork: "photo",
      photo: { kind: "library", id: coverPhotos[3].id },
      layout: "band",
    });
  });

  it("leave an uploaded photo out – it is too big for a link – and fall back to shapes", () => {
    const cover = {
      ...book.cover,
      artwork: "photo" as const,
      photo: { kind: "upload" as const, src: "data:image/jpeg;base64,AAAA", name: "me.jpg" },
    };
    const shared = decodeBook(encodeBook({ ...book, cover }));
    expect(shared?.cover.artwork).toBeUndefined();
    expect(shared?.cover.direction).toBe(book.cover.direction);
  });
});
