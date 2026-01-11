"""Common types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel


class PaginationParams(BaseModel):
    """Parameters for paginated API requests."""

    cursor: int | None = None
    limit: int | None = None


class PaginatedResponse(BaseModel):
    """Base class for paginated responses."""

    cursor: int | None = None


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
    "volume_24h",
    "liquidity",
    "open_interest",
    "start_date",
    "score",
]

# Sort order direction.
SortOrder = Literal["asc", "desc"]
