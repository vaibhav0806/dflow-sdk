"""Markets API for DFlow SDK."""

from typing import cast

from dflow.types import (
    Candlestick,
    CandlestickParams,
    Market,
    MarketsResponse,
    MarketStatus,
    SortField,
)
from dflow.utils.constants import MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES
from dflow.utils.http import HttpClient


class MarketsAPI:
    """API for querying prediction market data, pricing, and batch operations.

    Markets represent individual trading instruments within events. Each market
    has YES and NO outcome tokens that can be traded. Markets can be binary
    (yes/no) or scalar (range of values).

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> # Get a specific market
        >>> market = dflow.markets.get_market("BTCD-25DEC0313-T92749.99")
        >>>
        >>> # Get active markets
        >>> response = dflow.markets.get_markets(status="active")
        >>>
        >>> # Batch query multiple markets
        >>> markets = dflow.markets.get_markets_batch(tickers=["MARKET-1", "MARKET-2"])
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_market(self, market_id: str) -> Market:
        """Get a single market by its ticker.

        Args:
            market_id: The market ticker (e.g., 'BTCD-25DEC0313-T92749.99')

        Returns:
            Complete market data including prices, accounts, and status

        Example:
            >>> market = dflow.markets.get_market("BTCD-25DEC0313-T92749.99")
            >>> print(f"YES: {market.yes_ask}, NO: {market.no_ask}")
            >>> print(f"Volume: {market.volume}")
        """
        data = self._http.get(f"/market/{market_id}")
        return Market.model_validate(data)

    def get_market_by_mint(self, mint_address: str) -> Market:
        """Get a market by its outcome token mint address.

        Useful when you have a mint address from a wallet or transaction
        and need to look up the associated market.

        Args:
            mint_address: The Solana mint address (ledger or outcome mint)

        Returns:
            The market associated with the mint address

        Example:
            >>> market = dflow.markets.get_market_by_mint("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
        """
        data = self._http.get(f"/market/by-mint/{mint_address}")
        return Market.model_validate(data)

    def get_markets(
        self,
        status: MarketStatus | None = None,
        is_initialized: bool | None = None,
        sort: SortField | None = None,
        tickers: str | None = None,
        event_ticker: str | None = None,
        series_ticker: str | None = None,
        max_close_ts: int | None = None,
        min_close_ts: int | None = None,
        limit: int | None = None,
        cursor: int | None = None,
    ) -> MarketsResponse:
        """List markets with optional filtering.

        Args:
            status: Filter by market status ('active', 'closed', etc.)
            is_initialized: Filter markets that are initialized
            sort: Sort field
            tickers: Filter by specific market tickers (comma-separated)
            event_ticker: Filter markets by event ticker
            series_ticker: Filter markets by series ticker
            max_close_ts: Filter markets closing before this timestamp
            min_close_ts: Filter markets closing after this timestamp
            limit: Maximum number of markets to return
            cursor: Pagination cursor (number of markets to skip)

        Returns:
            Paginated list of markets

        Example:
            >>> # Get all active markets sorted by volume
            >>> response = dflow.markets.get_markets(status="active", sort="volume")
            >>>
            >>> # Get initialized markets only
            >>> response = dflow.markets.get_markets(is_initialized=True)
            >>>
            >>> # Paginate through results
            >>> next_page = dflow.markets.get_markets(cursor=response.cursor)
        """
        data = self._http.get(
            "/markets",
            {
                "status": status,
                "isInitialized": is_initialized,
                "sort": sort,
                "tickers": tickers,
                "eventTicker": event_ticker,
                "seriesTicker": series_ticker,
                "maxCloseTs": max_close_ts,
                "minCloseTs": min_close_ts,
                "limit": limit,
                "cursor": cursor,
            },
        )
        return MarketsResponse.model_validate(data)

    def get_markets_batch(
        self,
        tickers: list[str] | None = None,
        mints: list[str] | None = None,
    ) -> list[Market]:
        """Batch query multiple markets by tickers and/or mint addresses.

        More efficient than multiple individual requests when you need
        data for several markets at once. Results are capped at 100 markets maximum.

        Args:
            tickers: Array of market tickers to fetch
            mints: Array of mint addresses to fetch

        Returns:
            Array of market data

        Raises:
            ValueError: If total items exceed MAX_BATCH_SIZE (100)

        Example:
            >>> markets = dflow.markets.get_markets_batch(
            ...     tickers=["MARKET-1", "MARKET-2", "MARKET-3"],
            ...     mints=["mint-address-1"],
            ... )
        """
        total_items = len(tickers or []) + len(mints or [])
        if total_items > MAX_BATCH_SIZE:
            raise ValueError(f"Batch size exceeds maximum of {MAX_BATCH_SIZE} items")

        data = self._http.post(
            "/markets/batch",
            {"tickers": tickers or [], "mints": mints or []},
        )
        markets_data = data.get("markets", []) if isinstance(data, dict) else data
        return [Market.model_validate(m) for m in markets_data]

    def get_outcome_mints(self, min_close_ts: int | None = None) -> list[str]:
        """Get all outcome token mint addresses.

        Returns a flat list of all yes_mint and no_mint pubkeys from all supported markets.
        Useful for filtering wallet tokens to find prediction market positions.

        Args:
            min_close_ts: Minimum close timestamp (Unix timestamp in seconds).
                         Only markets with close_time >= minCloseTs will be included.

        Returns:
            Array of mint addresses

        Example:
            >>> # Get all outcome mints
            >>> all_mints = dflow.markets.get_outcome_mints()
            >>> print(f"Total outcome tokens: {len(all_mints)}")
            >>>
            >>> # Get outcome mints for markets closing after a specific date
            >>> import time
            >>> future_mints = dflow.markets.get_outcome_mints(
            ...     min_close_ts=int(time.time()),  # Only markets not yet closed
            ... )
        """
        params = {"minCloseTs": min_close_ts} if min_close_ts else None
        data = self._http.get("/outcome_mints", params)
        return cast(list[str], data.get("mints", []))

    def filter_outcome_mints(self, addresses: list[str]) -> list[str]:
        """Filter a list of addresses to find which are outcome token mints.

        Given a list of token addresses (e.g., from a wallet), returns only
        those that are prediction market outcome tokens (yes_mint or no_mint).

        Args:
            addresses: Array of Solana token addresses to check (max 200)

        Returns:
            Array of addresses that are outcome token mints

        Raises:
            ValueError: If addresses exceed MAX_FILTER_ADDRESSES (200)

        Example:
            >>> # Get user's wallet tokens
            >>> wallet_tokens = ["addr1", "addr2", "addr3"]
            >>>
            >>> # Filter to find prediction market tokens
            >>> prediction_tokens = dflow.markets.filter_outcome_mints(wallet_tokens)
        """
        if len(addresses) > MAX_FILTER_ADDRESSES:
            raise ValueError(
                f"Address count exceeds maximum of {MAX_FILTER_ADDRESSES}"
            )

        data = self._http.post("/filter_outcome_mints", {"addresses": addresses})
        return cast(list[str], data.get("outcomeMints", []))

    def get_market_candlesticks(
        self,
        ticker: str,
        params: CandlestickParams,
    ) -> list[Candlestick]:
        """Get OHLCV candlestick data for a market.

        Relays market candlesticks from the Kalshi API. Automatically resolves
        the series_ticker from the market ticker.

        Args:
            ticker: The market ticker
            params: Required candlestick parameters

        Returns:
            Array of candlestick data points

        Example:
            >>> from dflow.types import CandlestickParams
            >>> candles = dflow.markets.get_market_candlesticks(
            ...     "BTCD-25DEC0313-T92749.99",
            ...     CandlestickParams(
            ...         start_ts=1704067200,
            ...         end_ts=1704153600,
            ...         period_interval=60,
            ...     )
            ... )
            >>> for c in candles:
            ...     print(f"{c.timestamp}: O={c.open} H={c.high} L={c.low} C={c.close}")
        """
        data = self._http.get(
            f"/market/{ticker}/candlesticks",
            {
                "startTs": params.start_ts,
                "endTs": params.end_ts,
                "periodInterval": params.period_interval,
            },
        )
        return [Candlestick.model_validate(c) for c in data.get("candlesticks", [])]

    def get_market_candlesticks_by_mint(
        self,
        mint_address: str,
        params: CandlestickParams,
    ) -> list[Candlestick]:
        """Get OHLCV candlestick data for a market by mint address.

        Looks up the market ticker from a mint address, then fetches market candlesticks.
        Automatically resolves the series_ticker.

        Args:
            mint_address: The Solana mint address (ledger or outcome mint)
            params: Required candlestick parameters

        Returns:
            Array of candlestick data points

        Example:
            >>> from dflow.types import CandlestickParams
            >>> candles = dflow.markets.get_market_candlesticks_by_mint(
            ...     "EPjFWdd5...",
            ...     CandlestickParams(
            ...         start_ts=1704067200,
            ...         end_ts=1704153600,
            ...         period_interval=1440,
            ...     )
            ... )
        """
        data = self._http.get(
            f"/market/by-mint/{mint_address}/candlesticks",
            {
                "startTs": params.start_ts,
                "endTs": params.end_ts,
                "periodInterval": params.period_interval,
            },
        )
        return [Candlestick.model_validate(c) for c in data.get("candlesticks", [])]
