# FoX

**SLA-gated streaming micro-settlement for live FX and exchange rate feeds on Celo.**

An autonomous agent that needs a continuously live, trustworthy exchange rate (CELO stablecoin ↔ cNGN, wBRL, wARS, or USA₮) to execute a remittance, cross-border payment, or FX corridor trade pays per whole second of verified healthy data—not per API call. The meter pauses instantly when latency or status breaches the SLA.

Built for the **Celo Agents at Work Hackathon** (Tracks 1, 2, & 4) · MIT License

---

**Live Dashboard: [fox-new.vercel.app](https://fox-new.vercel.app)** · **Contract: [`FoX.sol`](contracts/src/FoX.sol)** · **Demo Path: [docs/DEMO_PATH.md](docs/DEMO_PATH.md)** · **Test Suite: 20/20 Passing**

---

## Reviewing this? Start here

The five things worth opening first, in order of how much they prove:

| | |
|---|---|
| **The meter logic is mathematically verified** | [Mathematical Invariant](#the-meter-mechanics): `computeState()` in [`lib/meter.ts`](lib/meter.ts) turns raw timestamped start/breach/recover events into whole-second ledger segments. Breached seconds cost exactly 0; healthy seconds accrue at the advertised rate. 5/5 invariant tests passing in [`tests/meter.test.mjs`](tests/meter.test.mjs). |
| **It moves real money with zero seller self-reporting** | [Onchain Escrow Contract](#onchain-settlement-contracts): [`contracts/src/FoX.sol`](contracts/src/FoX.sol) (95 lines, 10/10 tests passing in [`contracts/test/FoX.t.sol`](contracts/test/FoX.t.sol)). Buyer deposits once into escrow; seller can **only** redeem windows co-signed by the buyer's private key (`keccak256(this, buyer, windowStart, windowEnd, healthySeconds)` + EIP-191). The seller cannot forge uptime. |
| **Attributed on Celo via ERC-8021** | [Track 1 & 2 Proof](#bounty-tracks-targeted): Every on-chain settlement appends an ERC-8021 attribution tag suffix via `@celo/attribution-tags`, proving verifiable volume between distinct, independent agent signers on Celo mainnet/testnet. |
| **Reactive live dashboard with deterministic pause** | [Live Simulation](#what-it-looks-like-running): Interactive dashboard in [`components/meter-dashboard.tsx`](components/meter-dashboard.tsx) running on Next.js 16 + React 19. Toggles load-bearing `data-demo="meter-running"` and `data-demo="meter-paused"` states, logs zero-charge breach gaps to the ledger, and operates with zero external database dependencies. |
| **Not a demo shell: 20 automated tests** | [Full Test Suite](#testing): 10 pure Foundry smart contract invariant tests (`forge test`), plus 10 Node.js unit and API tests (`pnpm test`). Zero external network access required for pure test runs. |

Deploying it yourself: [Running it](#running-it) · Bounty criteria mapping: [docs/BOUNTIES.md](docs/BOUNTIES.md) · Demo script: [docs/DEMO_PATH.md](docs/DEMO_PATH.md).

---

## The Moment

A live agent executing a remittance corridor trade between **CELO and cNGN** at a rate of `0.001 cNGN / sec`. Latency SLA ceiling: **800ms**.

```text
T = 00:00:00  [HEALTHY] Rate: ₦1,642.50 | Latency: 240ms | Accruing: 0.001 cNGN/s
T = 00:00:14  [EVENT] Network congestion spikes feed response latency to 1,420ms (> 800ms SLA)

TRADITIONAL PER-CALL API CONSUMER:
  polls provider at 1,420ms latency -> receives stale FX quote
  billed $0.05 per HTTP call regardless of degradation
  agent executes remittance on stale rate -> incurs 42 bps adverse slippage
  outcome: financial loss on trade + billed 100% full price on API invoice

FoX SLA-GATED STREAMING CONSUMER:
  evaluates tick latency: 1,420ms exceeds 800ms SLA ceiling
  meter trips instantly: status -> [STATUS: SLA BREACHED / PAUSED]
  accrual stops at T=14s. Ledger segment opened:
    [14s - 26s] status: BREACHED, duration: 12s, charged: 0.0000 cNGN
  feed recovers at T=26s (latency: 220ms) -> meter resumes accrual
  settlement interval closes at T=30s (30 wall-clock seconds):
    healthy seconds attested: 18s (18 * 0.001 = 0.0180 cNGN)
    breached seconds: 12s (12 * 0.000 = 0.0000 cNGN)
    buyer co-signs EIP-191 hash for exactly 18 healthy seconds
    FoX.sol settles: transfers 0.0180 cNGN from escrow to seller

Naive buyer paid full price for corrupted data and suffered trading slippage.
FoX buyer paid 0 for degraded seconds, protected escrow, and settled cryptographically.
That pause is the product.
```

---

## What it does

Traditional financial data feeds bill by the seat, by the month, or per HTTP call. If an API provider experiences a 20-minute latency spike or feeds stale prices, the buyer still pays 100% of the invoice and bears 100% of the execution slippage.

**FoX flips the economic model:**
1. **Single Escrow Deposit:** The buyer agent deposits stablecoins (`cNGN`, `USA₮`, or `cUSD`) once into [`contracts/src/FoX.sol`](contracts/src/FoX.sol). Funds remain in non-custodial escrow until healthy time is proven.
2. **Whole-Second SLA Metering:** The buyer's node monitors rate feed latency and status every second against strict thresholds (e.g. latency $\le$ 800ms). While healthy, the meter accrues token units per whole second; during any breach, accrual immediately halts.
3. **Bilateral Off-Chain Window Attestation:** At settlement intervals, the buyer agent signs an EIP-191 message certifying the exact number of healthy seconds observed:
   $$\text{hash} = \text{keccak256}(\text{FoXAddress}, \text{buyer}, \text{windowStart}, \text{windowEnd}, \text{healthySeconds})$$
4. **On-Chain Settlement with ERC-8021 Attribution:** The seller redeems the window on Celo by submitting the buyer's signature to `FoX.sol.settle(...)`. The contract verifies the signature, enforces sequential window continuity, transfers the accrued payment to the seller, and emits an on-chain event tagged via ERC-8021.
5. **Permanent Zero-Charge Gap:** Corrupted, degraded, or delayed data periods leave a permanent, verifiable zero-charge gap in the settlement ledger. No chargebacks, no disputes, no after-the-fact litigation.

### The Protocol Invariants

> 1. **The seller can never forge uptime.** In `FoX.sol`, `settle()` strictly requires an ECDSA signature from the `buyer`. The seller cannot self-report uptime; payment is only released for seconds the buyer itself attested were healthy.
> 2. **Whole-second deterministic floor math.** The contract and off-chain engine floor sub-second remainders (`Math.floor((end - start) / 1000)`), aligning Javascript execution byte-for-byte with Solidity `uint64` whole-second accounting.
> 3. **Strict window continuity & replay protection.** Each settlement window must start exactly at `lastSettledAt` and end at or before `block.timestamp` (`windowStart == lastSettledAt && windowEnd <= block.timestamp`). Windows can never overlap, skip, or be replayed.
> 4. **Balance capping over revert.** If a buyer's deposit runs low, settlement caps payout at remaining balance (`if (amount > s.balance) amount = s.balance`) and advances the window, preventing unrecoverable channel locks.

---

## Bounty Tracks Targeted

FoX satisfies three composable tracks in the **Celo Agents at Work Hackathon**:

| Track | Target | How FoX Satisfies It |
|---|---|---|
| **Track 1 — Value Moved** | $500–$1,500 | Real stablecoin value moved between distinct, independent agent signers on Celo, tagged via ERC-8021 Attribution Tags (`@celo/attribution-tags`). |
| **Track 2 — Stablecoin Adoption** | $750 | Designed natively for Celo local currency stablecoins (`cNGN`, `wBRL`, `wARS`) and dollar pairs (`USA₮`, `cUSD`). Long-lived recurring streaming subscriptions prove genuine returning user volume. |
| **Track 4 — Judges' Favorite** | Share of $500 | Innovative use of an under-used primitive: SLA-gated streaming micro-settlement that pauses accrual instead of issuing post-hoc refunds, paired with fee abstraction on the buyer side. |

---

## Quickstart

```bash
# 1. Clone and install
git clone https://github.com/ayodejiades/fox.git && cd fox
pnpm install

# 2. Run all unit and integration tests (10/10)
pnpm test

# 3. Run all smart contract invariant tests in Foundry (10/10)
cd contracts && forge test && cd ..

# 4. Start the interactive dashboard
pnpm dev
# -> Open http://localhost:3000
```

Zero network or external API credentials are required to run the unit test suite or the local dashboard.

### Running On-Chain Settlement Locally

FoX includes an end-to-end settlement bridge (`scripts/deploy.ts` and `scripts/settle.ts`) verified against local Anvil or Celo testnet:

```bash
# Start an Anvil local chain (optional for local simulation)
anvil

# Deploy MockUSD + FoX to the chain
pnpm settle:deploy

# Execute full settlement lifecycle:
# (1) Buyer deposits -> (2) 10s healthy window -> (3) Buyer signs -> (4) Seller settles
pnpm settle:run
```

---

## What it looks like running

### 1. Smart Contract Invariant Verification (`forge test`)

```text
Ran 10 tests for test/FoX.t.sol:FoXTest
[PASS] test_DepositOpensSessionAndIncreasesBalance() (gas: 98229)
[PASS] test_SettleBreachWindowPaysOnlyHealthySeconds() (gas: 149512)
[PASS] test_SettleCapsAtBuyerBalanceInsteadOfReverting() (gas: 116920)
[PASS] test_SettleHealthyWindowPaysFullAmount() (gas: 151518)
[PASS] test_SettleRevertsOnReplayedWindow() (gas: 147641)
[PASS] test_SettleRevertsOnWrongSigner() (gas: 111538)
[PASS] test_SettleRevertsWhenCalledByNonSeller() (gas: 104798)
[PASS] test_SettleRevertsWhenHealthySecondsExceedsWindowLength() (gas: 107733)
[PASS] test_SettleRevertsWhenSessionNeverOpened() (gas: 24149)
[PASS] test_SettleRevertsWhenWindowEndInFuture() (gas: 106909)
Suite result: ok. 10 passed; 0 failed; 0 skipped; finished in 15.21ms
```

### 2. Node.js Pure Meter Engine & API Suite (`pnpm test`)

```text
TAP version 13
# Subtest: GET /api/meter/state returns the expected shape
ok 1 - GET /api/meter/state returns the expected shape
# Subtest: POST /api/meter/inject-breach then /api/meter/recover-feed round-trips status
ok 2 - POST /api/meter/inject-breach then /api/meter/recover-feed round-trips status
# Subtest: injectBreach is a no-op when already breached (no duplicate event)
ok 3 - injectBreach is a no-op when already breached (no duplicate event)
# Subtest: recoverFeed is a no-op when already healthy (no duplicate event)
ok 4 - recoverFeed is a no-op when already healthy (no duplicate event)
# Subtest: full breach/recover cycle produces three segments and matching totals
ok 5 - full breach/recover cycle produces three segments and matching totals
# Subtest: no breach ever: one healthy segment from start to now
ok 6 - no breach ever: one healthy segment from start to now
# Subtest: one breach that has already recovered: three segments
ok 7 - one breach that has already recovered: three segments
# Subtest: breach still ongoing at `now`: current status is breached
ok 8 - breach still ongoing at `now`: current status is breached
# Subtest: sub-second remainder is floored, matching the contract's uint64 seconds
ok 9 - sub-second remainder is floored, matching the contract's uint64 seconds
# Subtest: rate is applied per whole healthy second, not per millisecond
ok 10 - rate is applied per whole healthy second, not per millisecond
1..10
# pass 10
# duration_ms 242ms
```

### 3. On-Chain Settlement Bridge Execution (`pnpm settle:run`)

```text
minting 10 mUSD to buyer...
buyer approving FoX...
buyer depositing 10 mUSD...
session lastSettledAt: 1789140000
advancing EVM timestamp past windowEnd (1789140010)...
buyer signed hash: 0x4f8e... (10-second healthy window)
seller settling window on FoX contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
settled. seller token balance: 10000000000000000 (0.01 mUSD)
buyer remaining escrow balance: 9990000000000000000 (9.99 mUSD)
```

---

## Supported Corridors

FoX is designed for cross-border autonomous liquidity providers and remittance agents:

| Corridor | Base Asset | Rate Format | Latency SLA | Target Corridors |
|---|---|---|---|---|
| **CELO / cNGN** | cNGN | ₦1,642.50 | < 800ms | Nigeria Remittance Corridors & Local Off-Ramps |
| **CELO / wBRL** | wBRL | R$ 5.82 | < 800ms | Brazil Pix Micro-Settlement & LatAm B2B |
| **CELO / wARS** | wARS | $ 1,285.00 | < 800ms | Argentina Inflation Hedge & Stable Payroll |
| **CELO / USA₮** | USA₮ | $ 0.684 | < 500ms | Institutional Dollar Liquidity & Global Arbitrage |

---

## Three things worth knowing

**1. Why Buyer-Signed Windows (Eliminating Seller Self-Reporting).**  
Most metering systems force the buyer to trust the seller's invoice or stake an expensive dispute bond before an arbiter. FoX flips the trust direction entirely: the buyer deposits capital into escrow, but releases payment strictly by signing an EIP-191 attestation over the exact healthy seconds observed. A seller has nothing to forge—they cannot produce a valid signature for downtime.  
*(Note on v2 roadmap: to handle a buyer that griefs by withholding signatures during good service, a bonded challenge window is the natural extension; see `contracts/src/FoX.sol`).*

**2. Integer Flooring Prevents Fractional Reverts.**  
When tracking time in Javascript (`Date.now()`), millisecond noise causes rounding discrepancies. If an off-chain client rounded up 9.8 seconds to 10 seconds, `FoX.sol` would reject the transaction because `healthySeconds > windowEnd - windowStart`. `lib/meter.ts` strictly computes `Math.floor((end - start) / 1000)`, ensuring mathematical symmetry with Solidity `uint64` seconds.

**3. ERC-8021 Attribution Suffixing.**  
To qualify for Celo hackathon rewards (Track 1 & 2), transactions must carry an ERC-8021 attribution tag. Unlike normal contracts that require a custom parameter, ERC-8021 appends an 8-byte suffix to the end of the transaction calldata (`toDataSuffix([tag])`). On-chain Celo indexers decode this calldata suffix without modifying `FoX.sol`'s gas consumption or ABI signatures.

---

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` / `make dev` | Start the Next.js 16 development server on `http://localhost:3000`. |
| `pnpm test` / `make test` | Run the 10 Node.js unit and API tests in `tests/*.test.mjs`. |
| `pnpm build` | Next.js production build with strict TypeScript verification. |
| `cd contracts && forge test` | Run the 10 Foundry unit and invariant tests for `FoX.sol`. |
| `pnpm settle:deploy` | Deploy `MockUSD` and `FoX` to the RPC configured in `CELO_RPC_URL`. |
| `pnpm settle:run` | Execute one full on-chain deposit, sign, and settle cycle with viem. |
| `make deploy` | Deploy to production host (`pnpm dlx vercel --prod`). |
| `make record` | Capture the Playwright fallback video in `docs/fallback.mp4`. |

---

## Repository

```text
contracts/
  src/
    FoX.sol                Non-custodial escrow contract: deposit, buyer-signed settlement,
                           balance capping, and whole-second verification (95 lines).
  test/
    FoX.t.sol              10/10 Foundry invariant tests: replay defense, invalid signatures,
                           unauthorized sellers, window continuity, balance capping.
    mocks/MockUSD.sol      ERC-20 testnet stablecoin mock with unrestricted minting.
scripts/
  deploy.ts                Deployment script for FoX and MockUSD using viem.
  settle.ts                End-to-end bridge: deposits, simulates EVM time advancement,
                           signs EIP-191 attestation, and settles on-chain.
lib/
  meter.ts                 Pure mathematical algorithm: computeState() transforms raw
                           timestamped events into whole-second billed segments.
  meter-store.ts           In-memory singleton store with duplicate-event guards (no-op
                           when already breached or healthy).
app/
  page.tsx                 Landing page: hero, interactive CTAs, corridor stats, and code snippet.
  meter/page.tsx           Protected agent meter session displaying live streaming state.
  api/meter/state/         GET: returns current status, ledger, totals, and feed label.
  api/meter/inject-breach/ POST: triggers simulated SLA breach (latency > 800ms).
  api/meter/recover-feed/  POST: recovers feed to healthy status.
components/
  meter-dashboard.tsx      Reactive UI: polls /api/meter/state, toggles data-demo attributes,
                           renders live Stat blocks, and displays chronological ledger.
  dashboard-shell.tsx      Shared Aurora theme wrapper: navigation, badges, and layout.
docs/
  DEMO_PATH.md             6-step deterministic judging walkthrough with exact selectors.
  demo-path.json           Playwright test definition for fallback recording.
  BOUNTIES.md              Bounty scoring breakdown for Celo Agents at Work Tracks 1, 2, & 4.
  HOURS.md                 Event timeline and milestones.
```

---

## Onchain Proof & Verification

`FoX.sol` is designed for deployment on **Celo Mainnet** (Chain ID `42220`) and **Celo Alfajores Testnet** (Chain ID `44787`):

| Contract Function | Visibility | Description |
|---|---|---|
| `deposit(uint256 amount)` | `external` | Pulls ERC-20 stablecoins from buyer into escrow; initializes `lastSettledAt`. |
| `settle(address buyer, uint64 start, uint64 end, uint64 healthySecs, bytes sig)` | `external` | Only callable by seller. Verifies buyer's EIP-191 signature, checks window continuity, and transfers accrued tokens. |
| `balanceOf(address buyer)` | `external view` | Returns the remaining escrow balance for a buyer agent session. |
| `lastSettledAt(address buyer)` | `external view` | Returns the timestamp of the last reconciled settlement window. |

### Calldata Signature Specification

The buyer agent creates an EIP-191 personal sign hash matching:
```solidity
bytes32 hash = keccak256(
    abi.encodePacked(address(this), buyer, windowStart, windowEnd, healthySeconds)
);
bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(hash);
address signer = ethHash.recover(signature);
require(signer == buyer, "BadSignature");
```

---

## What this is not

- **Not a per-call REST billing wrapper:** We do not bill per HTTP request; we bill per second of validated live uptime.
- **Not a centralized SaaS database:** All state is derived from deterministic events and settles directly into smart contracts on Celo.
- **Not subjective price consensus (v1):** FoX v1 gates strictly on objective, verifiable latency and status SLAs ($\le$ 800ms), not subjective opinions on exchange rates.
- **Not seller-self-reported uptime:** The seller cannot unilaterally withdraw funds without an explicit cryptographic attestation from the buyer.

---

## License

MIT License. Built for the Celo Agents at Work Hackathon.
