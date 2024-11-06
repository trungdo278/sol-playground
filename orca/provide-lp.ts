import {
  fetchSplashPool,
  openFullRangePositionInstructions,
} from "@orca-so/whirlpools";
import { address, appendTransactionMessageInstructions, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, devnet, getSignatureFromTransaction, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/web3.js";
import { getWallet } from "./wallet";

const devnetRpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("wss://api.devnet.solana.com")
);
async function createPool() {
  const w = await getWallet();
  const tokenMintOne = address("A2EEvVnPqK3FgwMdJfNFMKERhEKW8abMAGLMNtLwM7Kt");
  const tokenMintTwo = address("DdczgbETo2ExtHgeYgNREEgtHaEpMnUDNdwrcBzXRFuz");
  const poolInfo = await fetchSplashPool(devnetRpc, tokenMintOne, tokenMintTwo);
  const { instructions, quote, initializationCost } =
    await openFullRangePositionInstructions(
      devnetRpc,
      poolInfo.address,
      {
        liquidity: BigInt(1_000000000),
        tokenA: BigInt(1_000000000),
        tokenB: BigInt(1_000000000),
      },
      undefined,
      w
    );

  const latestBlock = await devnetRpc.getLatestBlockhash().send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(w.address, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlock.value, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx)
  );

  const signedTransaction = await signTransactionMessageWithSigners(
    transactionMessage
  );
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc: devnetRpc,
    rpcSubscriptions,
  });

  try {
    await sendAndConfirmTransaction(signedTransaction, {
      commitment: "confirmed",
      skipPreflight: true,
    });
    const signature = getSignatureFromTransaction(signedTransaction);
    console.log("✅ - Transfer transaction:", signature);
  } catch (e) {
    console.error("Transfer failed:", e);
  }
}

createPool().catch(console.error);
