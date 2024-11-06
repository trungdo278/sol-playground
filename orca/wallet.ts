import { createKeyPairSignerFromBytes } from "@solana/web3.js";
import { setDefaultFunder, setWhirlpoolsConfig } from "@orca-so/whirlpools";

import fs from "fs";

const keyPairBytes = new Uint8Array(
  JSON.parse(
    fs.readFileSync("/Users/jackson/.config/solana/devnet.json", "utf8")
  )
);

export async function getWallet() {
  const wallet = await createKeyPairSignerFromBytes(keyPairBytes);
  await setWhirlpoolsConfig("solanaDevnet");
  setDefaultFunder(wallet);
  return wallet;
}
