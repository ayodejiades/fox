// scripts/settle.ts — the real bridge between the simulated dashboard and an actual
// on-chain settlement. Runs one full cycle against a deployed FoX contract: mints the
// buyer some MockUSD (skip this against a real stablecoin), deposits, signs a 10-second
// healthy window exactly the way lib/meter.ts's computeState would describe one, and has
// the seller redeem it.
//
// Usage: pnpm settle:run
// Requires FOX_CONTRACT_ADDRESS and FOX_TOKEN_ADDRESS in .env (see scripts/deploy.ts).
import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, encodePacked, http, keccak256, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.CELO_RPC_URL ?? "http://127.0.0.1:8545";
const DEV_SELLER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // anvil account #0
const DEV_BUYER_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // anvil account #1

function loadAbi(path: string) {
  return JSON.parse(readFileSync(path, "utf-8")).abi;
}

async function main() {
  const tokenAddress = process.env.FOX_TOKEN_ADDRESS as `0x${string}`;
  const meterAddress = process.env.FOX_CONTRACT_ADDRESS as `0x${string}`;
  if (!tokenAddress || !meterAddress) throw new Error("set FOX_TOKEN_ADDRESS and FOX_CONTRACT_ADDRESS — run scripts/deploy.ts first");

  const sellerAccount = privateKeyToAccount((process.env.SELLER_PRIVATE_KEY as `0x${string}`) || DEV_SELLER_KEY);
  const buyerAccount = privateKeyToAccount((process.env.BUYER_PRIVATE_KEY as `0x${string}`) || DEV_BUYER_KEY);

  const publicClient = createPublicClient({ transport: http(RPC_URL) });
  const sellerClient = createWalletClient({ account: sellerAccount, transport: http(RPC_URL) });
  const buyerClient = createWalletClient({ account: buyerAccount, transport: http(RPC_URL) });

  const tokenAbi = loadAbi("contracts/out/MockUSD.sol/MockUSD.json");
  const meterAbi = loadAbi("contracts/out/FoX.sol/FoX.json");

  // 1. fund and deposit (skip mint against a real stablecoin — the buyer would already hold funds)
  console.log("minting 10 mUSD to buyer...");
  await publicClient.waitForTransactionReceipt({
    hash: await buyerClient.writeContract({ address: tokenAddress, abi: tokenAbi, functionName: "mint", args: [buyerAccount.address, parseUnits("10", 18)] }),
  });
  console.log("buyer approving FoX...");
  await publicClient.waitForTransactionReceipt({
    hash: await buyerClient.writeContract({ address: tokenAddress, abi: tokenAbi, functionName: "approve", args: [meterAddress, parseUnits("10", 18)] }),
  });
  console.log("buyer depositing 10 mUSD...");
  await publicClient.waitForTransactionReceipt({
    hash: await buyerClient.writeContract({ address: meterAddress, abi: meterAbi, functionName: "deposit", args: [parseUnits("10", 18)] }),
  });

  // 2. describe a 10-second healthy window starting at the session's lastSettledAt
  const windowStart = (await publicClient.readContract({ address: meterAddress, abi: meterAbi, functionName: "lastSettledAt", args: [buyerAccount.address] })) as bigint;
  const windowEnd = windowStart + 10n;
  const healthySeconds = 10n;

  // advance the chain's clock past windowEnd so the contract's `windowEnd > block.timestamp` check passes
  await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "evm_increaseTime", params: [11] }),
  });
  await fetch(RPC_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "evm_mine", params: [] }) });

  // 3. buyer signs — MUST match the contract's keccak256(abi.encodePacked(address(this), buyer, windowStart, windowEnd, healthySeconds))
  const hash = keccak256(
    encodePacked(
      ["address", "address", "uint64", "uint64", "uint64"],
      [meterAddress, buyerAccount.address, windowStart, windowEnd, healthySeconds],
    ),
  );
  // viem's signMessage({ message: { raw } }) applies the "\x19Ethereum Signed Message:\n32"
  // prefix itself — this is the exact counterpart of Solidity's MessageHashUtils.toEthSignedMessageHash.
  const signature = await buyerAccount.signMessage({ message: { raw: hash } });

  // 4. seller redeems
  console.log("seller settling window...");
  const settleHash = await sellerClient.writeContract({
    address: meterAddress,
    abi: meterAbi,
    functionName: "settle",
    args: [buyerAccount.address, windowStart, windowEnd, healthySeconds, signature],
  });
  await publicClient.waitForTransactionReceipt({ hash: settleHash });

  const sellerBalance = await publicClient.readContract({ address: tokenAddress, abi: tokenAbi, functionName: "balanceOf", args: [sellerAccount.address] });
  const buyerRemaining = await publicClient.readContract({ address: meterAddress, abi: meterAbi, functionName: "balanceOf", args: [buyerAccount.address] });
  console.log("settled. seller token balance:", sellerBalance, "buyer remaining escrow balance:", buyerRemaining);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
