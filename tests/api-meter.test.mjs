// tests/api-meter.test.mjs — acceptance criteria for the three route handlers under
// app/api/meter/. Route handlers are plain async functions; call them directly, no server
// needed. Must pass after lib/meter.ts, lib/meter-store.ts, and the three routes are done.
import assert from "node:assert/strict";
import { test } from "node:test";

test("GET /api/meter/state returns the expected shape", async () => {
  const { GET } = await import("../app/api/meter/state/route.ts");
  const res = await GET();
  const json = await res.json();

  assert.equal(typeof json.status, "string");
  assert.ok(["healthy", "breached"].includes(json.status));
  assert.equal(typeof json.totalHealthySeconds, "number");
  assert.equal(typeof json.totalCharged, "number");
  assert.ok(Array.isArray(json.ledger));
  assert.equal(typeof json.feedLabel, "string");
  assert.equal(typeof json.currency, "string");
  assert.equal(typeof json.demoMode, "boolean");
});

test("POST /api/meter/inject-breach then /api/meter/recover-feed round-trips status", async () => {
  const { POST: injectBreach } = await import("../app/api/meter/inject-breach/route.ts");
  const { POST: recoverFeed } = await import("../app/api/meter/recover-feed/route.ts");

  const breached = await (await injectBreach()).json();
  assert.equal(breached.status, "breached");

  const recovered = await (await recoverFeed()).json();
  assert.equal(recovered.status, "healthy");
});
