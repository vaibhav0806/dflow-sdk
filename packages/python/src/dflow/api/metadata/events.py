"""Events API for DFlow SDK."""

from dflow.types import (
    Candlestick,
    CandlestickParams,
    Event,
    EventsResponse,
    ForecastHistory,
    ForecastHistoryParams,
    MarketCandlestick,
    MarketStatus,
    SortField,
)
from dflow.utils.http import HttpClient


class EventsAPI:
    """API for discovering and querying prediction market events.

    Events are the top-level containers for prediction markets. Each event
    represents a question or outcome to predict (e.g., "Will Bitcoin exceed $100k?")
    and contains one or more markets for trading.

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> # Get active events
        >>> response = dflow.events.get_events(status="active")
        >>>
        >>> # Get a specific event with its markets
        >>> event = dflow.events.get_event("event-id", with_nested_markets=True)
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_event(self, event_id: str, with_nested_markets: bool = False) -> Event:
        """Get a single event by its ID.

        Args:
            event_id: The unique identifier of the event (event ticker)
            with_nested_markets: If True, includes all markets within the event

        Returns:
            The event data, optionally with nested markets

        Example:
            >>> # Get event without markets
            >>> event = dflow.events.get_event("BTCD-25DEC0313")
            >>>
            >>> # Get event with all its markets
            >>> event = dflow.events.get_event("BTCD-25DEC0313", with_nested_markets=True)
            >>> print(event.markets)
        """
        data = self._http.get(
            f"/event/{event_id}",
            {"withNestedMarkets": with_nested_markets} if with_nested_markets else None,
        )
        return Event.model_validate(data)

    def get_events(
        self,
        status: MarketStatus | None = None,
        series_tickers: str | None = None,
        with_nested_markets: bool | None = None,
        is_initialized: bool | None = None,
        sort: SortField | None = None,
        limit: int | None = None,
        cursor: int | None = None,
    ) -> EventsResponse:
        """List events with optional filtering.

        Args:
            status: Filter by event status ('active', 'closed', etc.)
            series_tickers: Filter by series tickers (comma-separated, max 25)
            with_nested_markets: If True, includes markets within each event
            is_initialized: Filter events that are initialized
            sort: Sort field (volume, volume24h, liquidity, openInterest)
            limit: Maximum number of events to return
            cursor: Pagination cursor (number of events to skip)

        Returns:
            Paginated list of events

        Example:
            >>> # Get all active events sorted by volume
            >>> response = dflow.events.get_events(status="active", sort="volume")
            >>>
            >>> # Get events for specific series
            >>> response = dflow.events.get_events(series_tickers="KXBTC,KXETH", limit=50)
            >>>
            >>> # Get initialized events only
            >>> response = dflow.events.get_events(is_initialized=True)
            >>>
            >>> # Paginate through results
            >>> next_page = dflow.events.get_events(cursor=response.cursor)
        """
        data = self._http.get(
            "/events",
            {
                "status": status,
                "seriesTickers": series_tickers,
                "withNestedMarkets": with_nested_markets,
                "isInitialized": is_initialized,
                "sort": sort,
                "limit": limit,
                "cursor": cursor,
            },
        )
        return EventsResponse.model_validate(data)

    def get_event_forecast_history(
        self,
        series_ticker: str,
        event_id: str,
        params: ForecastHistoryParams,
    ) -> ForecastHistory:
        """Get forecast percentile history for an event.

        Returns historical raw and formatted forecast numbers for an event at specific percentiles.
        This endpoint relays the response directly from the Kalshi API.

        Args:
            series_ticker: The series ticker (e.g., 'KXBTC')
            event_id: The event identifier within the series
            params: Required parameters for the forecast query

        Returns:
            Forecast history with percentile data points

        Example:
            >>> from dflow.types import ForecastHistoryParams
            >>> history = dflow.events.get_event_forecast_history(
            ...     "KXBTC",
            ...     "event-123",
            ...     ForecastHistoryParams(
            ...         percentiles="2500,5000,7500",  # 25th, 50th, 75th percentiles
            ...         start_ts=1704067200,
            ...         end_ts=1704153600,
            ...         period_interval=60,
            ...     )
            ... )
        """
        data = self._http.get(
            f"/event/{series_ticker}/{event_id}/forecast_percentile_history",
            {
                "percentiles": params.percentiles,
                "startTs": params.start_ts,
                "endTs": params.end_ts,
                "periodInterval": params.period_interval,
            },
        )
        return ForecastHistory.model_validate(data)

    def get_event_forecast_by_mint(
        self,
        mint_address: str,
        params: ForecastHistoryParams,
    ) -> ForecastHistory:
        """Get forecast percentile history for an event by its mint address.

        Looks up the event from a market mint address and returns historical forecast data.
        This endpoint relays the response directly from the Kalshi API.

        Args:
            mint_address: Any mint address associated with the market (ledger or outcome mint)
            params: Required parameters for the forecast query

        Returns:
            Forecast history with percentile data points

        Example:
            >>> from dflow.types import ForecastHistoryParams
            >>> history = dflow.events.get_event_forecast_by_mint(
            ...     "EPjFWdd5...",
            ...     ForecastHistoryParams(
            ...         percentiles="5000",  # 50th percentile (median)
            ...         start_ts=1704067200,
            ...         end_ts=1704153600,
            ...         period_interval=1440,
            ...     )
            ... )
        """
        data = self._http.get(
            f"/event/by-mint/{mint_address}/forecast_percentile_history",
            {
                "percentiles": params.percentiles,
                "startTs": params.start_ts,
                "endTs": params.end_ts,
                "periodInterval": params.period_interval,
            },
        )
        return ForecastHistory.model_validate(data)

    def get_event_candlesticks(
        self,
        ticker: str,
        params: CandlestickParams,
    ) -> dict[str, list[MarketCandlestick]]:
        """Get OHLCV candlestick data for all markets in an event.

        Relays event candlesticks from the Kalshi API. Automatically resolves
        the series_ticker from the event ticker.

        Returns a dictionary mapping market tickers to their candlestick data.

        Args:
            ticker: The event ticker
            params: Required candlestick parameters

        Returns:
            Dictionary of candlestick data by market ticker

        Example:
            >>> from dflow.types import CandlestickParams
            >>> market_candles = dflow.events.get_event_candlesticks(
            ...     "KXFEDDECISION-26JAN",
            ...     CandlestickParams(
            ...         start_ts=1704067200,
            ...         end_ts=1704153600,
            ...         period_interval=60,
            ...     )
            ... )
            >>> for market_ticker, candles in market_candles.items():
            ...     print(f"Market: {market_ticker}")
            ...     for c in candles:
            ...         print(f"  Close: {c.price.close}")
        """
        data = self._http.get(
            f"/event/{ticker}/candlesticks",
            {
                "startTs": params.start_ts,
                "endTs": params.end_ts,
                "periodInterval": params.period_interval,
            },
        )

        result: dict[str, list[MarketCandlestick]] = {}
        market_tickers = data.get("market_tickers", [])
        market_candlesticks = data.get("market_candlesticks", [])

        if market_tickers and market_candlesticks:
            for index, market_ticker in enumerate(market_tickers):
                if index < len(market_candlesticks):
                    candles_data = market_candlesticks[index]
                    if candles_data:
                        result[market_ticker] = [
                            MarketCandlestick.model_validate(c) for c in candles_data
                        ]

        return result
