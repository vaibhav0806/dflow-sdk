"""Market types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel, Field

MarketStatus = Literal[
    "initialized", "active", "inactive", "closed", "determined", "finalized"
]
MarketResult = Literal["yes", "no", ""]
RedemptionStatus = Literal["open", "closed"]


class MarketAccount(BaseModel):
    """Market account information for a specific settlement token."""

    yes_mint: str = Field(alias="yesMint")
    no_mint: str = Field(alias="noMint")
    market_ledger: str = Field(alias="marketLedger")
    redemption_status: RedemptionStatus = Field(alias="redemptionStatus")
    scalar_outcome_pct: int | None = Field(default=None, alias="scalarOutcomePct")

    model_config = {"populate_by_name": True}


class Market(BaseModel):
    """Prediction market data."""

    ticker: str
    title: str
    subtitle: str | None = None
    event_ticker: str = Field(alias="eventTicker")
    status: MarketStatus
    result: MarketResult
    yes_price: float | None = Field(default=None, alias="yesPrice")
    no_price: float | None = Field(default=None, alias="noPrice")
    volume: float | None = None
    volume_24h: float | None = Field(default=None, alias="volume24h")
    open_interest: float | None = Field(default=None, alias="openInterest")
    liquidity: float | None = None
    open_time: str | None = Field(default=None, alias="openTime")
    close_time: str | None = Field(default=None, alias="closeTime")
    expiration_time: str | None = Field(default=None, alias="expirationTime")
    accounts: dict[str, MarketAccount]
    rules: str | None = None

    model_config = {"populate_by_name": True}


class MarketsResponse(BaseModel):
    """Response from markets list endpoint."""

    cursor: str | None = None
    markets: list[Market]


class MarketsBatchParams(BaseModel):
    """Parameters for batch market queries."""

    tickers: list[str] | None = None
    mints: list[str] | None = None


class MarketsBatchResponse(BaseModel):
    """Response from batch markets endpoint."""

    markets: list[Market]


class FilterOutcomeMintsParams(BaseModel):
    """Parameters for filtering outcome mints."""

    addresses: list[str]


class FilterOutcomeMintsResponse(BaseModel):
    """Response from filter outcome mints endpoint."""

    outcome_mints: list[str] = Field(alias="outcomeMints")

    model_config = {"populate_by_name": True}
