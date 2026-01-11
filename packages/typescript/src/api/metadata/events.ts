import type { HttpClient } from '../../utils/http.js';
import type {
  Event,
  EventsParams,
  EventsResponse,
  ForecastHistory,
  ForecastHistoryParams,
  Candlestick,
  CandlestickParams,
} from '../../types/index.js';

/**
 * API for discovering and querying prediction market events.
 *
 * Events are the top-level containers for prediction markets. Each event
 * represents a question or outcome to predict (e.g., "Will Bitcoin exceed $100k?")
 * and contains one or more markets for trading.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get active events
 * const { events } = await dflow.events.getEvents({ status: 'active' });
 *
 * // Get a specific event with its markets
 * const event = await dflow.events.getEvent('event-id', true);
 * ```
 */
export class EventsAPI {
  constructor(private http: HttpClient) {}

  /**
   * Get a single event by its ID.
   *
   * @param eventId - The unique identifier of the event (event ticker)
   * @param withNestedMarkets - If true, includes all markets within the event
   * @returns The event data, optionally with nested markets
   *
   * @example
   * ```typescript
   * // Get event without markets
   * const event = await dflow.events.getEvent('BTCD-25DEC0313');
   *
   * // Get event with all its markets
   * const eventWithMarkets = await dflow.events.getEvent('BTCD-25DEC0313', true);
   * console.log(eventWithMarkets.markets); // Array of Market objects
   * ```
   */
  async getEvent(eventId: string, withNestedMarkets?: boolean): Promise<Event> {
    return this.http.get<Event>(`/event/${eventId}`, {
      withNestedMarkets,
    });
  }

  /**
   * List events with optional filtering.
   *
   * @param params - Optional filter parameters
   * @param params.status - Filter by event status ('active', 'closed', etc.)
   * @param params.seriesTickers - Filter by series tickers (comma-separated, max 25)
   * @param params.isInitialized - Filter events that are initialized
   * @param params.sort - Sort field (volume, volume24h, liquidity, openInterest, startDate)
   * @param params.limit - Maximum number of events to return
   * @param params.cursor - Pagination cursor (number of events to skip)
   * @param params.withNestedMarkets - Include nested markets in response
   * @returns Paginated list of events
   *
   * @example
   * ```typescript
   * // Get all active events sorted by volume
   * const { events, cursor } = await dflow.events.getEvents({
   *   status: 'active',
   *   sort: 'volume',
   * });
   *
   * // Get events for specific series
   * const btcEvents = await dflow.events.getEvents({
   *   seriesTickers: 'KXBTC,KXETH',
   *   limit: 50,
   * });
   *
   * // Get initialized events only
   * const initialized = await dflow.events.getEvents({
   *   isInitialized: true,
   * });
   *
   * // Paginate through results
   * const nextPage = await dflow.events.getEvents({ cursor });
   * ```
   */
  async getEvents(params?: EventsParams): Promise<EventsResponse> {
    return this.http.get<EventsResponse>('/events', params);
  }

  /**
   * Get forecast percentile history for an event.
   *
   * Returns historical raw and formatted forecast numbers for an event at specific percentiles.
   * This endpoint relays the response directly from the Kalshi API.
   *
   * @param seriesTicker - The series ticker (e.g., 'KXBTC')
   * @param eventId - The event identifier within the series
   * @param params - Required parameters for the forecast query
   * @param params.percentiles - Comma-separated list of percentile values (0-10000, max 10 values)
   * @param params.startTs - Start timestamp for the range (Unix timestamp)
   * @param params.endTs - End timestamp for the range (Unix timestamp)
   * @param params.periodInterval - Period interval in minutes (0, 1, 60, or 1440)
   * @returns Forecast history with percentile data points
   *
   * @example
   * ```typescript
   * const history = await dflow.events.getEventForecastHistory('KXBTC', 'event-123', {
   *   percentiles: '2500,5000,7500',  // 25th, 50th, 75th percentiles
   *   startTs: 1704067200,  // Jan 1, 2024
   *   endTs: 1704153600,    // Jan 2, 2024
   *   periodInterval: 60,   // 1 hour intervals
   * });
   * ```
   */
  async getEventForecastHistory(
    seriesTicker: string,
    eventId: string,
    params: ForecastHistoryParams
  ): Promise<ForecastHistory> {
    return this.http.get<ForecastHistory>(
      `/event/${seriesTicker}/${eventId}/forecast_percentile_history`,
      params
    );
  }

  /**
   * Get forecast percentile history for an event by its mint address.
   *
   * Looks up the event from a market mint address and returns historical forecast data.
   * This endpoint relays the response directly from the Kalshi API.
   *
   * @param mintAddress - Any mint address associated with the market (ledger or outcome mint)
   * @param params - Required parameters for the forecast query
   * @param params.percentiles - Comma-separated list of percentile values (0-10000, max 10 values)
   * @param params.startTs - Start timestamp for the range (Unix timestamp)
   * @param params.endTs - End timestamp for the range (Unix timestamp)
   * @param params.periodInterval - Period interval in minutes (0, 1, 60, or 1440)
   * @returns Forecast history with percentile data points
   *
   * @example
   * ```typescript
   * const history = await dflow.events.getEventForecastByMint('EPjFWdd5...', {
   *   percentiles: '5000',  // 50th percentile (median)
   *   startTs: 1704067200,
   *   endTs: 1704153600,
   *   periodInterval: 1440,  // Daily intervals
   * });
   * ```
   */
  async getEventForecastByMint(
    mintAddress: string,
    params: ForecastHistoryParams
  ): Promise<ForecastHistory> {
    return this.http.get<ForecastHistory>(
      `/event/by-mint/${mintAddress}/forecast_percentile_history`,
      params
    );
  }

  /**
   * Get OHLCV candlestick data for an event.
   *
   * Relays event candlesticks from the Kalshi API. Automatically resolves
   * the series_ticker from the event ticker.
   *
   * @param ticker - The event ticker
   * @param params - Required candlestick parameters
   * @param params.startTs - Start timestamp (Unix timestamp in seconds)
   * @param params.endTs - End timestamp (Unix timestamp in seconds)
   * @param params.periodInterval - Time period length of each candlestick in minutes (1, 60, or 1440)
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.events.getEventCandlesticks('BTCD-25DEC0313', {
   *   startTs: 1704067200,    // Jan 1, 2024
   *   endTs: 1704153600,      // Jan 2, 2024
   *   periodInterval: 60,     // 1 hour candles
   * });
   * candles.forEach(c => {
   *   console.log(`Open: ${c.open}, High: ${c.high}, Low: ${c.low}, Close: ${c.close}`);
   * });
   * ```
   */
  async getEventCandlesticks(
    ticker: string,
    params: CandlestickParams
  ): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/event/${ticker}/candlesticks`,
      params
    );
    return response.candlesticks;
  }
}
