import {
  Connection,
  VersionedTransaction,
  Keypair,
  type Commitment,
  type SignatureStatus,
} from '@solana/web3.js';
import type { TransactionConfirmation } from '../types/index.js';

/**
 * Sign and send a base64-encoded transaction to the Solana network.
 *
 * Deserializes the transaction, signs it with the provided keypair,
 * and sends it to the network.
 *
 * @param connection - Solana RPC connection
 * @param transactionBase64 - Base64-encoded transaction (from DFlow API responses)
 * @param signer - Keypair to sign the transaction with
 * @returns Transaction signature
 *
 * @example
 * ```typescript
 * import { Connection, Keypair } from '@solana/web3.js';
 * import { signAndSendTransaction } from 'dflow-sdk';
 *
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const keypair = Keypair.fromSecretKey(secretKey);
 *
 * const order = await dflow.orders.getOrder({ ... });
 * const signature = await signAndSendTransaction(connection, order.transaction, keypair);
 * console.log(`Transaction sent: ${signature}`);
 * ```
 */
export async function signAndSendTransaction(
  connection: Connection,
  transactionBase64: string,
  signer: Keypair
): Promise<string> {
  const transactionBuffer = Buffer.from(transactionBase64, 'base64');
  const transaction = VersionedTransaction.deserialize(transactionBuffer);

  transaction.sign([signer]);

  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  return signature;
}

/**
 * Wait for a transaction to be confirmed on-chain.
 *
 * Polls the network until the transaction reaches the desired confirmation
 * level or times out.
 *
 * @param connection - Solana RPC connection
 * @param signature - Transaction signature to wait for
 * @param commitment - Desired confirmation level (default: 'confirmed')
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 60000)
 * @returns Confirmation details including slot and status
 * @throws Error if transaction fails or times out
 *
 * @example
 * ```typescript
 * import { waitForConfirmation } from 'dflow-sdk';
 *
 * const confirmation = await waitForConfirmation(connection, signature, 'confirmed');
 * console.log(`Confirmed at slot ${confirmation.slot}`);
 * ```
 */
export async function waitForConfirmation(
  connection: Connection,
  signature: string,
  commitment: Commitment = 'confirmed',
  timeoutMs: number = 60000
): Promise<TransactionConfirmation> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const response = await connection.getSignatureStatus(signature);
    const status: SignatureStatus | null = response.value;

    if (status) {
      if (status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }

      const confirmationStatus = status.confirmationStatus;
      if (
        confirmationStatus === 'finalized' ||
        (commitment === 'confirmed' && confirmationStatus === 'confirmed') ||
        (commitment === 'processed' && confirmationStatus === 'processed')
      ) {
        return {
          signature,
          slot: status.slot,
          confirmationStatus: confirmationStatus ?? 'processed',
          err: status.err,
        };
      }
    }

    await sleep(2000);
  }

  throw new Error(`Transaction confirmation timeout after ${timeoutMs}ms`);
}

/**
 * Sign, send, and wait for confirmation in one call.
 *
 * Convenience function that combines {@link signAndSendTransaction} and
 * {@link waitForConfirmation} into a single operation.
 *
 * @param connection - Solana RPC connection
 * @param transactionBase64 - Base64-encoded transaction (from DFlow API responses)
 * @param signer - Keypair to sign the transaction with
 * @param commitment - Desired confirmation level (default: 'confirmed')
 * @returns Confirmation details including signature, slot, and status
 * @throws Error if transaction fails or times out
 *
 * @example
 * ```typescript
 * import { Connection, Keypair } from '@solana/web3.js';
 * import { DFlowClient, signSendAndConfirm, USDC_MINT } from 'dflow-sdk';
 *
 * const dflow = new DFlowClient();
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const keypair = Keypair.fromSecretKey(secretKey);
 *
 * // Get a swap transaction
 * const swap = await dflow.swap.createSwap({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 *   slippageBps: 50,
 *   userPublicKey: keypair.publicKey.toBase58(),
 * });
 *
 * // Sign, send, and wait for confirmation
 * const result = await signSendAndConfirm(connection, swap.transaction, keypair);
 * console.log(`Transaction confirmed: ${result.signature}`);
 * console.log(`Slot: ${result.slot}`);
 * ```
 */
export async function signSendAndConfirm(
  connection: Connection,
  transactionBase64: string,
  signer: Keypair,
  commitment: Commitment = 'confirmed'
): Promise<TransactionConfirmation> {
  const signature = await signAndSendTransaction(connection, transactionBase64, signer);
  return waitForConfirmation(connection, signature, commitment);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
