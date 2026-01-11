"""Search types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel, Field

from .events import Event
from .markets import MarketStatus

# Entity type for search results.
SearchEntityType = Literal["events", "markets", "series"]


class SearchParams(BaseModel):
    """Parameters for searching events."""

    # The query string to search for (required)
    query: str
    # Field to sort by
    sort: str | None = None
    # How to order the results
    order: Literal["asc", "desc"] | None = None
    # How many records to limit the results to
    limit: int | None = None
    # Cursor for pagination
    cursor: int | None = None
    # Include nested markets in response
    with_nested_markets: bool | None = Field(default=None, alias="withNestedMarkets")
    # Include market account information (settlement mints and redemption status)
    with_market_accounts: bool | None = Field(default=None, alias="withMarketAccounts")
    # Filter by status
    status: MarketStatus | None = None
    # Type of entity to search for
    entity_type: SearchEntityType | None = Field(default=None, alias="entityType")

    model_config = {"populate_by_name": True}


class SearchResult(BaseModel):
    """Response from the search endpoint."""

    # Pagination cursor for next page
    cursor: int
    # Array of events matching the search query
    events: list[Event]
