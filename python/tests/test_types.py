"""Tests for Pydantic type definitions."""

import pytest

from dflow.types import (
    Event,
    Market,
    MarketAccount,
    Orderbook,
    OrderbookLevel,
    SwapQuote,
    Trade,
)


class TestMarketTypes:
    """Tests for market-related types."""

    def test_market_account_parsing(self):
        """Test MarketAccount parsing with alias."""
        data = {
            "yesMint": "YesMint123",
            "noMint": "NoMint123",
            "marketLedger": "Ledger123",
            "redemptionStatus": "open",
            "scalarOutcomePct": 5000,
        }
        account = MarketAccount.model_validate(data)
        assert account.yes_mint == "YesMint123"
        assert account.no_mint == "NoMint123"
        assert account.market_ledger == "Ledger123"
        assert account.redemption_status == "open"
        assert account.scalar_outcome_pct == 5000

    def test_market_parsing(self, mock_market_data):
        """Test Market parsing with nested accounts."""
        market = Market.model_validate(mock_market_data)
        assert market.ticker == "BTCD-25DEC0313-T92749.99"
        assert market.title == "Bitcoin above $92,749.99?"
        assert market.event_ticker == "BTCD-25DEC0313"
        assert market.status == "active"
        assert market.result == ""
        assert market.yes_price == 0.65
        assert market.no_price == 0.35
        assert market.volume == 1000000
        assert "usdc" in market.accounts
        assert market.accounts["usdc"].yes_mint == "YesMint123456789abcdefghijklmnopqrstuvwxyz"

    def test_market_optional_fields(self):
        """Test Market with minimal required fields."""
        data = {
            "ticker": "TEST-MARKET",
            "title": "Test Market",
            "eventTicker": "TEST-EVENT",
            "status": "active",
            "result": "",
            "accounts": {},
        }
        market = Market.model_validate(data)
        assert market.ticker == "TEST-MARKET"
        assert market.yes_price is None
        assert market.volume is None


class TestEventTypes:
    """Tests for event-related types."""

    def test_event_parsing(self, mock_event_data):
        """Test Event parsing."""
        event = Event.model_validate(mock_event_data)
        assert event.ticker == "BTCD-25DEC0313"
        assert event.title == "Bitcoin Price on December 31, 2025"
        assert event.series_ticker == "KXBTC"
        assert event.category == "crypto"
        assert event.mutually_exclusive is True

    def test_event_with_markets(self, mock_event_data, mock_market_data):
        """Test Event with nested markets."""
        mock_event_data["markets"] = [mock_market_data]
        event = Event.model_validate(mock_event_data)
        assert event.markets is not None
        assert len(event.markets) == 1
        assert event.markets[0].ticker == "BTCD-25DEC0313-T92749.99"


class TestOrderbookTypes:
    """Tests for orderbook types."""

    def test_orderbook_level(self):
        """Test OrderbookLevel parsing."""
        level = OrderbookLevel(price=0.65, quantity=1000)
        assert level.price == 0.65
        assert level.quantity == 1000

    def test_orderbook_parsing(self, mock_orderbook_data):
        """Test Orderbook parsing."""
        orderbook = Orderbook.model_validate(mock_orderbook_data)
        assert orderbook.market_ticker == "BTCD-25DEC0313-T92749.99"
        assert orderbook.timestamp == 1704067200000
        assert len(orderbook.yes_ask) == 1
        assert orderbook.yes_ask[0].price == 0.66
        assert orderbook.yes_bid[0].quantity == 800


class TestTradeTypes:
    """Tests for trade types."""

    def test_trade_parsing(self, mock_trade_data):
        """Test Trade parsing."""
        trade = Trade.model_validate(mock_trade_data)
        assert trade.id == "trade-123"
        assert trade.market_ticker == "BTCD-25DEC0313-T92749.99"
        assert trade.side == "yes"
        assert trade.action == "buy"
        assert trade.price == 0.65
        assert trade.quantity == 100


class TestSwapTypes:
    """Tests for swap types."""

    def test_swap_quote_parsing(self, mock_quote_data):
        """Test SwapQuote parsing."""
        quote = SwapQuote.model_validate(mock_quote_data)
        assert quote.input_mint == "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        assert quote.output_mint == "YesMint123456789abcdefghijklmnopqrstuvwxyz"
        assert quote.in_amount == "1000000"
        assert quote.out_amount == "1538461"
        assert quote.price_impact_pct == 0.05
