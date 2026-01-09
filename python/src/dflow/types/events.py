"""Event types for DFlow SDK."""

from pydantic import BaseModel, Field

from .markets import Market


class Event(BaseModel):
    """Prediction event data."""

    ticker: str
    title: str
    subtitle: str | None = None
    series_ticker: str = Field(alias="seriesTicker")
    category: str | None = None
    mutually_exclusive: bool | None = Field(default=None, alias="mutuallyExclusive")
    markets: list[Market] | None = None

    model_config = {"populate_by_name": True}


class EventsResponse(BaseModel):
    """Response from events list endpoint."""

    cursor: str | None = None
    events: list[Event]


class ForecastHistoryPoint(BaseModel):
    """Single point in forecast history."""

    timestamp: int
    yes_price: float = Field(alias="yesPrice")
    no_price: float = Field(alias="noPrice")
    percentile: float | None = None

    model_config = {"populate_by_name": True}


class ForecastHistory(BaseModel):
    """Forecast history data for an event."""

    event_ticker: str = Field(alias="eventTicker")
    history: list[ForecastHistoryPoint]

    model_config = {"populate_by_name": True}
