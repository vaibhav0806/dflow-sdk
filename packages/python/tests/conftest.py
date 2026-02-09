"""Pytest configuration and fixtures."""

import pytest


@pytest.fixture
def mock_market_data():
    """Sample market data for testing (matches actual API format)."""
    return {
        "ticker": "BTCD-25DEC0313-T92749.99",
        "title": "Bitcoin above $92,749.99?",
        "subtitle": "Will Bitcoin be above $92,749.99 on December 31, 2025?",
        "eventTicker": "BTCD-25DEC0313",
        "marketType": "binary",
        "status": "active",
        "result": "",
        "yesSubTitle": "YES",
        "noSubTitle": "NO",
        "canCloseEarly": False,
        "rulesPrimary": "This market will resolve to Yes if Bitcoin is above $92,749.99 on December 31, 2025.",
        "yesBid": "0.6500",
        "yesAsk": "0.6600",
        "noBid": "0.3400",
        "noAsk": "0.3500",
        "volume": 1000000,
        "openInterest": 250000,
        "liquidity": 100000,
        "openTime": 1704067200,
        "closeTime": 1735689600,
        "expirationTime": 1735689600,
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
    """Sample orderbook data for testing (matches actual API format)."""
    return {
        "yes_bids": {"0.6400": 800, "0.6500": 1000},
        "no_bids": {"0.3400": 700, "0.3600": 900},
        "sequence": 1704067200000,
    }


@pytest.fixture
def mock_trade_data():
    """Sample trade data for testing (matches actual API format)."""
    return {
        "tradeId": "trade-123",
        "ticker": "BTCD-25DEC0313-T92749.99",
        "price": 65,
        "count": 100,
        "yesPrice": 6500,
        "noPrice": 3500,
        "yesPriceDollars": "0.65",
        "noPriceDollars": "0.35",
        "takerSide": "yes",
        "createdTime": 1704067200,
    }


@pytest.fixture
def mock_search_data(mock_event_data):
    """Sample search result data for testing."""
    return {
        "cursor": 0,
        "events": [mock_event_data],
    }


@pytest.fixture
def mock_series_data():
    """Sample series data for testing."""
    return {
        "ticker": "KXBTC",
        "title": "Bitcoin Price",
        "category": "Crypto",
        "tags": ["bitcoin", "crypto", "price"],
        "frequency": "daily",
        "feeType": "standard",
        "feeMultiplier": 1.0,
        "contractTermsUrl": "https://example.com/terms",
        "contractUrl": "https://example.com/contract",
        "additionalProhibitions": [],
        "settlementSources": [{"name": "CoinGecko", "url": "https://coingecko.com"}],
    }


@pytest.fixture
def mock_tags_data():
    """Sample tags data for testing."""
    return {
        "tagsByCategories": {
            "Crypto": ["bitcoin", "ethereum", "solana"],
            "Politics": ["election", "policy"],
            "Sports": ["nfl", "nba", "mlb"],
        }
    }


@pytest.fixture
def mock_live_data():
    """Sample live data for testing."""
    return {
        "eventTicker": "BTCD-25DEC0313",
        "milestones": [
            {
                "id": "milestone-1",
                "name": "BTC Price",
                "value": "92750.00",
                "timestamp": "2024-01-01T12:00:00Z",
            }
        ],
    }


@pytest.fixture
def mock_sports_filters_data():
    """Sample sports filters data for testing."""
    return {
        "filtersBySports": {
            "NFL": {
                "scopes": ["regular_season", "playoffs"],
                "competitions": {
                    "Super Bowl": {"scopes": ["championship"]},
                    "Week 1": {"scopes": ["regular_season"]},
                },
            },
            "NBA": {
                "scopes": ["regular_season"],
                "competitions": {
                    "Finals": {"scopes": ["championship"]},
                },
            },
        },
        "sportOrdering": ["NFL", "NBA"],
    }


@pytest.fixture
def mock_token_data():
    """Sample token data for testing."""
    return {
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
    }


@pytest.fixture
def mock_token_with_decimals_data():
    """Sample token with decimals data for testing."""
    return {
        "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "decimals": 6,
    }


@pytest.fixture
def mock_venue_data():
    """Sample venue data for testing."""
    return {
        "id": "kalshi-1",
        "name": "kalshi",
        "label": "Kalshi",
    }


@pytest.fixture
def mock_order_response_data():
    """Sample order response data for testing."""
    return {
        "transaction": "base64_encoded_transaction",
        "inAmount": "1000000",
        "outAmount": "1538461",
        "executionMode": "sync",
        "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "outputMint": "YesMint123456789abcdefghijklmnopqrstuvwxyz",
    }


@pytest.fixture
def mock_order_status_data():
    """Sample order status data for testing."""
    return {
        "status": "closed",
        "signature": "5TuPHPFe7p3nLh123456",
        "inAmount": "1000000",
        "outAmount": "1538461",
        "fills": [
            {
                "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "outputMint": "YesMint123456789abcdefghijklmnopqrstuvwxyz",
                "inAmount": "1000000",
                "outAmount": "1538461",
                "price": 65,
                "timestamp": 1704067200,
            }
        ],
    }


@pytest.fixture
def mock_intent_quote_data():
    """Sample intent quote data for testing."""
    return {
        "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "outputMint": "YesMint123456789abcdefghijklmnopqrstuvwxyz",
        "inAmount": "1000000",
        "outAmount": "1538461",
        "minOutAmount": "1500000",
        "maxInAmount": "1050000",
        "expiresAt": "2024-01-01T12:00:00Z",
    }


@pytest.fixture
def mock_intent_response_data(mock_intent_quote_data):
    """Sample intent response data for testing."""
    return {
        "transaction": "base64_encoded_intent_transaction",
        "intentId": "intent-123456",
        "quote": mock_intent_quote_data,
    }
