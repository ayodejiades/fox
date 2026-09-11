"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<"consumer" | "provider">("consumer");
  const [agentName, setAgentName] = useState("");
  const [email, setEmail] = useState("");
  const [corridor, setCorridor] = useState("CELO/cNGN");
  const [escrowAddress, setEscrowAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCreated(true);
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="flex flex-col gap-6 p-8 border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-col gap-2 text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-contrast)] font-mono font-bold text-sm">
              FoX
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--fg)] mt-1">
              Create Agent Account
            </h1>
            <p className="text-xs text-[var(--fg-muted)]">
              Register an autonomous agent or data provider to begin SLA-gated FX settlement on Celo.
            </p>
          </div>

          {!created ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Role Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  Participant Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("consumer")}
                    className={`rounded-[var(--radius-sm)] border p-3 text-left transition ${
                      role === "consumer"
                        ? "border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--fg)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:bg-[var(--surface-raised)]"
                    }`}
                  >
                    <span className="block text-xs font-semibold">FX Consumer Agent</span>
                    <span className="block text-[11px] text-[var(--fg-muted)] mt-0.5">
                      Buyer: streams micro-payments for rate feeds
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("provider")}
                    className={`rounded-[var(--radius-sm)] border p-3 text-left transition ${
                      role === "provider"
                        ? "border-[var(--accent)] bg-[var(--surface-raised)] text-[var(--fg)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:bg-[var(--surface-raised)]"
                    }`}
                  >
                    <span className="block text-xs font-semibold">Feed Provider Node</span>
                    <span className="block text-[11px] text-[var(--fg-muted)] mt-0.5">
                      Seller: serves feeds & redeems settlements
                    </span>
                  </button>
                </div>
              </div>

              {/* Agent Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  Agent Node / Org Name
                </label>
                <Input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. AfriPay-Remittance-Bot-01"
                  className="w-full font-mono text-xs"
                />
              </div>

              {/* Developer Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  Developer / Operator Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@remitcorp.xyz"
                  className="w-full font-mono text-xs"
                />
              </div>

              {/* Target Corridor */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  Primary FX Corridor
                </label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-mono text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="CELO/cNGN">CELO / cNGN (Nigerian Naira - 0.001/s)</option>
                  <option value="CELO/wBRL">CELO / wBRL (Brazilian Real - 0.002/s)</option>
                  <option value="CELO/wARS">CELO / wARS (Argentine Peso - 0.0015/s)</option>
                  <option value="CELO/USA₮">CELO / USA₮ (Tether USD - 0.0005/s)</option>
                </select>
              </div>

              {/* Escrow Address */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                  Celo Wallet Address (Escrow Signer)
                </label>
                <Input
                  type="text"
                  value={escrowAddress}
                  onChange={(e) => setEscrowAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full font-mono text-xs"
                />
                <span className="font-mono text-[10px] text-[var(--fg-muted)]">
                  Must hold signer keys for signing FoX.sol [windowStart, windowEnd, healthySeconds]
                </span>
              </div>

              {/* SLA Agreement */}
              <label className="flex items-start gap-2.5 text-xs text-[var(--fg-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  defaultChecked
                  className="mt-0.5 rounded-[2px] border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] focus:ring-0"
                />
                <span>
                  I agree to the FoX SLA standard: 800ms maximum latency threshold with zero accrual
                  during breach segments.
                </span>
              </label>

              <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
                {loading ? "Registering Node on Celo..." : "Complete Agent Registration"}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-6 text-center py-4">
              <div className="mx-auto inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-emerald-500/40 bg-emerald-950/30 px-3 py-1 font-mono text-xs text-emerald-400">
                [OK] NODE REGISTERED ON-CHAIN
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-[var(--fg)]">Agent Node Provisioned</h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Your node credentials have been generated and linked to corridor {corridor}.
                </p>
              </div>

              <div className="rounded-[var(--radius-sm)] bg-[#06080d] p-4 text-left font-mono text-xs border border-[var(--border)] space-y-2">
                <div>
                  <span className="text-[var(--fg-muted)] block text-[10px]">AGENT ID</span>
                  <span className="text-emerald-400 font-semibold">{agentName || "agent_node_default"}</span>
                </div>
                <div>
                  <span className="text-[var(--fg-muted)] block text-[10px]">SIGNER PUBLIC KEY</span>
                  <span className="text-amber-300 font-mono text-xs">0x59c6995e998f97a5a0044966f0945389dc9e86da</span>
                </div>
                <div>
                  <span className="text-[var(--fg-muted)] block text-[10px]">ESCROW CONTRACT</span>
                  <span className="text-gray-300">0x217d8383B0E892f3D37c5f87b8E9...</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="primary" onClick={() => router.push("/meter")} className="w-full">
                  Launch Live Meter Dashboard
                </Button>
                <Link href="/signin">
                  <Button variant="ghost" showArrow={false} className="w-full text-xs">
                    Go to Agent Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-[var(--fg-muted)] pt-2 border-t border-[var(--border)]">
            Already registered?{" "}
            <Link href="/signin" className="font-medium text-[var(--accent)] hover:underline">
              Sign in to your console
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs text-[var(--fg-muted)]">
          <Link href="/" className="hover:text-[var(--fg)] underline">
            &larr; Return to Live Meter Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
