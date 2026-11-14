/** Checks and shrinks the user's own cover photo. It is stored with the book on this device, never uploaded. */

export const MIN_PHOTO_HEIGHT = 1200;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
/** Tall enough for the PDF cover, small enough (~200 KB as JPEG) to keep in browser storage. */
const STORED_HEIGHT = 1400;

/** A message for the person, or undefined when the photo will do. */
export function checkPhoto(file: { name: string; type: string; size: number }, height?: number): string | undefined {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return "That file isn't a photo. Use a JPG, PNG or WebP.";
  if (file.size > MAX_FILE_BYTES) return `${file.name} is over 15 MB. Pick a smaller one.`;
  if (height !== undefined && height < MIN_PHOTO_HEIGHT)
    return `${file.name} is ${height} px tall, so the cover would print blurry. Pick one at least ${MIN_PHOTO_HEIGHT} px tall.`;
  return undefined;
}

/** Reads the file, checks its size, and returns a JPEG data URL scaled down to STORED_HEIGHT. */
export async function readPhoto(file: File): Promise<{ src: string; name: string }> {
  const early = checkPhoto(file);
  if (early) throw new Error(early);

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {
      throw new Error(`${file.name} couldn't be opened. Try another photo.`);
    });
    const tooSmall = checkPhoto(file, img.naturalHeight);
    if (tooSmall) throw new Error(tooSmall);

    const scale = Math.min(1, STORED_HEIGHT / img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { src: canvas.toDataURL("image/jpeg", 0.82), name: file.name };
  } finally {
    URL.revokeObjectURL(url);
  }
}
