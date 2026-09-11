// lib/meter.ts — pure SLA-gated meter logic, no I/O. This is what both the live dashboard
// simulation (lib/meter-store.ts) and the on-chain settlement bridge (scripts/settle.ts)
// compute from, so the number a judge sees on screen is the same number that gets signed
// and settled on-chain.
//
// IMPLEMENT computeState() below. Its acceptance criteria are tests/meter.test.mjs — run
// `pnpm test` and make every case pass. Do not edit the test file to make it pass.
export type MeterEvent = { type: "start" | "breach" | "recover"; at: number }; // at = ms epoch

export type LedgerRow = {
  start: number;
  end: number;
  status: "healthy" | "breached";
  durationSeconds: number;
  charged: number;
};

export type MeterState = {
  status: "healthy" | "breached";
  totalHealthySeconds: number;
  totalCharged: number;
  ledger: LedgerRow[];
};

/**
 * Turn a list of start/breach/recover events into a segment-by-segment ledger plus totals.
 *
 * Precondition (the caller, lib/meter-store.ts, guarantees this — do not add validation
 * for malformed input): `events` is non-empty, the first event has type "start", and the
 * events after it strictly alternate breach/recover (never two breaches in a row, never a
 * recover before any breach), with strictly increasing `at` values.
 *
 * Algorithm:
 * 1. Walk `events` pairwise: each event[i] opens a segment that runs until event[i+1].at,
 *    or until `now` for the last event.
 * 2. A segment's status is "breached" if events[i].type === "breach", else "healthy".
 * 3. durationSeconds = Math.floor((segmentEnd - segmentStart) / 1000) — always floor,
 *    matching the on-chain contract's uint64 whole-second accounting.
 * 4. charged = durationSeconds * ratePerSecond for a healthy segment, 0 for a breached one.
 * 5. totalHealthySeconds / totalCharged are the sums of the healthy segments only.
 * 6. The returned top-level `status` is "breached" if the LAST event in `events` has type
 *    "breach" (i.e. no recover has happened yet), else "healthy".
 */
export function computeState(events: MeterEvent[], now: number, ratePerSecond: number): MeterState {
  const ledger: LedgerRow[] = [];
  let totalHealthySeconds = 0;

  for (let i = 0; i < events.length; i++) {
    const start = events[i].at;
    const end = i + 1 < events.length ? events[i + 1].at : now;
    const isBreached = events[i].type === "breach";
    const status: "healthy" | "breached" = isBreached ? "breached" : "healthy";
    const durationSeconds = Math.floor((end - start) / 1000);
    const charged = isBreached ? 0 : durationSeconds * ratePerSecond;

    if (!isBreached) {
      totalHealthySeconds += durationSeconds;
    }

    ledger.push({
      start,
      end,
      status,
      durationSeconds,
      charged,
    });
  }

  const lastEvent = events[events.length - 1];
  const status: "healthy" | "breached" = lastEvent.type === "breach" ? "breached" : "healthy";
  const totalCharged = totalHealthySeconds * ratePerSecond;

  return {
    status,
    totalHealthySeconds,
    totalCharged,
    ledger,
  };
}
