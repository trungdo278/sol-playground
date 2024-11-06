import {
  createSplashPoolInstructions,
  fetchSplashPool,
} from "@orca-so/whirlpools";
import {
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  compileTransaction,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransaction,
  signTransactionMessageWithSigners,
} from "@solana/web3.js";
import { getWallet } from "./wallet";

const devnetRpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("wss://api.devnet.solana.com")
);
async function createPool() {
  const w = await getWallet();
  const tokenMintOne = address("A2EEvVnPqK3FgwMdJfNFMKERhEKW8abMAGLMNtLwM7Kt");
  const tokenMintTwo = address("DdczgbETo2ExtHgeYgNREEgtHaEpMnUDNdwrcBzXRFuz");
  const { poolAddress, instructions, estInitializationCost } =
    await createSplashPoolInstructions(
      devnetRpc,
      tokenMintOne,
      tokenMintTwo,
      undefined,
      w
    );
  console.log("poolAddress: " + poolAddress);
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

  const poolInfo = await fetchSplashPool(devnetRpc, tokenMintOne, tokenMintTwo);
  console.log("poolInfo: " + poolInfo);
}

createPool().catch(console.error);
