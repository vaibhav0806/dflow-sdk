"""Live Data API for DFlow SDK."""

from dflow.types import LiveData
from dflow.utils.http import HttpClient


class LiveDataAPI:
    """API for retrieving real-time milestone and progress data.

    Live data provides real-time updates on event milestones and progress
    indicators that can affect market outcomes.

    Example:
        >>> dflow = DFlowClient()
        >>> data = dflow.live_data.get_live_data(["btc-price", "eth-price"])
        >>> for d in data:
        ...     print(f"{d.milestones}")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_live_data(self, milestones: list[str]) -> list[LiveData]:
        """Get live data for specific milestones.

        Args:
            milestones: Array of milestone identifiers to fetch

        Returns:
            Array of live data for the requested milestones

        Example:
            >>> data = dflow.live_data.get_live_data(["btc-price", "eth-price"])
            >>> for d in data:
            ...     for m in d.milestones:
            ...         print(f"{m.name}: {m.value}")
        """
        data = self._http.get("/live_data", {"milestones": ",".join(milestones)})
        return [LiveData.model_validate(d) for d in data.get("data", [])]

    def get_live_data_by_event(self, event_ticker: str) -> LiveData:
        """Get live data for an event by its ticker.

        Args:
            event_ticker: The event ticker

        Returns:
            Live data for the event

        Example:
            >>> data = dflow.live_data.get_live_data_by_event("BTCD-25DEC0313")
            >>> print(f"Milestones: {data.milestones}")
        """
        data = self._http.get(f"/live_data/by-event/{event_ticker}")
        return LiveData.model_validate(data)

    def get_live_data_by_mint(self, mint_address: str) -> LiveData:
        """Get live data for a market by mint address.

        Args:
            mint_address: The Solana mint address of the market's outcome token

        Returns:
            Live data for the market
        """
        data = self._http.get(f"/live_data/by-mint/{mint_address}")
        return LiveData.model_validate(data)
