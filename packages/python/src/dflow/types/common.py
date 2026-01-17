"""Common types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel, Field


class OHLCV(BaseModel):
    """OHLCV data."""

    open: float | None = None
    high: float | None = None
    low: float | None = None
    close: float | None = None
    open_dollars: str | None = Field(default=None, alias="open_dollars")
    high_dollars: str | None = Field(default=None, alias="high_dollars")
    low_dollars: str | None = Field(default=None, alias="low_dollars")
    close_dollars: str | None = Field(default=None, alias="close_dollars")

    model_config = {"populate_by_name": True}


class PriceOHLCV(OHLCV):
    """Extended OHLCV data for price."""

    min: float | None = None
    max: float | None = None
    mean: float | None = None
    mean_dollars: str | None = Field(default=None, alias="mean_dollars")
    previous: float | None = None
    previous_dollars: str | None = Field(default=None, alias="previous_dollars")


class MarketCandlestick(BaseModel):
    """Detailed market candlestick data."""

    end_period_ts: int = Field(alias="end_period_ts")
    open_interest: float = Field(alias="open_interest")
    volume: float
    price: PriceOHLCV
    yes_ask: OHLCV | None = Field(default=None, alias="yes_ask")
    yes_bid: OHLCV | None = Field(default=None, alias="yes_bid")

    model_config = {"populate_by_name": True}


class Candlestick(BaseModel):
    """OHLCV candlestick data point."""

    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float


# Period interval in minutes for candlesticks.
# Valid values: 1 (1 minute), 60 (1 hour), 1440 (1 day)
CandlestickPeriodInterval = Literal[1, 60, 1440]


class CandlestickParams(BaseModel):
    """Parameters for fetching candlestick data."""

    # Start timestamp (Unix timestamp in seconds)
    start_ts: int
    # End timestamp (Unix timestamp in seconds)
    end_ts: int
    # Time period length of each candlestick in minutes (1, 60, or 1440)
    period_interval: CandlestickPeriodInterval


# Sort options for events and markets.
SortField = Literal[
    "volume",
    "volume24h",
    "liquidity",
    "openInterest"
]

# Sort order direction.
SortOrder = Literal["asc", "desc"]
