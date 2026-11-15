"use client";

import type { Book } from "@/entities/book";
import { slugify } from "@/shared/lib";

/** Builds the book's PDF in the browser. react-pdf is loaded only when needed. */
export async function buildPdf(book: Book): Promise<Blob> {
  const [{ pdf }, { BookPdf }, { registerPdfFonts }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../ui/BookPdf"),
    import("../lib/fonts"),
  ]);
  registerPdfFonts(window.location.origin);
  return pdf(<BookPdf book={book} fonts="embedded" origin={window.location.origin} />).toBlob();
}

/** Builds the PDF and saves it. */
export async function downloadPdf(book: Book): Promise<void> {
  const blob = await buildPdf(book);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(book.title || book.topic)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
