"use client";

import { Check, CircleExclamationPoint, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib";
import { focusRing } from "./Button";

export type ToastInput = {
  tone: "success" | "error" | "info";
  message: string;
  action?: { label: string; onClick: () => void };
  durationMs?: number;
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<{ show: (t: ToastInput) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const icons = { success: Check, error: CircleExclamationPoint, info: Info } as const;
const iconColor = { success: "text-success", error: "text-danger", info: "text-accent" } as const;

function ToastView({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { id, tone, message, action, durationMs = 5000 } = toast;
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), durationMs);
    return () => clearTimeout(t);
  }, [id, durationMs, onDismiss]);

  const Icon = icons[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex w-[360px] items-center gap-3 rounded-md bg-inverse px-4 py-3 text-on-inverse shadow-md"
    >
      <Icon aria-hidden className={cn("size-4 shrink-0", iconColor[tone])} />
      <p className="flex-1 text-base">{message}</p>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onDismiss(id);
          }}
          className={cn("rounded-sm px-1 text-sm font-semibold underline underline-offset-2", focusRing)}
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(id)}
        className={cn("rounded-sm opacity-70 hover:opacity-100", focusRing)}
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback((t: ToastInput) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((all) => [...all, { ...t, id }]);
  }, []);
  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex flex-col gap-2 [&>*]:pointer-events-auto">
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
