"""Tests for API modules."""

import pytest
from pytest_httpx import HTTPXMock

from dflow import DFlowClient


class TestMarketsAPI:
    """Tests for MarketsAPI."""

    def test_get_market(self, httpx_mock: HTTPXMock, mock_market_data):
        """Test get_market method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/market/BTCD-25DEC0313-T92749.99",
            json=mock_market_data,
        )

        with DFlowClient() as client:
            market = client.markets.get_market("BTCD-25DEC0313-T92749.99")

            assert market.ticker == "BTCD-25DEC0313-T92749.99"
            assert market.yes_bid == "0.6500"
            assert market.yes_price == 0.65  # computed property
            assert market.status == "active"

    def test_get_market_by_mint(self, httpx_mock: HTTPXMock, mock_market_data):
        """Test get_market_by_mint method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/market/by-mint/YesMint123456789abcdefghijklmnopqrstuvwxyz",
            json=mock_market_data,
        )

        with DFlowClient() as client:
            market = client.markets.get_market_by_mint(
                "YesMint123456789abcdefghijklmnopqrstuvwxyz"
            )

            assert market.ticker == "BTCD-25DEC0313-T92749.99"
            assert market.status == "active"

    def test_get_markets(self, httpx_mock: HTTPXMock, mock_market_data):
        """Test get_markets method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/markets?status=active",
            json={"markets": [mock_market_data], "cursor": None},
        )

        with DFlowClient() as client:
            response = client.markets.get_markets(status="active")

            assert len(response.markets) == 1
            assert response.markets[0].ticker == "BTCD-25DEC0313-T92749.99"

    def test_get_markets_batch(self, httpx_mock: HTTPXMock, mock_market_data):
        """Test get_markets_batch method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/markets/batch",
            json={"markets": [mock_market_data]},
        )

        with DFlowClient() as client:
            markets = client.markets.get_markets_batch(
                tickers=["BTCD-25DEC0313-T92749.99"]
            )

            assert len(markets) == 1
            assert markets[0].ticker == "BTCD-25DEC0313-T92749.99"

    def test_get_markets_batch_exceeds_limit(self):
        """Test get_markets_batch raises error when exceeding limit."""
        with DFlowClient() as client:
            with pytest.raises(ValueError, match="exceeds maximum"):
                client.markets.get_markets_batch(
                    tickers=["t" + str(i) for i in range(101)]
                )

    def test_get_outcome_mints(self, httpx_mock: HTTPXMock):
        """Test get_outcome_mints method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/outcome_mints",
            json={"mints": ["mint1", "mint2", "mint3"]},
        )

        with DFlowClient() as client:
            mints = client.markets.get_outcome_mints()

            assert len(mints) == 3
            assert "mint1" in mints

    def test_get_outcome_mints_with_filter(self, httpx_mock: HTTPXMock):
        """Test get_outcome_mints with min_close_ts filter."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/outcome_mints?minCloseTs=1704067200",
            json={"mints": ["mint1", "mint2"]},
        )

        with DFlowClient() as client:
            mints = client.markets.get_outcome_mints(min_close_ts=1704067200)

            assert len(mints) == 2

    def test_filter_outcome_mints(self, httpx_mock: HTTPXMock):
        """Test filter_outcome_mints method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/filter_outcome_mints",
            json={"outcomeMints": ["mint1", "mint3"]},
        )

        with DFlowClient() as client:
            filtered = client.markets.filter_outcome_mints(["mint1", "mint2", "mint3"])

            assert len(filtered) == 2
            assert "mint1" in filtered
            assert "mint3" in filtered

    def test_filter_outcome_mints_exceeds_limit(self):
        """Test filter_outcome_mints raises error when exceeding limit."""
        with DFlowClient() as client:
            with pytest.raises(ValueError, match="exceeds maximum"):
                client.markets.filter_outcome_mints(
                    ["addr" + str(i) for i in range(201)]
                )

    def test_get_market_candlesticks(self, httpx_mock: HTTPXMock):
        """Test get_market_candlesticks method."""
        from dflow.types import CandlestickParams

        mock_candlesticks = {
            "candlesticks": [
                {
                    "timestamp": 1704067200,
                    "open": 65,
                    "high": 68,
                    "low": 62,
                    "close": 66,
                    "volume": 1000,
                    "openInterest": 500,
                }
            ]
        }
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/market/BTCD-25DEC0313-T92749.99/candlesticks?startTs=1704067200&endTs=1704153600&periodInterval=60",
            json=mock_candlesticks,
        )

        with DFlowClient() as client:
            candles = client.markets.get_market_candlesticks(
                "BTCD-25DEC0313-T92749.99",
                CandlestickParams(
                    start_ts=1704067200,
                    end_ts=1704153600,
                    period_interval=60,
                ),
            )

            assert len(candles) == 1
            assert candles[0].open == 65
            assert candles[0].close == 66


class TestEventsAPI:
    """Tests for EventsAPI."""

    def test_get_event(self, httpx_mock: HTTPXMock, mock_event_data):
        """Test get_event method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/event/BTCD-25DEC0313",
            json=mock_event_data,
        )

        with DFlowClient() as client:
            event = client.events.get_event("BTCD-25DEC0313")

            assert event.ticker == "BTCD-25DEC0313"
            assert event.series_ticker == "KXBTC"

    def test_get_event_with_nested_markets(
        self, httpx_mock: HTTPXMock, mock_event_data, mock_market_data
    ):
        """Test get_event with nested markets."""
        event_with_markets = {**mock_event_data, "markets": [mock_market_data]}
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/event/BTCD-25DEC0313?withNestedMarkets=true",
            json=event_with_markets,
        )

        with DFlowClient() as client:
            event = client.events.get_event("BTCD-25DEC0313", with_nested_markets=True)

            assert event.ticker == "BTCD-25DEC0313"
            assert event.markets is not None
            assert len(event.markets) == 1

    def test_get_events(self, httpx_mock: HTTPXMock, mock_event_data):
        """Test get_events method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/events?status=active",
            json={"events": [mock_event_data], "cursor": None},
        )

        with DFlowClient() as client:
            response = client.events.get_events(status="active")

            assert len(response.events) == 1
            assert response.events[0].ticker == "BTCD-25DEC0313"

    def test_get_event_forecast_history(self, httpx_mock: HTTPXMock):
        """Test get_event_forecast_history method."""
        from dflow.types import ForecastHistoryParams

        mock_forecast = {
            "eventTicker": "event-123",
            "history": [
                {
                    "timestamp": 1704067200,
                    "yesPrice": 0.65,
                    "noPrice": 0.35,
                    "percentile": 50.0,
                }
            ],
        }
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/event/KXBTC/event-123/forecast_percentile_history?percentiles=5000&startTs=1704067200&endTs=1704153600&periodInterval=60",
            json=mock_forecast,
        )

        with DFlowClient() as client:
            history = client.events.get_event_forecast_history(
                "KXBTC",
                "event-123",
                ForecastHistoryParams(
                    percentiles="5000",
                    start_ts=1704067200,
                    end_ts=1704153600,
                    period_interval=60,
                ),
            )

            assert history.event_ticker == "event-123"
            assert len(history.history) == 1
            assert history.history[0].timestamp == 1704067200

    def test_get_event_forecast_by_mint(self, httpx_mock: HTTPXMock):
        """Test get_event_forecast_by_mint method."""
        from dflow.types import ForecastHistoryParams

        mock_forecast = {
            "eventTicker": "BTCD-25DEC0313",
            "history": [
                {
                    "timestamp": 1704067200,
                    "yesPrice": 0.65,
                    "noPrice": 0.35,
                }
            ],
        }
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/event/by-mint/YesMint123/forecast_percentile_history?percentiles=5000&startTs=1704067200&endTs=1704153600&periodInterval=60",
            json=mock_forecast,
        )

        with DFlowClient() as client:
            history = client.events.get_event_forecast_by_mint(
                "YesMint123",
                ForecastHistoryParams(
                    percentiles="5000",
                    start_ts=1704067200,
                    end_ts=1704153600,
                    period_interval=60,
                ),
            )

            assert len(history.history) == 1

    def test_get_event_candlesticks(self, httpx_mock: HTTPXMock):
        """Test get_event_candlesticks method."""
        from dflow.types import CandlestickParams

        mock_data = {
            "market_tickers": ["MARKET-1", "MARKET-2"],
            "market_candlesticks": [
                [
                    {
                        "end_period_ts": 1704067260,
                        "open_interest": 500.0,
                        "volume": 1000.0,
                        "price": {"open": 65, "high": 68, "low": 62, "close": 66},
                    }
                ],
                [
                    {
                        "end_period_ts": 1704067260,
                        "open_interest": 400.0,
                        "volume": 800.0,
                        "price": {"open": 35, "high": 38, "low": 32, "close": 34},
                    }
                ],
            ],
        }
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/event/BTCD-25DEC0313/candlesticks?startTs=1704067200&endTs=1704153600&periodInterval=60",
            json=mock_data,
        )

        with DFlowClient() as client:
            candles = client.events.get_event_candlesticks(
                "BTCD-25DEC0313",
                CandlestickParams(
                    start_ts=1704067200,
                    end_ts=1704153600,
                    period_interval=60,
                ),
            )

            assert "MARKET-1" in candles
            assert "MARKET-2" in candles
            assert len(candles["MARKET-1"]) == 1
            assert candles["MARKET-1"][0].price.open == 65


class TestOrderbookAPI:
    """Tests for OrderbookAPI."""

    def test_get_orderbook(self, httpx_mock: HTTPXMock, mock_orderbook_data):
        """Test get_orderbook method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/orderbook/BTCD-25DEC0313-T92749.99",
            json=mock_orderbook_data,
        )

        with DFlowClient() as client:
            orderbook = client.orderbook.get_orderbook("BTCD-25DEC0313-T92749.99")

            assert orderbook.sequence == 1704067200000
            assert orderbook.timestamp == 1704067200000  # backwards compat
            assert len(orderbook.yes_bids) == 2
            yes_levels = orderbook.get_yes_levels()
            assert yes_levels[0].price == 0.65


class TestTradesAPI:
    """Tests for TradesAPI."""

    def test_get_trades(self, httpx_mock: HTTPXMock, mock_trade_data):
        """Test get_trades method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/trades?ticker=BTCD-25DEC0313-T92749.99",
            json={"trades": [mock_trade_data], "cursor": None},
        )

        with DFlowClient() as client:
            response = client.trades.get_trades(
                ticker="BTCD-25DEC0313-T92749.99"
            )

            assert len(response.trades) == 1
            assert response.trades[0].side == "yes"  # backwards compat property
            assert response.trades[0].taker_side == "yes"
            assert response.trades[0].price == 65  # price in cents

    def test_get_trades_with_filters(self, httpx_mock: HTTPXMock, mock_trade_data):
        """Test get_trades with timestamp filters."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/trades?minTs=1704067200&maxTs=1704153600&limit=50",
            json={"trades": [mock_trade_data], "cursor": "next-cursor"},
        )

        with DFlowClient() as client:
            response = client.trades.get_trades(
                min_ts=1704067200, max_ts=1704153600, limit=50
            )

            assert len(response.trades) == 1
            assert response.cursor == "next-cursor"

    def test_get_trades_by_mint(self, httpx_mock: HTTPXMock, mock_trade_data):
        """Test get_trades_by_mint method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/trades/by-mint/YesMint123456789abcdefghijklmnopqrstuvwxyz",
            json={"trades": [mock_trade_data], "cursor": None},
        )

        with DFlowClient() as client:
            response = client.trades.get_trades_by_mint(
                "YesMint123456789abcdefghijklmnopqrstuvwxyz"
            )

            assert len(response.trades) == 1
            assert response.trades[0].ticker == "BTCD-25DEC0313-T92749.99"


class TestSwapAPI:
    """Tests for SwapAPI."""

    def test_get_quote(self, httpx_mock: HTTPXMock, mock_quote_data):
        """Test get_quote method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=YesMint123&amount=1000000",
            json=mock_quote_data,
        )

        with DFlowClient() as client:
            quote = client.swap.get_quote(
                input_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                output_mint="YesMint123",
                amount=1000000,
            )

            assert quote.in_amount == "1000000"
            assert quote.out_amount == "1538461"
            assert quote.price_impact_pct == 0.05


class TestSearchAPI:
    """Tests for SearchAPI."""

    def test_search(self, httpx_mock: HTTPXMock, mock_event_data, mock_search_data):
        """Test search method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/search?q=bitcoin&limit=10",
            json=mock_search_data,
        )

        with DFlowClient() as client:
            result = client.search.search(query="bitcoin", limit=10)

            assert len(result.events) == 1
            assert result.events[0].ticker == "BTCD-25DEC0313"
            assert result.cursor == 0


class TestSeriesAPI:
    """Tests for SeriesAPI."""

    def test_get_series(self, httpx_mock: HTTPXMock, mock_series_data):
        """Test get_series method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/series",
            json={"series": [mock_series_data]},
        )

        with DFlowClient() as client:
            series_list = client.series.get_series()

            assert len(series_list) == 1
            assert series_list[0].ticker == "KXBTC"
            assert series_list[0].title == "Bitcoin Price"
            assert series_list[0].category == "Crypto"

    def test_get_series_with_filters(self, httpx_mock: HTTPXMock, mock_series_data):
        """Test get_series with filter parameters."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/series?category=Crypto&isInitialized=true",
            json={"series": [mock_series_data]},
        )

        with DFlowClient() as client:
            series_list = client.series.get_series(
                category="Crypto", is_initialized=True
            )

            assert len(series_list) == 1
            assert series_list[0].category == "Crypto"

    def test_get_series_by_ticker(self, httpx_mock: HTTPXMock, mock_series_data):
        """Test get_series_by_ticker method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/series/KXBTC",
            json=mock_series_data,
        )

        with DFlowClient() as client:
            series = client.series.get_series_by_ticker("KXBTC")

            assert series.ticker == "KXBTC"
            assert series.title == "Bitcoin Price"


class TestTagsAPI:
    """Tests for TagsAPI."""

    def test_get_tags_by_categories(self, httpx_mock: HTTPXMock, mock_tags_data):
        """Test get_tags_by_categories method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/tags_by_categories",
            json=mock_tags_data,
        )

        with DFlowClient() as client:
            tags = client.tags.get_tags_by_categories()

            assert "Crypto" in tags
            assert "bitcoin" in tags["Crypto"]
            assert "Politics" in tags
            assert "election" in tags["Politics"]


class TestLiveDataAPI:
    """Tests for LiveDataAPI."""

    def test_get_live_data(self, httpx_mock: HTTPXMock, mock_live_data):
        """Test get_live_data method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/live_data?milestoneIds=milestone-1",
            json={"data": [mock_live_data]},
        )

        with DFlowClient() as client:
            data = client.live_data.get_live_data(["milestone-1"])

            assert len(data) == 1
            assert data[0].milestones is not None
            assert len(data[0].milestones) == 1
            assert data[0].milestones[0].name == "BTC Price"

    def test_get_live_data_by_event(self, httpx_mock: HTTPXMock, mock_live_data):
        """Test get_live_data_by_event method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/live_data/by-event/BTCD-25DEC0313",
            json=mock_live_data,
        )

        with DFlowClient() as client:
            data = client.live_data.get_live_data_by_event("BTCD-25DEC0313")

            assert data.milestones is not None
            assert len(data.milestones) == 1
            assert data.milestones[0].value == "92750.00"

    def test_get_live_data_by_mint(self, httpx_mock: HTTPXMock, mock_live_data):
        """Test get_live_data_by_mint method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/live_data/by-mint/YesMint123456789abcdefghijklmnopqrstuvwxyz",
            json=mock_live_data,
        )

        with DFlowClient() as client:
            data = client.live_data.get_live_data_by_mint(
                "YesMint123456789abcdefghijklmnopqrstuvwxyz"
            )

            assert data.milestones is not None
            assert len(data.milestones) == 1


class TestSportsAPI:
    """Tests for SportsAPI."""

    def test_get_filters_by_sports(self, httpx_mock: HTTPXMock, mock_sports_filters_data):
        """Test get_filters_by_sports method."""
        httpx_mock.add_response(
            url="https://dev-prediction-markets-api.dflow.net/api/v1/filters_by_sports",
            json=mock_sports_filters_data,
        )

        with DFlowClient() as client:
            response = client.sports.get_filters_by_sports()

            assert response.sport_ordering == ["NFL", "NBA"]
            assert "NFL" in response.filters_by_sports
            # competitions is a dict, check key exists
            assert response.filters_by_sports["NFL"].competitions is not None
            assert "Super Bowl" in response.filters_by_sports["NFL"].competitions


class TestTokensAPI:
    """Tests for TokensAPI."""

    def test_get_tokens(self, httpx_mock: HTTPXMock, mock_token_data):
        """Test get_tokens method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/tokens",
            json=[mock_token_data],
        )

        with DFlowClient() as client:
            tokens = client.tokens.get_tokens()

            assert len(tokens) == 1
            assert tokens[0].mint == "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
            assert tokens[0].symbol == "USDC"

    def test_get_tokens_with_decimals(
        self, httpx_mock: HTTPXMock, mock_token_with_decimals_data
    ):
        """Test get_tokens_with_decimals method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/tokens-with-decimals",
            json=[mock_token_with_decimals_data],
        )

        with DFlowClient() as client:
            tokens = client.tokens.get_tokens_with_decimals()

            assert len(tokens) == 1
            assert tokens[0].decimals == 6
            assert tokens[0].symbol == "USDC"


class TestVenuesAPI:
    """Tests for VenuesAPI."""

    def test_get_venues(self, httpx_mock: HTTPXMock, mock_venue_data):
        """Test get_venues method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/venues",
            json=[mock_venue_data],
        )

        with DFlowClient() as client:
            venues = client.venues.get_venues()

            assert len(venues) == 1
            assert venues[0].name == "kalshi"
            assert venues[0].label == "Kalshi"


class TestOrdersAPI:
    """Tests for OrdersAPI."""

    def test_get_order(self, httpx_mock: HTTPXMock, mock_order_response_data):
        """Test get_order method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/order?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=YesMint123&amount=1000000&slippageBps=50&userPublicKey=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            json=mock_order_response_data,
        )

        with DFlowClient() as client:
            order = client.orders.get_order(
                input_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                output_mint="YesMint123",
                amount=1000000,
                slippage_bps=50,
                user_public_key="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            )

            assert order.transaction == "base64_encoded_transaction"
            assert order.in_amount == "1000000"
            assert order.out_amount == "1538461"
            assert order.execution_mode == "sync"

    def test_get_order_status(self, httpx_mock: HTTPXMock, mock_order_status_data):
        """Test get_order_status method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/order-status?signature=5TuPHPFe7p3nLh123456",
            json=mock_order_status_data,
        )

        with DFlowClient() as client:
            status = client.orders.get_order_status("5TuPHPFe7p3nLh123456")

            assert status.status == "closed"
            assert status.signature == "5TuPHPFe7p3nLh123456"
            assert len(status.fills) == 1
            assert status.fills[0].price == 65
            assert status.fills[0].in_amount == "1000000"


class TestIntentAPI:
    """Tests for IntentAPI."""

    def test_get_intent_quote(self, httpx_mock: HTTPXMock, mock_intent_quote_data):
        """Test get_intent_quote method."""
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/intent?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=YesMint123&amount=1000000&mode=ExactIn",
            json=mock_intent_quote_data,
        )

        with DFlowClient() as client:
            quote = client.intent.get_intent_quote(
                input_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                output_mint="YesMint123",
                amount=1000000,
                mode="ExactIn",
            )

            assert quote.in_amount == "1000000"
            assert quote.out_amount == "1538461"
            assert quote.min_out_amount == "1500000"
            assert quote.max_in_amount == "1050000"

    def test_submit_intent(
        self, httpx_mock: HTTPXMock, mock_intent_quote_data, mock_intent_response_data
    ):
        """Test submit_intent method."""
        # First call gets the quote
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/intent?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=YesMint123&amount=1000000&mode=ExactIn",
            json=mock_intent_quote_data,
        )
        # Second call submits the intent
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/submit-intent",
            json=mock_intent_response_data,
        )

        with DFlowClient() as client:
            response = client.intent.submit_intent(
                input_mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                output_mint="YesMint123",
                amount=1000000,
                mode="ExactIn",
                user_public_key="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
                slippage_bps=50,
            )

            assert response.transaction == "base64_encoded_intent_transaction"
            assert response.intent_id == "intent-123456"
            assert response.quote is not None


class TestPredictionMarketAPI:
    """Tests for PredictionMarketAPI."""

    def test_initialize_market(self, httpx_mock: HTTPXMock):
        """Test initialize_market method."""
        mock_init_response = {
            "transaction": "base64_encoded_init_transaction",
            "yesMint": "YesMint123456789abcdefghijklmnopqrstuvwxyz",
            "noMint": "NoMint123456789abcdefghijklmnopqrstuvwxyz",
            "marketLedger": "Ledger123456789abcdefghijklmnopqrstuvwxyz",
        }
        httpx_mock.add_response(
            url="https://dev-quote-api.dflow.net/prediction-market-init?marketTicker=MY-MARKET&userPublicKey=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU&settlementMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            json=mock_init_response,
        )

        with DFlowClient() as client:
            response = client.prediction_market.initialize_market(
                market_ticker="MY-MARKET",
                user_public_key="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            )

            assert response.transaction == "base64_encoded_init_transaction"
            assert response.yes_mint == "YesMint123456789abcdefghijklmnopqrstuvwxyz"
            assert response.no_mint == "NoMint123456789abcdefghijklmnopqrstuvwxyz"
