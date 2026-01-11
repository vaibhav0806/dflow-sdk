"""Trades API for DFlow SDK."""

from dflow.types import TradesResponse
from dflow.utils.http import HttpClient


class TradesAPI:
    """API for retrieving historical trade data.

    Access past trades for markets to analyze trading activity and price history.
    Relays requests directly to Kalshi API.

    Example:
        >>> dflow = DFlowClient()
        >>> response = dflow.trades.get_trades(ticker="BTCD-25DEC0313-T92749.99", limit=100)
        >>> for trade in response.trades:
        ...     print(f"{trade.taker_side} {trade.count} @ {trade.price}")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_trades(
        self,
        ticker: str | None = None,
        min_ts: int | None = None,
        max_ts: int | None = None,
        limit: int | None = None,
        cursor: str | None = None,
    ) -> TradesResponse:
        """Get historical trades with optional filtering.

        Returns a paginated list of all trades. Can be filtered by market ticker
        and timestamp range.

        Args:
            ticker: Filter by market ticker
            min_ts: Filter trades after this Unix timestamp
            max_ts: Filter trades before this Unix timestamp
            limit: Maximum number of trades to return (1-1000, default 100)
            cursor: Pagination cursor (trade ID) to start from

        Returns:
            Paginated list of trades

        Example:
            >>> # Get recent trades for a market
            >>> response = dflow.trades.get_trades(
            ...     ticker="BTCD-25DEC0313-T92749.99",
            ...     limit=100,
            ... )
            >>>
            >>> # Filter by timestamp range
            >>> response = dflow.trades.get_trades(
            ...     min_ts=1704067200,  # Jan 1, 2024
            ...     max_ts=1704153600,  # Jan 2, 2024
            ... )
            >>>
            >>> # Paginate through results
            >>> next_page = dflow.trades.get_trades(cursor=response.cursor)
        """
        data = self._http.get(
            "/trades",
            {
                "ticker": ticker,
                "minTs": min_ts,
                "maxTs": max_ts,
                "limit": limit,
                "cursor": cursor,
            },
        )
        return TradesResponse.model_validate(data)

    def get_trades_by_mint(
        self,
        mint_address: str,
        min_ts: int | None = None,
        max_ts: int | None = None,
        limit: int | None = None,
        cursor: str | None = None,
    ) -> TradesResponse:
        """Get trades for a market by mint address.

        Looks up the market ticker from a mint address, then fetches trades from Kalshi.
        Returns a paginated list of trades. Can be filtered by timestamp range.

        Args:
            mint_address: Mint address (ledger or outcome mint)
            min_ts: Filter trades after this Unix timestamp
            max_ts: Filter trades before this Unix timestamp
            limit: Maximum number of trades to return (1-1000, default 100)
            cursor: Pagination cursor (trade ID) to start from

        Returns:
            Paginated list of trades

        Example:
            >>> response = dflow.trades.get_trades_by_mint("EPjFWdd5...", limit=50)
            >>>
            >>> # Filter by timestamp
            >>> import time
            >>> response = dflow.trades.get_trades_by_mint(
            ...     "EPjFWdd5...",
            ...     min_ts=int(time.time()) - 86400,  # Last 24 hours
            ... )
        """
        data = self._http.get(
            f"/trades/by-mint/{mint_address}",
            {
                "minTs": min_ts,
                "maxTs": max_ts,
                "limit": limit,
                "cursor": cursor,
            },
        )
        return TradesResponse.model_validate(data)
