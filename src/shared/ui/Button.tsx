import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-inverse text-on-inverse hover:opacity-90",
  secondary: "bg-surface text-primary border border-default hover:border-strong",
  ghost: "text-primary hover:bg-subtle",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-base gap-2",
  sm: "h-8 px-3 text-sm gap-1.5",
};

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-focus";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap",
        "transition-[background-color,border-color,opacity] duration-150 ease-standard",
        "disabled:cursor-not-allowed disabled:opacity-50",
        focusRing,
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
