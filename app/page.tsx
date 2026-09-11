import Link from "next/link";
import { Button } from "@/components/ui/button";

const CORRIDORS = [
  {
    pair: "CELO / cNGN",
    rate: "₦1,642.50",
    change: "+0.42%",
    sla: "99.98%",
    latency: "240ms",
    status: "Healthy",
    useCase: "Nigeria Remittances & Local Merchant Settlement",
  },
  {
    pair: "CELO / wBRL",
    rate: "R$ 5.82",
    change: "-0.15%",
    sla: "99.95%",
    latency: "310ms",
    status: "Healthy",
    useCase: "Brazil Pix Bridge & Cross-Border B2B",
  },
  {
    pair: "CELO / wARS",
    rate: "$ 1,285.00",
    change: "+1.20%",
    sla: "99.90%",
    latency: "380ms",
    status: "Healthy",
    useCase: "Argentina Inflation Defense & Payroll",
  },
  {
    pair: "CELO / USA₮",
    rate: "$ 0.684",
    change: "+0.08%",
    sla: "99.99%",
    latency: "180ms",
    status: "Healthy",
    useCase: "Universal Stable Dollar Liquidity Rail",
  },
];

const ARCHITECTURE_STEPS = [
  {
    step: "01",
    title: "Agent Escrow Deposit",
    body: "The buyer agent deposits stablecoins (cUSD, cNGN, or USA₮) into FoX.sol escrow. Funds remain under the buyer's control until signed settlement windows are redeemed.",
  },
  {
    step: "02",
    title: "SLA-Gated Stream Accrual",
    body: "The rate feed streams tick data. The local meter checks latency and status thresholds each second: healthy seconds accrue at the corridor rate; breach seconds cost exactly 0.",
  },
  {
    step: "03",
    title: "Bilateral Window Signing",
    body: "At settlement intervals, the buyer agent signs the exact healthy second count [windowStart, windowEnd, healthySeconds] using EIP-191 personal sign.",
  },
  {
    step: "04",
    title: "ERC-8021 Settlement",
    body: "The feed seller submits the signed settlement on Celo with ERC-8021 attribution calldata. FoX.sol verifies the signature and transfers accrued tokens.",
  },
];

const COMPARISON = [
  {
    feature: "Billing Paradigm",
    traditional: "Per API call (regardless of data freshness)",
    fox: "Per whole second of verified healthy data",
  },
  {
    feature: "Stale / Slow Feed Penalty",
    traditional: "Buyer pays 100% full price for failed calls",
    fox: "Meter automatically halts: 0 charge during breaches",
  },
  {
    feature: "Settlement Mechanism",
    traditional: "Monthly post-paid invoice or locked SaaS sub",
    fox: "Micro-streaming settlement via non-custodial smart contracts",
  },
  {
    feature: "On-Chain Verification",
    traditional: "None: centralized server logs",
    fox: "EIP-191 signatures + ERC-8021 attribution tags on Celo",
  },
  {
    feature: "Agent Independence",
    traditional: "Credit card required, vendor lock-in",
    fox: "Autonomous wallet-to-wallet programmatic settlement",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 border-b border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl text-[var(--fg)]">
              Pay for live FX feeds by the second.{" "}
              <span className="text-[var(--accent)]">Only when the SLA holds.</span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-[var(--fg-muted)] leading-relaxed">
              Autonomous AI agents executing remittances, bill payments, and corridor trades stream
              micropayments for exchange rate feeds. When latency exceeds 800ms or the feed stalls, accrual
              stops immediately, backed by smart contract escrow in <code className="text-[var(--fg)] font-mono">FoX.sol</code>.
            </p>

            {/* Main CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/signin">
                <Button data-demo="start-test" variant="primary">
                  Start test
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" showArrow={false}>
                  Register Agent Node
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-3xl">
              <div className="border border-[var(--border)] bg-[var(--surface)] p-4 text-center rounded-[var(--radius-sm)]">
                <span className="text-xl font-bold font-mono text-[var(--fg)]">0.001</span>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fg-muted)] mt-1">cNGN / sec</span>
              </div>
              <div className="border border-[var(--border)] bg-[var(--surface)] p-4 text-center rounded-[var(--radius-sm)]">
                <span className="text-xl font-bold font-mono text-emerald-400">&lt; 800ms</span>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fg-muted)] mt-1">Latency SLA</span>
              </div>
              <div className="border border-[var(--border)] bg-[var(--surface)] p-4 text-center rounded-[var(--radius-sm)]">
                <span className="text-xl font-bold font-mono text-[var(--accent)]">0.0000</span>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fg-muted)] mt-1">Cost in Breach</span>
              </div>
              <div className="border border-[var(--border)] bg-[var(--surface)] p-4 text-center rounded-[var(--radius-sm)]">
                <span className="text-xl font-bold font-mono text-[var(--fg)]">100%</span>
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fg-muted)] mt-1">Non-Custodial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Corridors Section */}
      <section className="mx-auto max-w-5xl px-6 w-full">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">
              Supported FX Corridors
            </h2>
          </div>
          <p className="text-xs text-[var(--fg-muted)]">
            Exchange rates streamed per whole healthy second directly to autonomous agent wallets.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {CORRIDORS.map((c) => (
            <div
              key={c.pair}
              className="flex flex-col justify-between gap-4 p-5 border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius-sm)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-bold font-mono text-[var(--fg)]">{c.pair}</span>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">{c.useCase}</p>
                </div>
                <span className="border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 rounded-[var(--radius-sm)] font-mono text-[10px] text-emerald-400">
                  {c.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-3">
                <div>
                  <span className="text-xl font-bold font-mono text-[var(--fg)]">{c.rate}</span>
                  <span className="ml-2 text-xs font-mono text-emerald-400">{c.change}</span>
                </div>
                <div className="text-right font-mono text-xs text-[var(--fg-muted)]">
                  <span>LATENCY: {c.latency}</span>
                  <span className="mx-1.5">|</span>
                  <span className="text-[var(--accent)]">SLA: {c.sla}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Protocol Mechanics */}
      <section className="mx-auto max-w-5xl px-6 w-full">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">
            Protocol Architecture
          </h2>
          <p className="text-xs text-[var(--fg-muted)]">
            Deterministic state transitions enforced by local agent auditing and on-chain verification.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ARCHITECTURE_STEPS.map((s) => (
            <div
              key={s.step}
              className="flex flex-col gap-2.5 p-5 border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius-sm)]"
            >
              <span className="text-xs font-mono text-[var(--accent)] font-bold">PHASE {s.step}</span>
              <h3 className="text-sm font-semibold text-[var(--fg)]">{s.title}</h3>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="mx-auto max-w-5xl px-6 w-full">
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius-sm)] p-6">
          <div className="flex flex-col gap-1 mb-5">
            <h3 className="text-base font-bold text-[var(--fg)]">
              Traditional API Billing vs. FoX SLA Streaming
            </h3>
            <p className="text-xs text-[var(--fg-muted)]">
              Why traditional REST models cause silent financial loss for autonomous trading agents.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] font-mono text-[11px] uppercase text-[var(--fg-muted)]">
                  <th className="py-2.5 px-2 font-medium">Dimension</th>
                  <th className="py-2.5 px-2 font-medium text-red-400">Traditional API Feed</th>
                  <th className="py-2.5 px-2 font-medium text-[var(--accent)]">FoX Streaming Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-[var(--surface-raised)] transition">
                    <td className="py-3 px-2 font-sans font-medium text-[var(--fg)]">{row.feature}</td>
                    <td className="py-3 px-2 text-[var(--fg-muted)]">{row.traditional}</td>
                    <td className="py-3 px-2 text-[var(--accent)] font-semibold">{row.fox}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Code Snippet Section */}
      <section className="mx-auto max-w-5xl px-6 w-full">
        <div className="grid gap-6 lg:grid-cols-2 items-center">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">
              Integration Spec
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
              Programmatic Settlement in 4 Lines
            </h2>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              Standard Viem and EIP-191 signatures. Buyer agents co-sign discrete settlement windows
              based strictly on local whole-second latency logs.
            </p>
            <div className="flex gap-2.5 pt-2">
              <Link href="/signin">
                <Button data-demo="start-test-secondary" variant="primary">
                  Start test
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" showArrow={false}>
                  Provision Node
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4 font-mono text-xs overflow-x-auto bg-[#06080d] border border-[var(--border)] rounded-[var(--radius-sm)]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)] text-[var(--fg-muted)] text-[11px]">
              <span>agent-settle.ts</span>
              <span>VIEM / ERC-8021</span>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto text-zinc-300">
              <code>
                <span className="text-zinc-500">{"// 1. Subscribe to SLA-gated stream"}</span>{"\n"}
                <span className="text-purple-400">const</span> stream = <span className="text-purple-400">await</span> fox.<span className="text-sky-400">subscribe</span>({"{"}{"\n"}
                {"  "}corridor: <span className="text-emerald-400">&quot;CELO/cNGN&quot;</span>,{"\n"}
                {"  "}maxLatencyMs: <span className="text-amber-300">800</span>,{"\n"}
                {"  "}ratePerSecond: <span className="text-amber-300">0.001</span>{"\n"}
                {"}"});{"\n\n"}
                <span className="text-zinc-500">{"// 2. Buyer co-signs verified healthy window"}</span>{"\n"}
                <span className="text-purple-400">const</span> signature = <span className="text-purple-400">await</span> buyerAccount.<span className="text-sky-400">signMessage</span>({"{"}{"\n"}
                {"  "}message: {"{"} raw: <span className="text-cyan-300">windowHash</span> {"}"}{"\n"}
                {"}"});{"\n\n"}
                <span className="text-zinc-500">{"// 3. Seller settles on Celo with ERC-8021 tag"}</span>{"\n"}
                <span className="text-purple-400">await</span> sellerClient.<span className="text-sky-400">writeContract</span>({"{"}{"\n"}
                {"  "}address: <span className="text-cyan-300">FOX_CONTRACT_ADDRESS</span>,{"\n"}
                {"  "}abi: <span className="text-cyan-300">meterAbi</span>,{"\n"}
                {"  "}functionName: <span className="text-emerald-400">&quot;settle&quot;</span>,{"\n"}
                {"  "}args: [<span className="text-cyan-300">buyer</span>, <span className="text-cyan-300">start</span>, <span className="text-cyan-300">end</span>, <span className="text-cyan-300">healthySecs</span>, <span className="text-cyan-300">signature</span>]{"\n"}
                {"}"});
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="mx-auto max-w-5xl px-6 w-full">
        <div className="border border-[var(--border)] bg-[var(--surface)] p-8 text-center rounded-[var(--radius-sm)] flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
            Deploy Autonomous Rate Feeds on Celo
          </h2>
          <p className="max-w-md text-xs text-[var(--fg-muted)]">
            Run through the live SLA simulation or provision an agent node to stream verified rates.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link href="/signin">
              <Button variant="primary">
                Start test
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" showArrow={false}>
                Register Node
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
