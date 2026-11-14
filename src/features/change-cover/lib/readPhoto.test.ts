import { describe, expect, it } from "vitest";
import { checkPhoto, MIN_PHOTO_HEIGHT } from "./readPhoto";

const jpg = { name: "beach.jpg", type: "image/jpeg", size: 2_000_000 };

describe("checkPhoto", () => {
  it("accepts a large enough JPG, PNG or WebP", () => {
    expect(checkPhoto(jpg, MIN_PHOTO_HEIGHT)).toBeUndefined();
    expect(checkPhoto({ ...jpg, type: "image/png" }, 3000)).toBeUndefined();
    expect(checkPhoto({ ...jpg, type: "image/webp" })).toBeUndefined();
  });

  it("explains what is wrong and what to do instead", () => {
    expect(checkPhoto({ ...jpg, type: "application/pdf" })).toMatch(/isn't a photo/);
    expect(checkPhoto({ ...jpg, size: 20_000_000 })).toMatch(/over 15 MB/);
    expect(checkPhoto(jpg, 640)).toBe(
      "beach.jpg is 640 px tall, so the cover would print blurry. Pick one at least 1200 px tall.",
    );
  });
});
