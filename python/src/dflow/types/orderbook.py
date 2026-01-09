"""Orderbook types for DFlow SDK."""

from pydantic import BaseModel, Field


class OrderbookLevel(BaseModel):
    """Single price level in the orderbook."""

    price: float
    quantity: float


class Orderbook(BaseModel):
    """Orderbook snapshot for a market."""

    market_ticker: str = Field(alias="marketTicker")
    timestamp: int
    yes_ask: list[OrderbookLevel] = Field(alias="yesAsk")
    yes_bid: list[OrderbookLevel] = Field(alias="yesBid")
    no_ask: list[OrderbookLevel] = Field(alias="noAsk")
    no_bid: list[OrderbookLevel] = Field(alias="noBid")

    model_config = {"populate_by_name": True}
