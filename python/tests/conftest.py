"""Pytest configuration and fixtures."""

import pytest


@pytest.fixture
def mock_market_data():
    """Sample market data for testing."""
    return {
        "ticker": "BTCD-25DEC0313-T92749.99",
        "title": "Bitcoin above $92,749.99?",
        "subtitle": "Will Bitcoin be above $92,749.99 on December 31, 2025?",
        "eventTicker": "BTCD-25DEC0313",
        "status": "active",
        "result": "",
        "yesPrice": 0.65,
        "noPrice": 0.35,
        "volume": 1000000,
        "volume24h": 50000,
        "openInterest": 250000,
        "liquidity": 100000,
        "accounts": {
            "usdc": {
                "yesMint": "YesMint123456789abcdefghijklmnopqrstuvwxyz",
                "noMint": "NoMint123456789abcdefghijklmnopqrstuvwxyz",
                "marketLedger": "Ledger123456789abcdefghijklmnopqrstuvwxyz",
                "redemptionStatus": "closed",
            }
        },
    }


@pytest.fixture
def mock_event_data():
    """Sample event data for testing."""
    return {
        "ticker": "BTCD-25DEC0313",
        "title": "Bitcoin Price on December 31, 2025",
        "subtitle": "Daily Bitcoin price prediction",
        "seriesTicker": "KXBTC",
        "category": "crypto",
        "mutuallyExclusive": True,
    }


@pytest.fixture
def mock_quote_data():
    """Sample swap quote data for testing."""
    return {
        "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "outputMint": "YesMint123456789abcdefghijklmnopqrstuvwxyz",
        "inAmount": "1000000",
        "outAmount": "1538461",
        "priceImpactPct": 0.05,
    }


@pytest.fixture
def mock_orderbook_data():
    """Sample orderbook data for testing."""
    return {
        "marketTicker": "BTCD-25DEC0313-T92749.99",
        "timestamp": 1704067200000,
        "yesAsk": [{"price": 0.66, "quantity": 1000}],
        "yesBid": [{"price": 0.64, "quantity": 800}],
        "noAsk": [{"price": 0.36, "quantity": 900}],
        "noBid": [{"price": 0.34, "quantity": 700}],
    }


@pytest.fixture
def mock_trade_data():
    """Sample trade data for testing."""
    return {
        "id": "trade-123",
        "marketTicker": "BTCD-25DEC0313-T92749.99",
        "side": "yes",
        "action": "buy",
        "price": 0.65,
        "quantity": 100,
        "timestamp": "2025-01-01T12:00:00Z",
    }
