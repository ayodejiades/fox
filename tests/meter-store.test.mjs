// tests/meter-store.test.mjs — acceptance criteria for lib/meter-store.ts. Every case here
// must pass (`pnpm test`) before that file is considered complete.
import assert from "node:assert/strict";
import { test } from "node:test";

test("injectBreach is a no-op when already breached (no duplicate event)", async () => {
  const store = await import("../lib/meter-store.ts");
  store.resetForTests(0);

  store.injectBreach(5_000);
  const afterFirstInject = store.getState(6_000);
  assert.equal(afterFirstInject.status, "breached");
  assert.equal(afterFirstInject.ledger.length, 2, "start segment + breach segment");

  store.injectBreach(7_000); // already breached — must not add a second breach event
  const afterSecondInject = store.getState(8_000);
  assert.equal(afterSecondInject.ledger.length, 2, "still only 2 segments, not 3");
  assert.equal(afterSecondInject.ledger[1].end, 8_000, "the single breach segment just runs longer");
});

test("recoverFeed is a no-op when already healthy (no duplicate event)", async () => {
  const store = await import("../lib/meter-store.ts");
  store.resetForTests(0);

  store.recoverFeed(3_000); // never breached — must be a no-op
  const state = store.getState(5_000);
  assert.equal(state.status, "healthy");
  assert.equal(state.ledger.length, 1, "no recover segment was inserted");
});

test("full breach/recover cycle produces three segments and matching totals", async () => {
  const store = await import("../lib/meter-store.ts");
  store.resetForTests(0);

  store.injectBreach(5_000);
  store.recoverFeed(8_000);
  const state = store.getState(12_000);

  assert.equal(state.status, "healthy");
  assert.equal(state.ledger.length, 3);
  assert.equal(state.ledger[1].status, "breached");
  assert.equal(state.totalHealthySeconds, 9);
});
