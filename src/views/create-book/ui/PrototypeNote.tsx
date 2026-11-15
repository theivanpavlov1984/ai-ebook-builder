import { Info } from "lucide-react";
import { isDemoTopic } from "@/entities/book";

/**
 * The AI is simulated: an own topic gets template titles, outline and chapters. Said where the first generated
 * text appears (Title) and again where the chapters are written (Build), so nobody mistakes it for the product.
 */
export function PrototypeNote({ topic, what }: { topic: string; what: string }) {
  if (isDemoTopic(topic)) return null;
  return (
    <p className="-mt-4 mb-6 flex items-start gap-2 text-sm text-secondary">
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        Prototype note: the AI is simulated, so {what} for your own topic follow a template. For a fully written sample,
        start a book about “Design systems for small teams”.
      </span>
    </p>
  );
}
