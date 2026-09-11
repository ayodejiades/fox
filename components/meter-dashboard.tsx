"use client";

// components/meter-dashboard.tsx — the entire demo path lives on this one component.
// Acceptance criteria: docs/DEMO_PATH.md's 6 steps must all work when you run `make dev`,
// open http://localhost:3000, and click through by hand. There is no automated test for
// this file — the demo path IS the test. Every data-demo attribute below is load-bearing:
// docs/demo-path.json's Playwright recorder waits on these exact selectors.
//
// Required behavior:
// 1. On mount, and every 1000ms after, fetch("/api/meter/state") and store the JSON result
//    in state. Use useEffect + setInterval, clear the interval on unmount.
// 2. Render a status element whose data-demo attribute is EXACTLY "meter-running" when
//    state.status === "healthy", and EXACTLY "meter-paused" when state.status === "breached".
//    (Same element, the attribute VALUE toggles — that is what lets docs/demo-path.json's
//    waitFor selectors for both step 2 and step 4 target one place.)
// 3. Render the running total: state.totalCharged formatted as `${totalCharged.toFixed(4)} ${currency}`,
//    using the <Stat> component.
// 4. A button, data-demo="inject-breach", label "Simulate SLA breach", onClick POSTs to
//    /api/meter/inject-breach and updates state from the response.
// 5. A button, data-demo="recover-feed", label "Recover feed", onClick POSTs to
//    /api/meter/recover-feed and updates state from the response.
// 6. Render state.ledger as a <Table>, newest row first. Every row where row.status ===
//    "breached" must carry data-demo="ledger-row-breach" on its <tr> (or row wrapper);
//    healthy rows do not need a data-demo attribute.
//
// Use the existing theme components from components/ui/ (Badge, Stat, Table, Button) —
// see components/dashboard-shell.tsx for the import style already used in this repo.

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import type { LedgerRow } from "@/lib/meter";

interface MeterApiResponse {
  status: "healthy" | "breached";
  totalHealthySeconds: number;
  totalCharged: number;
  ledger: LedgerRow[];
  feedLabel: string;
  currency: string;
  demoMode: boolean;
}

function formatTime(ms: number): string {
  return new Date(ms).toISOString().slice(11, 19);
}

export function MeterDashboard() {
  const [state, setState] = useState<MeterApiResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      try {
        const res = await fetch("/api/meter/state");
        if (res.ok) {
          const data: MeterApiResponse = await res.json();
          if (mounted) setState(data);
        }
      } catch (err) {
        console.error("Failed to fetch meter state", err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleInjectBreach = async () => {
    try {
      const res = await fetch("/api/meter/inject-breach", { method: "POST" });
      if (res.ok) {
        const data: MeterApiResponse = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error("Failed to inject breach", err);
    }
  };

  const handleRecoverFeed = async () => {
    try {
      const res = await fetch("/api/meter/recover-feed", { method: "POST" });
      if (res.ok) {
        const data: MeterApiResponse = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error("Failed to recover feed", err);
    }
  };

  const isBreached = state?.status === "breached";
  const currency = state?.currency ?? "cNGN";
  const totalCharged = state?.totalCharged ?? 0;
  const ledger = state?.ledger ?? [];
  const reversedLedger = [...ledger].reverse();

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--fg)]">
              {state?.feedLabel ?? "CELO/cNGN rate feed"}
            </h2>
            <p className="text-sm text-[var(--fg-muted)]">
              Streaming settlement • Buyer escrow active
            </p>
          </div>
          <div>
            <Badge
              data-demo={isBreached ? "meter-paused" : "meter-running"}
              className={
                isBreached
                  ? "border-amber-500/40 bg-amber-950/30 text-amber-400 font-mono"
                  : "border-emerald-500/40 bg-emerald-950/30 text-emerald-400 font-mono"
              }
            >
              {isBreached ? "[ STATUS: SLA BREACHED / PAUSED ]" : "[ STATUS: HEALTHY / ACCRUING ]"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Stat
            label="Total Streamed"
            value={`${totalCharged.toFixed(4)} ${currency}`}
            hint="Accrues strictly while meeting latency SLA"
          />
          <Stat
            label="Healthy Stream Time"
            value={`${state?.totalHealthySeconds ?? 0}s`}
            hint={isBreached ? "Accrual halted: breach active" : "Real-time whole-second settlement"}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            data-demo="inject-breach"
            variant="secondary"
            showArrow={false}
            onClick={handleInjectBreach}
          >
            Simulate SLA breach
          </Button>
          <Button
            data-demo="recover-feed"
            variant="primary"
            onClick={handleRecoverFeed}
          >
            Recover feed
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--fg)]">
            Settlement Ledger
          </h3>
          <span className="font-mono text-xs text-[var(--fg-muted)]">
            NEWEST SEGMENTS FIRST
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr className="font-mono text-xs uppercase text-[var(--fg-muted)]">
                <TableHead>Status</TableHead>
                <TableHead>Window (UTC)</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Charged</TableHead>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {reversedLedger.length === 0 ? (
                <tr>
                  <TableCell colSpan={4} className="text-center text-[var(--fg-muted)] py-6">
                    Awaiting first segment...
                  </TableCell>
                </tr>
              ) : (
                reversedLedger.map((row, idx) => {
                  const rowBreached = row.status === "breached";
                  return (
                    <tr
                      key={`${row.start}-${row.end}-${idx}`}
                      {...(rowBreached ? { "data-demo": "ledger-row-breach" } : {})}
                      className={
                        rowBreached
                          ? "bg-amber-950/20 text-amber-300 font-medium"
                          : ""
                      }
                    >
                      <TableCell>
                        <Badge
                          className={
                            rowBreached
                              ? "border-amber-500/30 bg-amber-950/40 text-amber-400"
                              : "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                          }
                        >
                          {rowBreached ? "BREACH (0 CHARGE)" : "HEALTHY"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatTime(row.start)} - {formatTime(row.end)}
                      </TableCell>
                      <TableCell>{row.durationSeconds}s</TableCell>
                      <TableCell>
                        {row.charged.toFixed(4)} {currency}
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

