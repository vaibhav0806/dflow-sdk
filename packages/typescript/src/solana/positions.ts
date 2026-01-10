import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import type { TokenBalance, UserPosition, Market } from '../types/index.js';
import type { MarketsAPI } from '../api/metadata/markets.js';

/**
 * Get all token balances for a wallet.
 *
 * Queries both the standard Token Program and Token-2022 Program to find
 * all token holdings. Returns only tokens with non-zero balances.
 *
 * @param connection - Solana RPC connection
 * @param walletAddress - Wallet public key to query
 * @returns Array of token balances with mint, balance, and decimal info
 *
 * @example
 * ```typescript
 * import { Connection, PublicKey } from '@solana/web3.js';
 * import { getTokenBalances } from 'dflow-sdk';
 *
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const wallet = new PublicKey('...');
 *
 * const balances = await getTokenBalances(connection, wallet);
 * balances.forEach(token => {
 *   console.log(`${token.mint}: ${token.balance} (${token.decimals} decimals)`);
 * });
 * ```
 */
export async function getTokenBalances(
  connection: Connection,
  walletAddress: PublicKey
): Promise<TokenBalance[]> {
  // Query both Token Program and Token-2022 Program
  const [tokenAccounts, token2022Accounts] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_PROGRAM_ID,
    }),
    connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  ]);

  const allAccounts = [...tokenAccounts.value, ...token2022Accounts.value];

  return allAccounts
    .map(({ account }) => {
      const info = account.data.parsed.info;
      return {
        mint: info.mint as string,
        rawBalance: info.tokenAmount.amount as string,
        balance: info.tokenAmount.uiAmount as number,
        decimals: info.tokenAmount.decimals as number,
      };
    })
    .filter((token) => token.balance > 0);
}

/**
 * Get a user's prediction market positions.
 *
 * Finds all prediction market outcome tokens in a wallet and enriches them
 * with market data and position type (YES/NO).
 *
 * @param connection - Solana RPC connection
 * @param walletAddress - Wallet public key to query
 * @param marketsAPI - Markets API instance for looking up market data
 * @returns Array of user positions with market context
 *
 * @example
 * ```typescript
 * import { Connection, PublicKey } from '@solana/web3.js';
 * import { DFlowClient, getUserPositions } from 'dflow-sdk';
 *
 * const dflow = new DFlowClient();
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const wallet = new PublicKey('...');
 *
 * const positions = await getUserPositions(connection, wallet, dflow.markets);
 *
 * positions.forEach(pos => {
 *   console.log(`${pos.position} position: ${pos.balance} tokens`);
 *   if (pos.market) {
 *     console.log(`  Market: ${pos.market.title}`);
 *     console.log(`  Status: ${pos.market.status}`);
 *   }
 * });
 * ```
 */
export async function getUserPositions(
  connection: Connection,
  walletAddress: PublicKey,
  marketsAPI: MarketsAPI
): Promise<UserPosition[]> {
  const tokenBalances = await getTokenBalances(connection, walletAddress);

  if (tokenBalances.length === 0) {
    return [];
  }

  const allMints = tokenBalances.map((t) => t.mint);
  const predictionMints = await marketsAPI.filterOutcomeMints(allMints);

  if (predictionMints.length === 0) {
    return [];
  }

  const outcomeTokens = tokenBalances.filter((t) => predictionMints.includes(t.mint));
  const markets = await marketsAPI.getMarketsBatch({ mints: predictionMints });

  const marketsByMint = new Map<string, Market>();
  markets.forEach((market) => {
    Object.values(market.accounts).forEach((account) => {
      marketsByMint.set(account.yesMint, market);
      marketsByMint.set(account.noMint, market);
      marketsByMint.set(account.marketLedger, market);
    });
  });

  return outcomeTokens.map((token) => {
    const market = marketsByMint.get(token.mint) ?? null;

    if (!market) {
      return {
        mint: token.mint,
        balance: token.balance,
        decimals: token.decimals,
        position: 'UNKNOWN' as const,
        market: null,
      };
    }

    const isYesToken = Object.values(market.accounts).some(
      (account) => account.yesMint === token.mint
    );

    const isNoToken = Object.values(market.accounts).some(
      (account) => account.noMint === token.mint
    );

    return {
      mint: token.mint,
      balance: token.balance,
      decimals: token.decimals,
      position: isYesToken ? 'YES' : isNoToken ? 'NO' : 'UNKNOWN',
      market,
    };
  });
}

/**
 * Check if a position is eligible for redemption.
 *
 * A position is eligible if:
 * - The market is 'determined' or 'finalized'
 * - The redemption window is open
 * - The position is on the winning side (or it's a scalar market)
 *
 * @param market - The market data
 * @param outcomeMint - The mint address of the outcome token to check
 * @returns true if the position can be redeemed
 *
 * @example
 * ```typescript
 * import { isRedemptionEligible } from 'dflow-sdk';
 *
 * const positions = await getUserPositions(connection, wallet, dflow.markets);
 *
 * for (const pos of positions) {
 *   if (pos.market && isRedemptionEligible(pos.market, pos.mint)) {
 *     console.log(`Position ${pos.mint} is redeemable!`);
 *   }
 * }
 * ```
 */
export function isRedemptionEligible(market: Market, outcomeMint: string): boolean {
  if (market.status !== 'determined' && market.status !== 'finalized') {
    return false;
  }

  for (const account of Object.values(market.accounts)) {
    if (account.redemptionStatus !== 'open') {
      continue;
    }

    const isWinningYes = market.result === 'yes' && account.yesMint === outcomeMint;
    const isWinningNo = market.result === 'no' && account.noMint === outcomeMint;
    const isScalarOutcome =
      market.result === '' &&
      account.scalarOutcomePct !== undefined &&
      (account.yesMint === outcomeMint || account.noMint === outcomeMint);

    if (isWinningYes || isWinningNo || isScalarOutcome) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate the payout for a scalar market position.
 *
 * Scalar markets pay out based on where the outcome falls within a range.
 * YES tokens pay the outcome percentage, NO tokens pay the inverse.
 *
 * @param market - The market data
 * @param outcomeMint - The mint address of the outcome token
 * @param amount - The number of tokens held
 * @returns The payout amount in settlement tokens
 *
 * @example
 * ```typescript
 * import { calculateScalarPayout, isRedemptionEligible } from 'dflow-sdk';
 *
 * for (const pos of positions) {
 *   if (pos.market && isRedemptionEligible(pos.market, pos.mint)) {
 *     const payout = calculateScalarPayout(pos.market, pos.mint, pos.balance);
 *     console.log(`Expected payout: ${payout} USDC`);
 *   }
 * }
 * ```
 */
export function calculateScalarPayout(
  market: Market,
  outcomeMint: string,
  amount: number
): number {
  for (const account of Object.values(market.accounts)) {
    if (account.scalarOutcomePct === undefined) continue;

    if (account.yesMint === outcomeMint) {
      return (amount * account.scalarOutcomePct) / 10000;
    }

    if (account.noMint === outcomeMint) {
      return (amount * (10000 - account.scalarOutcomePct)) / 10000;
    }
  }

  return 0;
}
