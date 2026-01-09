import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import type { TokenBalance, UserPosition, Market } from '../types/index.js';
import type { MarketsAPI } from '../api/metadata/markets.js';

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
