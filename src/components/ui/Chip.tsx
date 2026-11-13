"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./Button";

const chipBase = cn(
  "inline-flex h-8 items-center rounded-full border px-3 text-sm whitespace-nowrap",
  "transition-[background-color,border-color,color] duration-150 ease-standard",
  focusRing,
);
const chipOff = "border-default bg-surface text-secondary hover:border-strong hover:text-primary";
const chipOn = "border-inverse bg-inverse text-on-inverse";

export function Chip({
  selected = false,
  onToggle,
  children,
}: {
  selected?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onToggle} className={cn(chipBase, selected ? chipOn : chipOff)}>
      {children}
    </button>
  );
}

type Option<T extends string> = { value: T; label: string };

type ChipGroupProps<T extends string> =
  | { label: string; options: Option<T>[]; mode: "single"; value: T; onChange: (v: T) => void }
  | { label: string; options: Option<T>[]; mode: "multi"; value: T[]; onChange: (v: T[]) => void };

export function ChipGroup<T extends string>(props: ChipGroupProps<T>) {
  const { label, options } = props;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  if (props.mode === "multi") {
    const { value, onChange } = props;
    return (
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <Chip
              key={o.value}
              selected={on}
              onToggle={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            >
              {o.label}
            </Chip>
          );
        })}
      </div>
    );
  }

  const { value, onChange } = props;
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  function move(from: number, delta: number) {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(index, -1);
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === selectedIndex ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(chipBase, on ? chipOn : chipOff)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
