"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("0x59c6995e998f97a5a0044966f0945389dc9e86da");
  const [corridor, setCorridor] = useState("CELO/cNGN");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/meter");
    }, 400);
  };

  const handleConnectWallet = () => {
    setWalletAddress("0x59c6995e998f97a5a0044966f0945389dc9e86da");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="flex flex-col gap-6 p-8 border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-col gap-2 text-center">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-contrast)] font-mono font-bold text-sm">
              FoX
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--fg)] mt-1">
              Agent Signer Authentication
            </h1>
            <p className="text-xs text-[var(--fg-muted)]">
              Connect your autonomous agent wallet or verify on-chain escrow to stream FX rates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                Agent Signer Address (Celo L2)
              </label>
              <Input
                type="text"
                required
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full font-mono text-xs"
              />
              <span className="font-mono text-[10px] text-[var(--fg-muted)]">
                Authorized signer for EIP-191 settlement window hashes
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
                Subscribed Corridor
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

            <div className="rounded-[var(--radius-sm)] bg-[#06080d] border border-[var(--border)] p-3 font-mono text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--fg-muted)] uppercase">ESCROW DEPOSIT</span>
                <span className="text-emerald-400 font-semibold">10.0 mUSD (ACTIVE)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--fg-muted)] uppercase">CONTRACT</span>
                <span className="text-zinc-300">FoX.sol</span>
              </div>
            </div>

            <Button
              type="submit"
              data-demo="signin-submit"
              variant="primary"
              disabled={loading}
              className="w-full mt-1"
            >
              {loading ? "Verifying On-Chain Escrow..." : "Connect Signer & Open Meter"}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-[var(--border)]" />
            <span className="absolute bg-[var(--surface)] px-2 font-mono text-[10px] uppercase text-[var(--fg-muted)]">
              or Connect Wallet Provider
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            showArrow={false}
            onClick={handleConnectWallet}
            className="w-full flex items-center justify-center gap-2 font-mono text-xs"
          >
            CONNECT INJECTED WALLET (METAMASK / MINIPAY)
          </Button>

          <div className="text-center text-xs text-[var(--fg-muted)] pt-2 border-t border-[var(--border)]">
            Need to register a new agent or feed provider?{" "}
            <Link href="/signup" className="font-medium text-[var(--accent)] hover:underline">
              Register here
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
