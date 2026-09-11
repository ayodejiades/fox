// POST /api/meter/recover-feed — called by the "Recover feed" button
// (data-demo="recover-feed"). Calls lib/meter-store.ts's recoverFeed() and returns the
// resulting state in the same JSON shape as GET /api/meter/state.
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { currency, feedLabel, recoverFeed } from "@/lib/meter-store";

export async function POST() {
  const state = recoverFeed();
  return NextResponse.json({
    ...state,
    feedLabel,
    currency,
    demoMode: isDemoMode(),
  });
}
