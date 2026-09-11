# FoX contract

SLA-gated streaming settlement, v1 (trustless-only) scope: a buyer deposits once, then
authorises payment for a past time window by signing, off-chain, how many of that window's
seconds the feed was healthy. The seller can only be paid for seconds the buyer itself
attested to — nothing is seller-self-reported, so there is no forged-receipt path to guard
against with bonds or an arbiter. The trade-off, stated plainly: a seller has no recourse if
a buyer simply refuses to sign a window it experienced as healthy. That griefing path is the
v1 scope cut; a unilateral seller-claim path with a bonded challenge window (see
[x402-sla-escrow](https://github.com/Demiladepy/x402-sla-escrow) for that fuller design) is
the natural v2, not attempted here.

**Status: done and test-covered.** `src/FoX.sol` (95 lines) and its 10-case acceptance
suite in `test/FoX.t.sol` already pass — this is not a task in `AGENTS.md`'s build plan.
Do not modify this contract without re-running `forge test` and getting all 10 green again.

## Setup (first time only)

```bash
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test
```

`lib/` is gitignored — this repo is not a git-submodule setup, so `forge install` must be
re-run after a fresh clone.

## Files

- `src/FoX.sol` — the contract.
- `test/FoX.t.sol` — acceptance criteria (10 cases): deposit, full-window settlement,
  partial (breach) settlement, balance capping instead of reverting, and five distinct
  revert paths (wrong signer, non-seller caller, replayed window, healthySeconds exceeding
  window length, settling before any deposit, window ending in the future).
- `test/mocks/MockUSD.sol` — an 18-decimal test token standing in for cUSD/cNGN/USA₮.

## How the off-chain half talks to this contract

`scripts/deploy.ts` and `scripts/settle.ts` (repo root, not here) are the verified bridge:
deploy once, then sign and redeem windows exactly the way `lib/meter.ts`'s `computeState`
describes them (a healthy ledger row's `start`/`end`/`durationSeconds` map directly to a
window's `windowStart`/`windowEnd`/`healthySeconds`). Both scripts already run end-to-end
against a local anvil chain — see `AGENTS.md` Phase 4 for the exact commands.
