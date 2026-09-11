import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-0.5 font-mono text-[11px] font-medium tracking-tight text-[var(--fg)] ${className}`}
      {...props}
    />
  );
}
