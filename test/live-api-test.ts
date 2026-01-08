/**
 * Live API Test for DFlow Prediction Markets SDK
 * Run with: npx tsx test/live-api-test.ts
 */

import {
  DFlowClient,
  DEV_METADATA_API_BASE_URL,
  DEV_TRADE_API_BASE_URL,
  DEV_WEBSOCKET_URL,
} from '../src/index.js';

async function testMetadataAPI(dflow: DFlowClient) {
  console.log('\n=== METADATA API TESTS ===\n');

  // Test Series API
  console.log('1. Testing Series API...');
  try {
    const series = await dflow.series.getSeries();
    console.log(`   ✓ getSeries: Found ${series.length} series`);
    if (series.length > 0) {
      console.log(`   Sample: ${series[0].ticker} - ${series[0].title}`);
    }
  } catch (error) {
    console.log(`   ✗ getSeries failed: ${error}`);
  }

  // Test Events API
  console.log('\n2. Testing Events API...');
  try {
    const eventsResponse = await dflow.events.getEvents({ limit: 5 });
    console.log(`   ✓ getEvents: Found ${eventsResponse.events.length} events`);
    if (eventsResponse.events.length > 0) {
      const event = eventsResponse.events[0];
      console.log(`   Sample: ${event.ticker} - ${event.title}`);

      // Test single event
      const singleEvent = await dflow.events.getEvent(event.ticker);
      console.log(`   ✓ getEvent: Retrieved ${singleEvent.ticker}`);
    }
  } catch (error) {
    console.log(`   ✗ Events API failed: ${error}`);
  }

  // Test Markets API
  console.log('\n3. Testing Markets API...');
  let sampleMarket: any = null;
  try {
    const marketsResponse = await dflow.markets.getMarkets({ limit: 50 });
    console.log(`   ✓ getMarkets: Found ${marketsResponse.markets.length} markets`);

    // Try to find an active market for better testing
    const activeMarket = marketsResponse.markets.find((m: any) => m.status === 'active');
    sampleMarket = activeMarket || marketsResponse.markets[0];

    console.log(`   Sample: ${sampleMarket.ticker} - ${sampleMarket.title}`);
    console.log(`   Status: ${sampleMarket.status}, YES: ${sampleMarket.yesPrice}, NO: ${sampleMarket.noPrice}`);

    // Test single market
    const market = await dflow.markets.getMarket(sampleMarket.ticker);
    console.log(`   ✓ getMarket: Retrieved ${market.ticker}`);

    // Test outcome mints
    const mints = await dflow.markets.getOutcomeMints();
    console.log(`   ✓ getOutcomeMints: Found ${mints.length} outcome mints`);
  } catch (error) {
    console.log(`   ✗ Markets API failed: ${error}`);
  }

  // Test Orderbook API
  console.log('\n4. Testing Orderbook API...');
  if (sampleMarket) {
    try {
      const orderbook = await dflow.orderbook.getOrderbook(sampleMarket.ticker);
      console.log(`   ✓ getOrderbook: ${sampleMarket.ticker}`);
      console.log(`   YES Bids: ${orderbook.yesBid?.length || 0}, YES Asks: ${orderbook.yesAsk?.length || 0}`);
    } catch (error) {
      console.log(`   ✗ Orderbook API failed: ${error}`);
    }
  }

  // Test Trades API
  console.log('\n5. Testing Trades API...');
  try {
    const tradesResponse = await dflow.trades.getTrades({ limit: 5 });
    console.log(`   ✓ getTrades: Found ${tradesResponse.trades.length} trades`);
    if (tradesResponse.trades.length > 0) {
      const trade = tradesResponse.trades[0];
      console.log(`   Sample: ${trade.marketTicker} - ${trade.side} @ ${trade.price}`);
    }
  } catch (error) {
    console.log(`   ✗ Trades API failed: ${error}`);
  }

  // Test Tags API
  console.log('\n6. Testing Tags API...');
  try {
    const tags = await dflow.tags.getTagsByCategories();
    const categories = Object.keys(tags);
    console.log(`   ✓ getTagsByCategories: Found ${categories.length} categories`);
    if (categories.length > 0) {
      console.log(`   Categories: ${categories.slice(0, 5).join(', ')}...`);
    }
  } catch (error) {
    console.log(`   ✗ Tags API failed: ${error}`);
  }

  // Test Sports API
  console.log('\n7. Testing Sports API...');
  try {
    const sports = await dflow.sports.getFiltersBySports();
    console.log(`   ✓ getFiltersBySports: Found ${sports.sports?.length || 0} sports`);
  } catch (error) {
    console.log(`   ✗ Sports API failed: ${error}`);
  }

  // Test Search API
  console.log('\n8. Testing Search API...');
  try {
    const results = await dflow.search.search({ query: 'bitcoin', limit: 3 });
    console.log(`   ✓ search: Found ${results.events.length} events for "bitcoin"`);
  } catch (error) {
    console.log(`   ✗ Search API failed: ${error}`);
  }

  return sampleMarket;
}

async function testTradeAPI(dflow: DFlowClient, sampleMarket: any) {
  console.log('\n=== TRADE API TESTS ===\n');

  // Test Quote (read-only, no wallet needed)
  console.log('1. Testing Swap Quote...');
  if (sampleMarket && sampleMarket.accounts) {
    try {
      const accountKey = Object.keys(sampleMarket.accounts)[0];
      const account = sampleMarket.accounts[accountKey];

      if (account?.yesMint) {
        const quote = await dflow.swap.getQuote({
          inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
          outputMint: account.yesMint,
          amount: 1000000, // 1 USDC
        });
        console.log(`   ✓ getQuote: ${quote.inAmount} -> ${quote.outAmount}`);
        console.log(`   Price Impact: ${quote.priceImpactPct}%`);
      }
    } catch (error: any) {
      console.log(`   ✗ Quote failed: ${error.message || error}`);
    }
  } else {
    console.log('   ⊘ Skipped: No sample market available');
  }
}

async function testWebSocket(dflow: DFlowClient, sampleMarket: any) {
  console.log('\n=== WEBSOCKET TESTS ===\n');

  console.log('1. Connecting to WebSocket...');
  try {
    await dflow.ws.connect();
    console.log('   ✓ Connected');

    if (sampleMarket) {
      console.log(`\n2. Subscribing to prices for ${sampleMarket.ticker}...`);

      let messageReceived = false;
      const timeout = setTimeout(() => {
        if (!messageReceived) {
          console.log('   ⊘ No price updates received within 5 seconds (market may be inactive)');
        }
        dflow.ws.disconnect();
      }, 5000);

      dflow.ws.onPrice((update) => {
        if (!messageReceived) {
          messageReceived = true;
          console.log(`   ✓ Received price update:`);
          console.log(`     Ticker: ${update.ticker}`);
          console.log(`     YES: ${update.yesPrice}, NO: ${update.noPrice}`);
          clearTimeout(timeout);
          dflow.ws.disconnect();
        }
      });

      dflow.ws.onError((error) => {
        console.log(`   ✗ WebSocket error: ${error.message}`);
      });

      dflow.ws.subscribePrices([sampleMarket.ticker]);
      console.log('   ✓ Subscribed');

      // Wait for message or timeout
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
  } catch (error: any) {
    console.log(`   ✗ WebSocket failed: ${error.message || error}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   DFlow Prediction Markets SDK - Live API Test           ║');
  console.log('║   Using DEV endpoints                                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Use dev endpoints for testing
  const dflow = new DFlowClient({
    metadataBaseUrl: DEV_METADATA_API_BASE_URL,
    tradeBaseUrl: DEV_TRADE_API_BASE_URL,
    wsOptions: { url: DEV_WEBSOCKET_URL },
  });

  try {
    // Test Metadata API
    const sampleMarket = await testMetadataAPI(dflow);

    // Test Trade API (read-only operations)
    await testTradeAPI(dflow, sampleMarket);

    // Test WebSocket
    await testWebSocket(dflow, sampleMarket);

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   Test Complete                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

main();
