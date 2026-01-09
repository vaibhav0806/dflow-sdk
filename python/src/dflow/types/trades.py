"""Trade types for DFlow SDK."""

from typing import Literal

from pydantic import BaseModel, Field

TradeSide = Literal["yes", "no"]
TradeAction = Literal["buy", "sell"]


class Trade(BaseModel):
    """Historical trade data."""

    id: str
    market_ticker: str = Field(alias="marketTicker")
    side: TradeSide
    action: TradeAction
    price: float
    quantity: float
    timestamp: str
    taker_address: str | None = Field(default=None, alias="takerAddress")
    maker_address: str | None = Field(default=None, alias="makerAddress")

    model_config = {"populate_by_name": True}


class TradesResponse(BaseModel):
    """Response from trades endpoint."""

    cursor: str | None = None
    trades: list[Trade]
