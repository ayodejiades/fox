// lib/meter-store.ts — the server-side singleton that drives the live dashboard. There is
// no database in this project: state lives in module scope and resets when the dev/prod
// server restarts. That's a deliberate scope cut for the hackathon window (see AGENTS.md),
// not an oversight.
//
// IMPLEMENT the four exports below. Acceptance criteria: tests/meter-store.test.mjs — run
// `pnpm test` and make every case pass (this also requires lib/meter.ts to already be
// implemented, since computeState is used here).
import config from "@/fixtures/meter-config.json" with { type: "json" };
import { computeState, type MeterEvent, type MeterState } from "@/lib/meter";

let events: MeterEvent[] = [{ type: "start", at: Date.now() }];

/** Returns the current MeterState as of `now` (defaults to the real clock). Just calls
 * computeState(events, now, config.ratePerSecond) — this function holds no logic of its own. */
export function getState(now: number = Date.now()): MeterState {
  return computeState(events, now, config.ratePerSecond);
}

/** Appends a "breach" event at `now` — UNLESS the store is already in a breached state, in
 * which case this is a no-op (do not push a second breach event back-to-back). Returns the
 * resulting state (i.e. call getState(now) before returning). */
export function injectBreach(now: number = Date.now()): MeterState {
  const lastEvent = events[events.length - 1];
  if (lastEvent?.type !== "breach") {
    events.push({ type: "breach", at: now });
  }
  return getState(now);
}

/** Appends a "recover" event at `now` — UNLESS the store is not currently breached, in which
 * case this is a no-op. Returns the resulting state. */
export function recoverFeed(now: number = Date.now()): MeterState {
  const lastEvent = events[events.length - 1];
  if (lastEvent?.type === "breach") {
    events.push({ type: "recover", at: now });
  }
  return getState(now);
}

/** Test-only: resets `events` back to a single "start" event at `startAt`. Used by
 * tests/meter-store.test.mjs between cases — do not call this from application code. */
export function resetForTests(startAt: number = Date.now()): void {
  events = [{ type: "start", at: startAt }];
}

export const feedLabel = config.feedLabel;
export const currency = config.currency;
