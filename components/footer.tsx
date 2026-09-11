import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--fg-muted)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 text-base font-bold text-[var(--fg)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-contrast)] font-mono font-bold text-xs">
                FoX
              </span>
              <span>FoX Protocol</span>
            </Link>
            <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
              SLA-gated streaming micropayments for live exchange rate feeds. Non-custodial escrow in FoX.sol with ERC-8021 attribution on Celo.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--fg)]">
              Protocol
            </span>
            <ul className="flex flex-col gap-1.5 font-mono text-xs">
              <li>
                <Link href="/" className="hover:text-[var(--fg)] transition">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/meter" className="hover:text-[var(--fg)] transition">
                  Live Meter
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-[var(--fg)] transition">
                  Agent Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[var(--fg)] transition">
                  Register Node
                </Link>
              </li>
            </ul>
          </div>

          {/* Active Corridors */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--fg)]">
              Corridors
            </span>
            <ul className="flex flex-col gap-1.5 font-mono text-xs">
              <li className="text-[var(--fg)]">CELO / cNGN <span className="text-[var(--fg-muted)]">(0.001/s)</span></li>
              <li className="text-[var(--fg)]">CELO / wBRL <span className="text-[var(--fg-muted)]">(0.002/s)</span></li>
              <li className="text-[var(--fg)]">CELO / wARS <span className="text-[var(--fg-muted)]">(0.0015/s)</span></li>
              <li className="text-[var(--fg)]">CELO / USA₮ <span className="text-[var(--fg-muted)]">(0.0005/s)</span></li>
            </ul>
          </div>

          {/* Settlement Specs */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--fg)]">
              Architecture
            </span>
            <ul className="flex flex-col gap-1.5 font-mono text-xs">
              <li>Network: <span className="text-[var(--fg)]">Celo L2</span></li>
              <li>Settlement: <span className="text-[var(--fg)]">Per Healthy Sec</span></li>
              <li>Signatures: <span className="text-[var(--fg)]">EIP-191 Bilateral</span></li>
              <li>Attribution: <span className="text-[var(--fg)]">ERC-8021 Calldata</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-xs text-[var(--fg-muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} FoX Protocol. Built for autonomous agent settlements on Celo.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>LATENCY THRESHOLD: 800MS</span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--accent)]">ESCROW: FOX.SOL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
