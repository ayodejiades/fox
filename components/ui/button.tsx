import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  showArrow?: boolean;
  icon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#f5c842] hover:bg-[#eab308] text-[#0b0d13] font-semibold border border-[#f5c842]",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--surface)] hover:border-[var(--accent)]/50",
  ghost:
    "bg-transparent text-[var(--fg)] hover:bg-[var(--surface-raised)] hover:text-white border border-transparent",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", showArrow, icon, className = "", children, ...props },
  ref,
) {
  const displayArrow = showArrow ?? (variant === "primary");

  return (
    <button
      ref={ref}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-sm)] text-sm font-semibold tracking-tight transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
        displayArrow ? "pl-4 pr-2.5 py-2" : "px-4 py-2"
      } ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {displayArrow && (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
            variant === "primary"
              ? "bg-[#0b0d13] text-[#f5c842]"
              : "bg-[#202634] text-[#f1f3f7] border border-[#2c3344]"
          }`}
        >
          {icon ?? (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          )}
        </span>
      )}
    </button>
  );
});
