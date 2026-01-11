"""Search API for DFlow SDK."""

from dflow.types import (
    MarketStatus,
    SearchEntityType,
    SearchResult,
    SortField,
    SortOrder,
)
from dflow.utils.http import HttpClient


class SearchAPI:
    """API for searching events and markets.

    Full-text search across events by title or ticker.

    Example:
        >>> dflow = DFlowClient()
        >>> results = dflow.search.search(query="bitcoin")
        >>> print(f"Found {len(results.events)} events")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def search(
        self,
        query: str,
        sort: SortField | None = None,
        order: SortOrder | None = None,
        limit: int | None = None,
        cursor: int | None = None,
        with_nested_markets: bool | None = None,
        with_market_accounts: bool | None = None,
        status: MarketStatus | None = None,
        entity_type: SearchEntityType | None = None,
    ) -> SearchResult:
        """Search for events with nested markets by title or ticker.

        Returns events with nested markets which match the search query.

        Args:
            query: The search query string (required)
            sort: Field to sort by (volume, volume24h, liquidity, openInterest, startDate)
            order: How to order the results (asc, desc)
            limit: How many records to limit the results to
            cursor: Cursor for pagination
            with_nested_markets: Include nested markets in response
            with_market_accounts: Include market account information
            status: Filter by status
            entity_type: Type of entity to search for

        Returns:
            Search results containing matching events

        Example:
            >>> # Basic search
            >>> results = dflow.search.search(query="bitcoin")
            >>>
            >>> # Search with sorting and pagination
            >>> results = dflow.search.search(
            ...     query="election",
            ...     sort="volume",
            ...     order="desc",
            ...     limit=20,
            ... )
            >>>
            >>> # Include nested markets with account info
            >>> results = dflow.search.search(
            ...     query="sports",
            ...     with_nested_markets=True,
            ...     with_market_accounts=True,
            ... )
            >>>
            >>> # Paginate through results
            >>> if results.cursor:
            ...     next_page = dflow.search.search(query="bitcoin", cursor=results.cursor)
        """
        data = self._http.get(
            "/search",
            {
                "q": query,
                "sort": sort,
                "order": order,
                "limit": limit,
                "cursor": cursor,
                "withNestedMarkets": with_nested_markets,
                "withMarketAccounts": with_market_accounts,
                "status": status,
                "entityType": entity_type,
            },
        )
        return SearchResult.model_validate(data)
