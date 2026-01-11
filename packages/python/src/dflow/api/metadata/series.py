"""Series API for DFlow SDK."""

from dflow.types import MarketStatus, Series, SeriesResponse
from dflow.utils.http import HttpClient


class SeriesAPI:
    """API for retrieving series/category information.

    Series represent templates for recurring events. They group related events together
    (e.g., all Bitcoin price events, all election events). Use series to browse
    events by category.

    Example:
        >>> dflow = DFlowClient()
        >>>
        >>> # Get all series
        >>> series = dflow.series.get_series()
        >>>
        >>> # Get a specific series
        >>> btc_series = dflow.series.get_series_by_ticker("KXBTC")
    """

    def __init__(self, http: HttpClient):
        self._http = http

    def get_series(
        self,
        category: str | None = None,
        tags: str | None = None,
        is_initialized: bool | None = None,
        status: MarketStatus | None = None,
    ) -> list[Series]:
        """Get all available series templates.

        Returns all series templates available on Kalshi. A series represents
        a template for recurring events.

        Args:
            category: Filter series by category (e.g., Politics, Economics, Entertainment)
            tags: Filter series by tags (comma-separated list)
            is_initialized: Filter series that are initialized (have a corresponding market ledger)
            status: Filter series by market status

        Returns:
            Array of series matching the filters

        Example:
            >>> # Get all series
            >>> series = dflow.series.get_series()
            >>> for s in series:
            ...     print(f"{s.ticker}: {s.title}")
            >>>
            >>> # Filter by category
            >>> politics_series = dflow.series.get_series(category="Politics")
            >>>
            >>> # Filter by tags
            >>> crypto_series = dflow.series.get_series(tags="crypto,bitcoin")
            >>>
            >>> # Get only initialized series
            >>> initialized = dflow.series.get_series(is_initialized=True)
        """
        data = self._http.get(
            "/series",
            {
                "category": category,
                "tags": tags,
                "isInitialized": is_initialized,
                "status": status,
            },
        )
        response = SeriesResponse.model_validate(data)
        return response.series

    def get_series_by_ticker(self, ticker: str) -> Series:
        """Get a specific series by its ticker.

        Args:
            ticker: The series ticker (e.g., 'KXBTC', 'KXETH')

        Returns:
            The series data

        Example:
            >>> series = dflow.series.get_series_by_ticker("KXBTC")
            >>> print(f"{series.title}")
            >>> print(f"Category: {series.category}")
            >>> print(f"Tags: {', '.join(series.tags)}")
        """
        data = self._http.get(f"/series/{ticker}")
        return Series.model_validate(data)
