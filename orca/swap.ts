import { swapInstructions } from "@orca-so/whirlpools";
import {
  address,
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/web3.js";
import { getWallet } from "./wallet";

const devnetRpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("wss://api.devnet.solana.com")
);
async function swap() {
  const tokenMintOne = address("A2EEvVnPqK3FgwMdJfNFMKERhEKW8abMAGLMNtLwM7Kt");
  const tokenMintTwo = address("DdczgbETo2ExtHgeYgNREEgtHaEpMnUDNdwrcBzXRFuz");
  const w = await getWallet();
  const poolAddress = address("2tVHc41SLEJHYpEfXuA8x8RWcRpdESqn4PkFmhd8iJPk");
  const { instructions, quote } = await swapInstructions(
    devnetRpc,
    {
      inputAmount: BigInt(100_000_0000),
      mint: tokenMintTwo, // swap token 2 -> token 1
    },
    poolAddress,
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

swap().catch(console.error);
