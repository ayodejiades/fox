// GET /api/meter/state — polled by the dashboard every second. Must return the shape:
// { status, totalHealthySeconds, totalCharged, ledger, feedLabel, currency, demoMode }
// where the first four fields come straight from lib/meter-store.ts's getState(), and
// feedLabel/currency are the re-exported constants from the same module.
//
// Acceptance criteria: tests/api-meter.test.mjs — implement this after lib/meter-store.ts
// is done and its own tests pass.
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { currency, feedLabel, getState } from "@/lib/meter-store";

export async function GET() {
  const state = getState();
  return NextResponse.json({
    ...state,
    feedLabel,
    currency,
    demoMode: isDemoMode(),
  });
}
