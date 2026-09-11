// scripts/deploy.ts — deploys MockUSD + FoX to whatever chain CELO_RPC_URL points at
// (defaults to local anvil) and prints the addresses to put in .env.
//
// Usage: pnpm settle:deploy
// Requires: `cd contracts && forge build` has already run (reads contracts/out/*.json).
import { readFileSync } from "node:fs";
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.CELO_RPC_URL ?? "http://127.0.0.1:8545";
// Anvil's well-known default account #0 — ONLY safe to hardcode because this is the local
// dev-chain default. Real deploys must set SELLER_PRIVATE_KEY / etc. in .env instead.
const DEV_DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const RATE_PER_SECOND = parseUnits("0.001", 18); // must match fixtures/meter-config.json's ratePerSecond

function loadArtifact(path: string) {
  const json = JSON.parse(readFileSync(path, "utf-8"));
  return { abi: json.abi, bytecode: json.bytecode.object as `0x${string}` };
}

async function main() {
  const deployerKey = (process.env.SELLER_PRIVATE_KEY as `0x${string}`) || DEV_DEPLOYER_KEY;
  const account = privateKeyToAccount(deployerKey);

  const publicClient = createPublicClient({ transport: http(RPC_URL) });
  const walletClient = createWalletClient({ account, transport: http(RPC_URL) });

  const mockUsd = loadArtifact("contracts/out/MockUSD.sol/MockUSD.json");
  const fox = loadArtifact("contracts/out/FoX.sol/FoX.json");

  console.log("deploying MockUSD...");
  const tokenHash = await walletClient.deployContract({ abi: mockUsd.abi, bytecode: mockUsd.bytecode, args: [] });
  const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenHash });
  const tokenAddress = tokenReceipt.contractAddress!;
  console.log("MockUSD:", tokenAddress);

  console.log("deploying FoX...");
  const meterHash = await walletClient.deployContract({
    abi: fox.abi,
    bytecode: fox.bytecode,
    args: [tokenAddress, account.address, RATE_PER_SECOND],
  });
  const meterReceipt = await publicClient.waitForTransactionReceipt({ hash: meterHash });
  const meterAddress = meterReceipt.contractAddress!;
  console.log("FoX:", meterAddress);
  console.log("seller (also deployer in this dev flow):", account.address);

  console.log("\nAdd these to .env:");
  console.log(`FOX_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`FOX_CONTRACT_ADDRESS=${meterAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
