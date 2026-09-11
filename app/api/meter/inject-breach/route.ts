// POST /api/meter/inject-breach — called by the "Simulate SLA breach" button
// (data-demo="inject-breach"). Calls lib/meter-store.ts's injectBreach() and returns the
// resulting state in the same JSON shape as GET /api/meter/state.
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { currency, feedLabel, injectBreach } from "@/lib/meter-store";

export async function POST() {
  const state = injectBreach();
  return NextResponse.json({
    ...state,
    feedLabel,
    currency,
    demoMode: isDemoMode(),
  });
}
