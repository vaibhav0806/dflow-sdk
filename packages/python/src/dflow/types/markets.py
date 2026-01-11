"""Market types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel, Field

MarketStatus = Literal[
    "initialized", "active", "inactive", "closed", "determined", "finalized"
]
MarketResult = Literal["yes", "no", ""]
RedemptionStatus = Literal["open", "closed", "pending"]


class MarketAccount(BaseModel):
    """Market account information including mint addresses and redemption status."""

    yes_mint: str = Field(alias="yesMint")
    no_mint: str = Field(alias="noMint")
    market_ledger: str = Field(alias="marketLedger")
    redemption_status: RedemptionStatus = Field(alias="redemptionStatus")
    scalar_outcome_pct: int | None = Field(default=None, alias="scalarOutcomePct")

    model_config = {"populate_by_name": True}


class Market(BaseModel):
    """Prediction market data.

    Represents a single trading instrument within an event.
    """

    ticker: str
    title: str
    subtitle: str
    event_ticker: str = Field(alias="eventTicker")
    status: MarketStatus
    result: MarketResult
    market_type: str = Field(alias="marketType")
    yes_sub_title: str = Field(alias="yesSubTitle")
    no_sub_title: str = Field(alias="noSubTitle")
    can_close_early: bool = Field(alias="canCloseEarly")
    rules_primary: str = Field(alias="rulesPrimary")
    volume: float
    liquidity: float | None = None
    open_interest: float = Field(alias="openInterest")
    open_time: int = Field(alias="openTime")
    close_time: int = Field(alias="closeTime")
    expiration_time: int = Field(alias="expirationTime")
    accounts: dict[str, MarketAccount]

    # Optional fields
    rules_secondary: str | None = Field(default=None, alias="rulesSecondary")
    early_close_condition: str | None = Field(default=None, alias="earlyCloseCondition")
    yes_ask: str | None = Field(default=None, alias="yesAsk")
    yes_bid: str | None = Field(default=None, alias="yesBid")
    no_ask: str | None = Field(default=None, alias="noAsk")
    no_bid: str | None = Field(default=None, alias="noBid")

    model_config = {"populate_by_name": True}

    # Backwards-compatible properties
    @property
    def yes_price(self) -> float | None:
        """Get YES price (uses yes_bid as the price)."""
        if self.yes_bid:
            return float(self.yes_bid)
        return None

    @property
    def no_price(self) -> float | None:
        """Get NO price (uses no_bid as the price)."""
        if self.no_bid:
            return float(self.no_bid)
        return None

    @property
    def rules(self) -> str:
        """Backwards-compatible alias for rules_primary."""
        return self.rules_primary


class MarketsParams(BaseModel):
    """Parameters for fetching markets."""

    # Filter markets by status
    status: MarketStatus | None = None
    # Filter markets that are initialized (have a corresponding market ledger)
    is_initialized: bool | None = Field(default=None, alias="isInitialized")
    # Sort field for results
    sort: str | None = None
    # Filter by specific market tickers (comma-separated)
    tickers: str | None = None
    # Filter markets by event ticker
    event_ticker: str | None = Field(default=None, alias="eventTicker")
    # Filter markets by series ticker
    series_ticker: str | None = Field(default=None, alias="seriesTicker")
    # Filter markets closing before this timestamp
    max_close_ts: int | None = Field(default=None, alias="maxCloseTs")
    # Filter markets closing after this timestamp
    min_close_ts: int | None = Field(default=None, alias="minCloseTs")
    # Pagination cursor
    cursor: int | None = None
    # Limit
    limit: int | None = None

    model_config = {"populate_by_name": True}


class MarketsResponse(BaseModel):
    """Response from markets list endpoint."""

    cursor: int | None = None
    markets: list[Market]


class MarketsBatchParams(BaseModel):
    """Parameters for batch market queries."""

    tickers: list[str] | None = None
    mints: list[str] | None = None


class MarketsBatchResponse(BaseModel):
    """Response from batch markets endpoint."""

    markets: list[Market]
    cursor: int | None = None


class OutcomeMintsParams(BaseModel):
    """Parameters for fetching outcome mints."""

    # Minimum close timestamp (Unix timestamp in seconds).
    # Only markets with close_time >= minCloseTs will be included.
    min_close_ts: int | None = Field(default=None, alias="minCloseTs")

    model_config = {"populate_by_name": True}


class OutcomeMintsResponse(BaseModel):
    """Response from the outcome mints endpoint."""

    mints: list[str]


class FilterOutcomeMintsParams(BaseModel):
    """Parameters for filtering outcome mints."""

    # List of token addresses to filter (max 200)
    addresses: list[str]


class FilterOutcomeMintsResponse(BaseModel):
    """Response from filter outcome mints endpoint."""

    outcome_mints: list[str] = Field(alias="outcomeMints")

    model_config = {"populate_by_name": True}
