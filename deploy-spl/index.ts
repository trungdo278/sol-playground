import {
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { WALLET } from "./wallet";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function deployToken() {
  const w = WALLET;

  const mint = await createMint(
    connection,
    w,
    w.publicKey,
    w.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  );
  console.log("mint: " + mint.toBase58());

  const mintInfo = await getMint(connection, mint);

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    w,
    mint,
    w.publicKey
  );

  console.log("tokenAccount: " + tokenAccount.address.toBase58());

  const tokenAccountInfo = await getAccount(connection, tokenAccount.address);

  console.log(tokenAccountInfo.amount);

  await mintTo(
    connection,
    w,
    mint,
    tokenAccount.address,
    w,
    100_000000000 // because decimals for the mint are set to 9
  );
}

deployToken().catch(console.error);
