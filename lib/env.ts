// lib/env.ts — zod-validated environment. Fails loudly at boot rather than at demo time.
import { z } from "zod";

const schema = z.object({
  DEMO_MODE: z
    .string()
    .optional()
    .default("0")
    .transform((v) => v === "1" || v.toLowerCase() === "true"),
  DEPLOY_URL: z.string().optional().default("http://localhost:3000"),
});

function loadEnv() {
  const parsed = schema.safeParse({
    DEMO_MODE: process.env.DEMO_MODE,
    DEPLOY_URL: process.env.DEPLOY_URL,
  });
  if (!parsed.success) {
    console.error("lib/env.ts: invalid environment", parsed.error.flatten().fieldErrors);
    throw new Error("invalid environment — see lib/env.ts");
  }
  return parsed.data;
}

export const env = loadEnv();
