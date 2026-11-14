"use client";

import type { Book } from "@/entities/book";
import { slugify } from "@/shared/lib";

/** Builds the PDF in the browser and saves it. react-pdf is loaded only when needed. */
export async function downloadPdf(book: Book): Promise<void> {
  const [{ pdf }, { BookPdf }, { registerPdfFonts }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../ui/BookPdf"),
    import("../lib/fonts"),
  ]);
  registerPdfFonts(window.location.origin);
  const blob = await pdf(<BookPdf book={book} fonts="embedded" />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(book.title || book.topic)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
