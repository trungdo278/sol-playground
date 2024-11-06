import fs from "fs";
import { Keypair } from "@solana/web3.js";

const keyPairBytes = new Uint8Array(
  JSON.parse(
    fs.readFileSync("/Users/jackson/.config/solana/devnet.json", "utf8")
  )
);

export const WALLET = Keypair.fromSecretKey(keyPairBytes);
