"""Live Data API for DFlow SDK."""

from dflow.types import LiveData, LiveDataResponse
from dflow.utils.http import HttpClient


class LiveDataAPI:
    """API for retrieving real-time milestone and progress data.

    Live data provides real-time updates on event milestones and progress
    indicators that can affect market outcomes. These endpoints relay
    data directly from the Kalshi API.

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> # Get live data for specific milestones
        >>> data = dflow.live_data.get_live_data(["milestone1", "milestone2"])
        >>>
        >>> # Get live data for an event
        >>> event_data = dflow.live_data.get_live_data_by_event("BTCD-25DEC0313")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_live_data(self, milestone_ids: list[str]) -> list[LiveData]:
        """Get live data for specific milestones.

        Relays live data from the Kalshi API for one or more milestones.

        Args:
            milestone_ids: Array of milestone identifiers to fetch (max 100)

        Returns:
            Array of live data for the requested milestones

        Example:
            >>> data = dflow.live_data.get_live_data(["milestone-1", "milestone-2"])
            >>> for d in data:
            ...     if d.milestones:
            ...         print(f"{d.milestones[0].name}: {d.milestones[0].value}")
        """
        data = self._http.get("/live_data", {"milestoneIds": milestone_ids})
        response = LiveDataResponse.model_validate(data)
        return response.data

    def get_live_data_by_event(
        self,
        event_ticker: str,
        minimum_start_date: str | None = None,
        category: str | None = None,
        competition: str | None = None,
        source_id: str | None = None,
        type: str | None = None,
    ) -> LiveData:
        """Get live data for an event by its ticker.

        Fetches all live data for an event by automatically looking up all related
        milestones and batching the live data requests. Supports all milestone filtering options.

        Args:
            event_ticker: The event ticker
            minimum_start_date: Minimum start date to filter milestones (RFC3339 format)
            category: Filter by milestone category
            competition: Filter by competition
            source_id: Filter by source ID
            type: Filter by milestone type

        Returns:
            Live data for the event

        Example:
            >>> # Get all live data for an event
            >>> data = dflow.live_data.get_live_data_by_event("BTCD-25DEC0313")
            >>>
            >>> # Filter by category
            >>> sports_data = dflow.live_data.get_live_data_by_event(
            ...     "SPORTS-EVENT",
            ...     category="sports",
            ...     competition="NFL",
            ... )
        """
        data = self._http.get(
            f"/live_data/by-event/{event_ticker}",
            {
                "minimumStartDate": minimum_start_date,
                "category": category,
                "competition": competition,
                "sourceId": source_id,
                "type": type,
            },
        )
        return LiveData.model_validate(data)

    def get_live_data_by_mint(
        self,
        mint_address: str,
        minimum_start_date: str | None = None,
        category: str | None = None,
        competition: str | None = None,
        source_id: str | None = None,
        type: str | None = None,
    ) -> LiveData:
        """Get live data for a market by mint address.

        Looks up the event ticker from a market mint address, then fetches all live data
        for that event. Supports all milestone filtering options.

        Args:
            mint_address: Market mint address (ledger or outcome mint)
            minimum_start_date: Minimum start date to filter milestones (RFC3339 format)
            category: Filter by milestone category
            competition: Filter by competition
            source_id: Filter by source ID
            type: Filter by milestone type

        Returns:
            Live data for the market

        Example:
            >>> data = dflow.live_data.get_live_data_by_mint("EPjFWdd5...")
            >>>
            >>> # With filters
            >>> filtered_data = dflow.live_data.get_live_data_by_mint(
            ...     "EPjFWdd5...",
            ...     type="price",
            ... )
        """
        data = self._http.get(
            f"/live_data/by-mint/{mint_address}",
            {
                "minimumStartDate": minimum_start_date,
                "category": category,
                "competition": competition,
                "sourceId": source_id,
                "type": type,
            },
        )
        return LiveData.model_validate(data)
