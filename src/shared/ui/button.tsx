import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#7b5cff] via-[#ff3cac] to-[#ffb347] text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50",
  secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/15",
  ghost: "bg-transparent text-white hover:bg-white/10",
  outline:
    "border border-white/30 text-white hover:border-white/60 hover:bg-white/5",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-400 disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
