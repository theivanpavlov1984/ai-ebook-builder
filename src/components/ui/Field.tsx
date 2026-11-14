"use client";

import { CircleExclamationPoint } from "lucide-react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./Button";

type FieldMeta = { label: string; hint?: string; error?: string };

const control = cn(
  "w-full rounded-md border bg-surface px-3 text-md text-primary placeholder:text-secondary",
  "transition-[border-color,box-shadow] duration-150 ease-standard",
  "focus-visible:border-accent disabled:opacity-50",
  focusRing,
);

function useFieldIds(id?: string) {
  const auto = useId();
  const fieldId = id ?? auto;
  return { fieldId, hintId: `${fieldId}-hint`, errorId: `${fieldId}-error` };
}

function FieldFrame({
  fieldId,
  hintId,
  errorId,
  label,
  hint,
  error,
  children,
}: FieldMeta & { fieldId: string; hintId: string; errorId: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-primary">
        {label}
      </label>
      {children}
      {error ? (
        <p data-field-error className="flex items-center gap-1.5 text-sm text-danger">
          <CircleExclamationPoint aria-hidden className="size-4 shrink-0" />
          <span id={errorId}>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy({ hint, error }: FieldMeta, hintId: string, errorId: string) {
  if (error) return errorId;
  if (hint) return hintId;
  return undefined;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldMeta;

export function Input({ label, hint, error, id, className, ...rest }: InputProps) {
  const ids = useFieldIds(id);
  return (
    <FieldFrame {...ids} label={label} hint={hint} error={error}>
      <input
        id={ids.fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ label, hint, error }, ids.hintId, ids.errorId)}
        className={cn(control, "h-10", error ? "border-danger" : "border-default", className)}
        {...rest}
      />
    </FieldFrame>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldMeta & { autoGrow?: boolean };

export function Textarea({ label, hint, error, id, autoGrow, className, onInput, ...rest }: TextareaProps) {
  const ids = useFieldIds(id);
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el || !autoGrow) return;
    // Empty field: keep the natural `rows` height. Measuring here can happen before styles
    // load (narrow unstyled box → huge scrollHeight) and would stick.
    if (!el.value) {
      el.style.height = "";
      return;
    }
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow]);

  useLayoutEffect(fit, [fit, rest.value]);

  return (
    <FieldFrame {...ids} label={label} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={ids.fieldId}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy({ label, hint, error }, ids.hintId, ids.errorId)}
        onInput={(e) => {
          fit();
          onInput?.(e);
        }}
        className={cn(control, "py-2.5 resize-none", error ? "border-danger" : "border-default", className)}
        {...rest}
      />
    </FieldFrame>
  );
}
