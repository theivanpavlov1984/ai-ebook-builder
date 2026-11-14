"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./Button";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-inverse/40" />
        <DialogPrimitive.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed top-1/2 left-1/2 z-50 w-[min(480px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-6 shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="font-display text-xl font-medium">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close"
              className={cn("rounded-sm p-1 text-secondary hover:text-primary", focusRing)}
            >
              <X aria-hidden className="size-4" />
            </DialogPrimitive.Close>
          </div>
          {description && (
            <DialogPrimitive.Description className="mt-1.5 text-base text-secondary">
              {description}
            </DialogPrimitive.Description>
          )}
          {children && <div className="mt-5">{children}</div>}
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
