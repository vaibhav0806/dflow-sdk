"""Venues API for DFlow SDK."""

from dflow.types import Venue
from dflow.utils.http import HttpClient


class VenuesAPI:
    """API for retrieving trading venue information.

    Venues represent the underlying exchanges or liquidity sources
    where trades are executed.

    Example:
        >>> dflow = DFlowClient()
        >>> venues = dflow.venues.get_venues()
        >>> for venue in venues:
        ...     print(f"{venue.name}: {venue.label}")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_venues(self) -> list[Venue]:
        """Get all available trading venues.

        Returns:
            Array of venue information

        Example:
            >>> venues = dflow.venues.get_venues()
            >>> for venue in venues:
            ...     print(f"{venue.name}: {venue.label}")
        """
        data = self._http.get("/venues")
        return [Venue.model_validate(v) for v in data]
