"""Event types for DFlow SDK."""

from pydantic import BaseModel, Field

from .markets import Market, MarketStatus


class SettlementSource(BaseModel):
    """Settlement source information for an event."""

    name: str
    url: str


class Event(BaseModel):
    """Prediction event data."""

    ticker: str
    title: str
    subtitle: str
    series_ticker: str = Field(alias="seriesTicker")

    # Optional fields from API
    competition: str | None = None
    competition_scope: str | None = Field(default=None, alias="competitionScope")
    image_url: str | None = Field(default=None, alias="imageUrl")
    liquidity: float | None = None
    markets: list[Market] | None = None
    open_interest: float | None = Field(default=None, alias="openInterest")
    settlement_sources: list[SettlementSource] | None = Field(
        default=None, alias="settlementSources"
    )
    strike_date: int | None = Field(default=None, alias="strikeDate")
    strike_period: str | None = Field(default=None, alias="strikePeriod")
    mutually_exclusive: bool | None = Field(default=None, alias="mutuallyExclusive")
    volume: float | None = None
    volume_24h: float | None = Field(default=None, alias="volume24h")

    model_config = {"populate_by_name": True}


class EventsParams(BaseModel):
    """Parameters for fetching events."""

    # Filter events by market status
    status: MarketStatus | None = None
    # Filter by series tickers (comma-separated list, max 25)
    series_tickers: str | None = Field(default=None, alias="seriesTickers")
    # Include nested markets in response
    with_nested_markets: bool | None = Field(default=None, alias="withNestedMarkets")
    # Filter events that are initialized (have a corresponding market ledger)
    is_initialized: bool | None = Field(default=None, alias="isInitialized")
    # Sort field for results
    sort: str | None = None
    # Pagination cursor
    cursor: int | None = None
    # Limit
    limit: int | None = None

    model_config = {"populate_by_name": True}


class EventsResponse(BaseModel):
    """Response from events list endpoint."""

    cursor: int | None = None
    events: list[Event]


class ForecastHistoryParams(BaseModel):
    """Parameters for fetching forecast percentile history."""

    # Comma-separated list of percentile values (0-10000, max 10 values)
    percentiles: str
    # Start timestamp for the range (Unix timestamp in seconds)
    start_ts: int = Field(alias="startTs")
    # End timestamp for the range (Unix timestamp in seconds)
    end_ts: int = Field(alias="endTs")
    # Period interval in minutes (0, 1, 60, or 1440)
    period_interval: int = Field(alias="periodInterval")

    model_config = {"populate_by_name": True}


class ForecastHistoryPoint(BaseModel):
    """Single point in forecast history."""

    timestamp: int
    yes_price: float = Field(alias="yesPrice")
    no_price: float = Field(alias="noPrice")
    percentile: float | None = None

    model_config = {"populate_by_name": True}


class ForecastHistory(BaseModel):
    """Forecast history data for an event.

    Note: This endpoint relays the response directly from the Kalshi API.
    """

    event_ticker: str = Field(alias="eventTicker")
    history: list[ForecastHistoryPoint]

    model_config = {"populate_by_name": True}
