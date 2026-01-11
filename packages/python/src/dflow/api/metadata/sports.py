"""Sports API for DFlow SDK."""

from dflow.types import FiltersBySportsResponse
from dflow.utils.http import HttpClient


class SportsAPI:
    """API for retrieving sports-specific filters.

    Get available filters for sports-related prediction markets,
    including scopes and competitions for each sport.

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> response = dflow.sports.get_filters_by_sports()
        >>> for sport in response.sport_ordering:
        ...     filters = response.filters_by_sports.get(sport)
        ...     if filters:
        ...         print(f"{sport}: {filters.competitions}")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_filters_by_sports(self) -> FiltersBySportsResponse:
        """Get all available sports filters.

        Returns filtering options available for each sport, including scopes and competitions.

        Returns:
            Sports filters organized by sport with ordering

        Example:
            >>> response = dflow.sports.get_filters_by_sports()
            >>>
            >>> # Iterate in order
            >>> for sport in response.sport_ordering:
            ...     filters = response.filters_by_sports.get(sport)
            ...     if filters:
            ...         print(f"{sport}:")
            ...         print(f"  Competitions: {filters.competitions}")
            ...         print(f"  Scopes: {filters.scopes}")
        """
        data = self._http.get("/filters_by_sports")
        return FiltersBySportsResponse.model_validate(data)
