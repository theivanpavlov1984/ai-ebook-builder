/**
 * A chapter body is a list of paragraphs. Generated chapters end with a to-do list – "Try this today:" and then
 * a paragraph of numbered lines – which readers should see as a box, on screen and in the PDF. This turns the
 * paragraphs into blocks: plain text, or that list. `from` is the index of the block's first paragraph,
 * so a view that highlights changed paragraphs can still find them.
 */
export type ChapterBlock =
  { kind: "text"; text: string; from: number } | { kind: "action"; heading: string; steps: string[]; from: number };

const HEADING = /^(Try this(?: today)?):$/;
const STEP = /^\d+\.\s+(.+)$/;

export function chapterBlocks(body: string[]): ChapterBlock[] {
  const blocks: ChapterBlock[] = [];
  for (let i = 0; i < body.length; i++) {
    const heading = body[i].trim().match(HEADING);
    const lines = body[i + 1]?.split("\n").map((l) => l.trim()) ?? [];
    if (heading && lines.length > 0 && lines.every((l) => STEP.test(l))) {
      blocks.push({ kind: "action", heading: heading[1], steps: lines.map((l) => l.match(STEP)![1]), from: i });
      i++;
    } else {
      blocks.push({ kind: "text", text: body[i], from: i });
    }
  }
  return blocks;
}
