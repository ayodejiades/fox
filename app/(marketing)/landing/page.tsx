import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CORRIDORS = [
  {
    pair: "CELO / cNGN",
    rate: "₦1,642.50",
    change: "+0.42%",
    sla: "99.98%",
    latency: "240ms",
    status: "Active",
    useCase: "Nigeria Remittances & Local Merchant Settlement",
  },
  {
    pair: "CELO / wBRL",
    rate: "R$ 5.82",
    change: "-0.15%",
    sla: "99.95%",
    latency: "310ms",
    status: "Active",
    useCase: "Brazil Pix Bridge & Cross-Border B2B",
  },
  {
    pair: "CELO / wARS",
    rate: "$ 1,285.00",
    change: "+1.20%",
    sla: "99.90%",
    latency: "380ms",
    status: "Active",
    useCase: "Argentina Inflation Defense & Payroll",
  },
  {
    pair: "CELO / USA₮",
    rate: "$ 0.684",
    change: "+0.08%",
    sla: "99.99%",
    latency: "180ms",
    status: "Active",
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
    traditional: "None — centralized server logs",
    fox: "EIP-191 signatures + ERC-8021 attribution tags on Celo",
  },
  {
    feature: "Agent Independence",
    traditional: "Credit card required, vendor lock-in",
    fox: "Autonomous wallet-to-wallet programmatic settlement",
  },
];

export default function Landing() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--fg-muted)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-ping" />
              <span>SLA-Gated FX Rate Streaming on Celo</span>
              <span className="text-[var(--accent)] font-medium">ERC-8021</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl text-[var(--fg)]">
              Pay for live FX feeds by the second.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                Only when the SLA holds.
              </span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-[var(--fg-muted)] leading-relaxed">
              Autonomous AI agents executing remittances, bill payments, and corridor arbitrage stream
              micro-payments for live rate feeds. When latency spikes or the feed stalls, payment pauses
              instantly — enforced by on-chain escrow in <code className="text-amber-300">FoX.sol</code>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/">
                <Button variant="primary" className="h-12 px-8 text-base shadow-lg shadow-amber-500/20">
                  Launch Live Meter
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" className="h-12 px-6 text-base">
                  Register Agent Node
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-3xl">
              <Card className="p-4 text-center">
                <span className="text-2xl font-bold text-[var(--fg)]">0.001</span>
                <span className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mt-1">cNGN / sec</span>
              </Card>
              <Card className="p-4 text-center">
                <span className="text-2xl font-bold text-emerald-400">&lt; 800ms</span>
                <span className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mt-1">Latency SLA</span>
              </Card>
              <Card className="p-4 text-center">
                <span className="text-2xl font-bold text-[var(--accent)]">0%</span>
                <span className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mt-1">Cost in Breach</span>
              </Card>
              <Card className="p-4 text-center">
                <span className="text-2xl font-bold text-[var(--fg)]">100%</span>
                <span className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mt-1">Non-Custodial</span>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Live Corridors Section */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-4 mb-8">
          <Badge className="w-fit">Supported Corridors</Badge>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
                Live Celo FX Corridors
              </h2>
              <p className="text-sm text-[var(--fg-muted)] mt-1">
                Real-time stablecoin exchange rates streaming to autonomous remittance agents.
              </p>
            </div>
            <Link href="/" className="text-xs text-[var(--accent)] hover:underline">
              Inspect active meter &rarr;
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CORRIDORS.map((c) => (
            <Card key={c.pair} className="flex flex-col justify-between gap-4 p-6 hover:border-[var(--accent)]/40 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-lg font-bold text-[var(--fg)]">{c.pair}</span>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">{c.useCase}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-400">
                  {c.status}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-4">
                <div>
                  <span className="text-2xl font-bold text-[var(--fg)]">{c.rate}</span>
                  <span className="ml-2 text-xs font-medium text-emerald-400">{c.change}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[var(--fg-muted)] block">Latency: {c.latency}</span>
                  <span className="text-xs text-amber-400 font-medium">SLA: {c.sla}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-4 mb-10 text-center items-center">
          <Badge>Protocol Mechanics</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
            How FoX Streaming Settlement Operates
          </h2>
          <p className="max-w-xl text-sm text-[var(--fg-muted)]">
            Designed from first principles for autonomous agents that cannot afford to overpay for bad data.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ARCHITECTURE_STEPS.map((s) => (
            <Card key={s.step} className="flex flex-col gap-3 p-6 relative overflow-hidden">
              <span className="text-3xl font-black text-amber-500/30">{s.step}</span>
              <h3 className="text-base font-semibold text-[var(--fg)]">{s.title}</h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="mx-auto max-w-5xl px-6">
        <Card className="p-8">
          <div className="flex flex-col gap-2 mb-6">
            <h3 className="text-xl font-bold text-[var(--fg)]">
              Traditional APIs vs. FoX SLA-Gated Streaming
            </h3>
            <p className="text-sm text-[var(--fg-muted)]">
              Why autonomous agents fail under traditional billing models and thrive with FoX.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                  <th className="py-3 px-2 font-medium">Dimension</th>
                  <th className="py-3 px-2 font-medium text-red-400/80">Traditional REST Feed</th>
                  <th className="py-3 px-2 font-medium text-[var(--accent)]">FoX Streaming Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-[var(--surface-raised)]/30 transition">
                    <td className="py-3.5 px-2 font-medium text-[var(--fg)]">{row.feature}</td>
                    <td className="py-3.5 px-2 text-[var(--fg-muted)]">{row.traditional}</td>
                    <td className="py-3.5 px-2 text-amber-300 font-medium">{row.fox}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Code Snippet Section */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="flex flex-col gap-4">
            <Badge className="w-fit">Developer Experience</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
              Integrate into any AI Agent in minutes
            </h2>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              Standard Viem and Ethers integrations. Agents sign discrete settlement windows using
              deterministic hashes, verified on Celo with ERC-8021 calldata attribution tags.
            </p>
            <div className="flex gap-3 pt-2">
              <Link href="/signup">
                <Button variant="primary">Get API Credentials</Button>
              </Link>
              <Link href="/signin">
                <Button variant="secondary">Agent Portal</Button>
              </Link>
            </div>
          </div>

          <Card className="p-5 font-mono text-xs overflow-x-auto bg-[#060911] border-[var(--border)]">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[var(--border)] text-[var(--fg-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2">agent-stream.ts</span>
            </div>
            <pre className="text-gray-300 leading-relaxed">
              <code>{`// 1. Subscribe to SLA-gated feed
const stream = await fox.subscribe({
  corridor: "CELO/cNGN",
  maxLatencyMs: 800,
  ratePerSecond: 0.001
});

// 2. Stream ticks & audit SLA locally
stream.on("tick", ({ rate, latencyMs }) => {
  if (latencyMs > 800) meter.recordBreach();
  else meter.recordHealthy();
});

// 3. Buyer signs verifiable window
const signature = await buyerAccount.signMessage({
  message: { raw: windowHash }
});

// 4. Seller settles on Celo via FoX.sol
await sellerClient.writeContract({
  address: FOX_CONTRACT_ADDRESS,
  abi: meterAbi,
  functionName: "settle",
  args: [buyer, start, end, healthySecs, signature]
});`}</code>
            </pre>
          </Card>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="mx-auto max-w-5xl px-6">
        <Card className="relative overflow-hidden p-10 text-center bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface)] border-[var(--accent)]/30">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--fg)]">
              Ready to stream trustworthy FX rates to your agents?
            </h2>
            <p className="max-w-xl text-sm text-[var(--fg-muted)]">
              Experience the SLA-gated meter live in action or register an autonomous agent node to start
              streaming.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link href="/">
                <Button variant="primary" className="h-11 px-6">
                  Open Live Dashboard
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" className="h-11 px-6">
                  Sign Up Your Agent
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
