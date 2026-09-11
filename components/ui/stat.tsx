export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--fg-muted)]">{label}</span>
      <span className="font-mono text-2xl font-bold tracking-tight text-[var(--fg)]">{value}</span>
      {hint ? <span className="text-xs text-[var(--fg-muted)]">{hint}</span> : null}
    </div>
  );
}
