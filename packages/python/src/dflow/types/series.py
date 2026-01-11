"""Series types for DFlow SDK."""

from typing import Any

from pydantic import BaseModel, Field

from .events import SettlementSource
from .markets import MarketStatus


class Series(BaseModel):
    """Series data returned from the API.

    A series represents a template for recurring events.
    """

    ticker: str
    title: str
    category: str
    tags: list[str]
    frequency: str
    fee_type: str = Field(alias="feeType")
    fee_multiplier: float = Field(alias="feeMultiplier")
    contract_terms_url: str = Field(alias="contractTermsUrl")
    contract_url: str = Field(alias="contractUrl")
    additional_prohibitions: list[str] = Field(alias="additionalProhibitions")
    settlement_sources: list[SettlementSource] = Field(alias="settlementSources")
    product_metadata: Any | None = Field(default=None, alias="productMetadata")

    model_config = {"populate_by_name": True}


class SeriesParams(BaseModel):
    """Parameters for fetching series."""

    # Filter series by category (e.g., Politics, Economics, Entertainment)
    category: str | None = None
    # Filter series by tags (comma-separated list)
    tags: str | None = None
    # Filter series that are initialized (have a corresponding market ledger)
    is_initialized: bool | None = Field(default=None, alias="isInitialized")
    # Filter series by market status
    status: MarketStatus | None = None

    model_config = {"populate_by_name": True}


class SeriesResponse(BaseModel):
    """Response from series endpoint."""

    series: list[Series]
