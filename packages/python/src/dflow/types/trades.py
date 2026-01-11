"""Trade types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel, Field

# Taker side of a trade - which side took the trade.
TakerSide = Literal["yes", "no"]


class Trade(BaseModel):
    """Trade data returned from the API."""

    # Unique trade identifier
    trade_id: str = Field(alias="tradeId")
    # Market ticker this trade occurred in
    ticker: str
    # Which side (yes/no) the taker was on
    taker_side: TakerSide = Field(alias="takerSide")
    # Trade price (in cents, 0-100)
    price: int
    # YES price (in cents, 0-100)
    yes_price: int = Field(alias="yesPrice")
    # NO price (in cents, 0-100)
    no_price: int = Field(alias="noPrice")
    # YES price in dollars as string
    yes_price_dollars: str = Field(alias="yesPriceDollars")
    # NO price in dollars as string
    no_price_dollars: str = Field(alias="noPriceDollars")
    # Number of contracts traded
    count: int
    # Creation timestamp (Unix timestamp in seconds)
    created_time: int = Field(alias="createdTime")

    model_config = {"populate_by_name": True}

    # Backwards-compatible properties
    @property
    def id(self) -> str:
        """Alias for trade_id for backwards compatibility."""
        return self.trade_id

    @property
    def market_ticker(self) -> str:
        """Alias for ticker for backwards compatibility."""
        return self.ticker

    @property
    def side(self) -> TakerSide:
        """Alias for taker_side for backwards compatibility."""
        return self.taker_side

    @property
    def quantity(self) -> int:
        """Alias for count for backwards compatibility."""
        return self.count

    @property
    def timestamp(self) -> int:
        """Alias for created_time for backwards compatibility."""
        return self.created_time


class TradesParams(BaseModel):
    """Parameters for fetching trades."""

    # Maximum number of trades to return (1-1000, default 100)
    limit: int | None = None
    # Pagination cursor (trade ID) to start from
    cursor: str | None = None
    # Filter by market ticker
    ticker: str | None = None
    # Filter trades after this Unix timestamp
    min_ts: int | None = Field(default=None, alias="minTs")
    # Filter trades before this Unix timestamp
    max_ts: int | None = Field(default=None, alias="maxTs")

    model_config = {"populate_by_name": True}


class TradesByMintParams(BaseModel):
    """Parameters for fetching trades by mint (excluding ticker since it's derived from mint)."""

    # Maximum number of trades to return (1-1000, default 100)
    limit: int | None = None
    # Pagination cursor (trade ID) to start from
    cursor: str | None = None
    # Filter trades after this Unix timestamp
    min_ts: int | None = Field(default=None, alias="minTs")
    # Filter trades before this Unix timestamp
    max_ts: int | None = Field(default=None, alias="maxTs")

    model_config = {"populate_by_name": True}


class TradesResponse(BaseModel):
    """Response from the trades endpoint."""

    # Pagination cursor for next page (trade ID)
    cursor: str | None = None
    # Array of trades
    trades: list[Trade]


# Legacy type aliases for backwards compatibility
TradeSide = TakerSide
TradeAction = Literal["buy", "sell"]
