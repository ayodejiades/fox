// tests/meter.test.mjs — acceptance criteria for lib/meter.ts's computeState().
// This is the definition of done for that file. Every case here must pass (`pnpm test`)
// before lib/meter.ts is considered complete. Do not edit these expected values to make a
// case pass — fix computeState() instead.
import assert from "node:assert/strict";
import { test } from "node:test";

test("no breach ever: one healthy segment from start to now", async () => {
  const { computeState } = await import("../lib/meter.ts");
  const events = [{ type: "start", at: 0 }];
  const state = computeState(events, 10_000, 1);

  assert.equal(state.status, "healthy");
  assert.equal(state.totalHealthySeconds, 10);
  assert.equal(state.totalCharged, 10);
  assert.equal(state.ledger.length, 1);
  assert.equal(state.ledger[0].status, "healthy");
  assert.equal(state.ledger[0].start, 0);
  assert.equal(state.ledger[0].end, 10_000);
  assert.equal(state.ledger[0].durationSeconds, 10);
  assert.equal(state.ledger[0].charged, 10);
});

test("one breach that has already recovered: three segments", async () => {
  const { computeState } = await import("../lib/meter.ts");
  const events = [
    { type: "start", at: 0 },
    { type: "breach", at: 5_000 },
    { type: "recover", at: 8_000 },
  ];
  const state = computeState(events, 12_000, 2);

  assert.equal(state.status, "healthy", "last event was recover, so current status is healthy");
  assert.equal(state.ledger.length, 3);

  assert.deepEqual(
    state.ledger.map((r) => [r.status, r.start, r.end, r.durationSeconds, r.charged]),
    [
      ["healthy", 0, 5_000, 5, 10],
      ["breached", 5_000, 8_000, 3, 0],
      ["healthy", 8_000, 12_000, 4, 8],
    ],
  );

  assert.equal(state.totalHealthySeconds, 9, "5 + 4, the breached segment contributes 0");
  assert.equal(state.totalCharged, 18);
});

test("breach still ongoing at `now`: current status is breached", async () => {
  const { computeState } = await import("../lib/meter.ts");
  const events = [
    { type: "start", at: 0 },
    { type: "breach", at: 4_000 },
  ];
  const state = computeState(events, 6_000, 1);

  assert.equal(state.status, "breached");
  assert.equal(state.ledger.length, 2);
  assert.equal(state.ledger[1].status, "breached");
  assert.equal(state.ledger[1].durationSeconds, 2);
  assert.equal(state.ledger[1].charged, 0);
  assert.equal(state.totalHealthySeconds, 4);
  assert.equal(state.totalCharged, 4);
});

test("sub-second remainder is floored, matching the contract's uint64 seconds", async () => {
  const { computeState } = await import("../lib/meter.ts");
  const events = [{ type: "start", at: 0 }];
  const state = computeState(events, 4_999, 1);

  assert.equal(state.ledger[0].durationSeconds, 4, "4999ms floors to 4 whole seconds");
  assert.equal(state.totalHealthySeconds, 4);
});

test("rate is applied per whole healthy second, not per millisecond", async () => {
  const { computeState } = await import("../lib/meter.ts");
  const events = [{ type: "start", at: 0 }];
  const state = computeState(events, 3_000, 0.001);

  assert.equal(state.totalCharged, 0.003);
});
