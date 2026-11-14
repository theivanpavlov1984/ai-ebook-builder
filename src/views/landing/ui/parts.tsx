import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/shared/lib";

/** Small uppercase label above a section headline. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold tracking-[0.08em] text-accent-strong uppercase">{children}</p>;
}

/** Section headline: the interface face, large. */
export function SectionTitle({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("mt-3.5 font-brand text-3xl leading-[1.05] font-bold tracking-tight", className)}>
      {children}
    </h2>
  );
}

/**
 * A crop of a full 1440×900 product screenshot: the screen is drawn at `scale` and shifted by `x`/`y`
 * (in rendered px), so a card shows just the part that matters.
 */
export function ScreenCrop({
  src,
  alt = "",
  scale,
  x = 0,
  y = 0,
  className,
}: {
  src: string;
  alt?: string;
  scale: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  const style: CSSProperties = { width: 1440 * scale, height: 900 * scale, marginLeft: -x, marginTop: -y };
  return (
    <div className={cn("overflow-hidden", className)}>
      <Image src={src} alt={alt} width={1440} height={900} style={style} className="max-w-none" />
    </div>
  );
}
