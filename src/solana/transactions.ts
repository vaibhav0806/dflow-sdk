import {
  Connection,
  VersionedTransaction,
  Keypair,
  type Commitment,
  type SignatureStatus,
} from '@solana/web3.js';
import type { TransactionConfirmation } from '../types/index.js';

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
