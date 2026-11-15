/**
 * A chapter is stored as paragraphs; the editor shows it as one text, paragraphs separated by an empty line,
 * the way people write in any text box. A numbered list is one paragraph of lines, so it survives the round trip.
 */
export function bodyToText(body: string[]): string {
  return body.join("\n\n");
}

export function textToBody(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
