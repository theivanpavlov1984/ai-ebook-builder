import { describe, expect, it } from "vitest";
import { coverPhoto, coverPhotos, photosFor, photoSrc } from "./cover-photos";
import { coverScene } from "./cover-scene";
import { getCoverDesign } from "./cover-design";

describe("photosFor", () => {
  it("leads with photos that match the topic", () => {
    const { photos, matched } = photosFor("Design systems for small teams");
    expect(matched).toBe(true);
    expect(photos[0].tags).toContain("design");
  });

  it("matches plurals and several topics at once", () => {
    const { photos } = photosFor("Calm morning routines for busy founders");
    const firstFour = photos.slice(0, 4).flatMap((p) => p.tags);
    expect(firstFour).toEqual(expect.arrayContaining(["calm"]));
    expect(photos.slice(0, 8).some((p) => p.tags.includes("routine"))).toBe(true);
  });

  it("falls back to general photos and says so", () => {
    const { photos, matched } = photosFor("Quantum knitting");
    expect(matched).toBe(false);
    expect(photos[0].tags).toContain("general");
  });

  it("always returns the whole library", () => {
    expect(photosFor("anything").photos).toHaveLength(coverPhotos.length);
  });
});

describe("coverPhoto", () => {
  it("is empty for a shapes cover, even with a photo kept from before", () => {
    expect(coverPhoto({ artwork: "shapes", photo: { kind: "library", id: coverPhotos[0].id } })).toBeUndefined();
  });

  it("credits library photos and defaults to the full-bleed layout", () => {
    const photo = coverPhoto({ artwork: "photo", photo: { kind: "library", id: coverPhotos[0].id } });
    expect(photo).toEqual({
      src: photoSrc(coverPhotos[0].id),
      credit: `Photo by ${coverPhotos[0].author} · Pexels`,
      layout: "full",
    });
  });

  it("ignores a library id that no longer exists", () => {
    expect(coverPhoto({ artwork: "photo", photo: { kind: "library", id: "gone" } })).toBeUndefined();
  });
});

describe("coverScene with a photo", () => {
  const title = "Design Systems for Small Teams: A Practical Field Guide for Founders and First Hires";
  const scene = (layout: "full" | "band" | "framed") =>
    coverScene(getCoverDesign({ title, mood: "practical", photo: { src: "/p.jpg", layout } }), title, {
      subtitle: "A practical start for teams of 3–10",
      author: "Ada",
    });

  it("drops the shapes and darkens a full-bleed photo under light text", () => {
    const s = scene("full");
    expect(s.shapes).toEqual([]);
    expect(s.photo).toMatchObject({ x: 0, y: 0, width: s.width, height: s.height });
    expect(s.title.color).toBe("#FBF8F3");
    expect(Math.max(...s.scrims.map((x) => x.to))).toBeGreaterThan(0.8);
  });

  it("keeps band and framed titles clear of the photo", () => {
    for (const layout of ["band", "framed"] as const) {
      const s = scene(layout);
      const photoBottom = s.photo!.y + s.photo!.height;
      expect(s.title.lines.length).toBeLessThanOrEqual(3);
      expect(s.title.y - s.title.size).toBeGreaterThanOrEqual(photoBottom);
    }
  });
});
