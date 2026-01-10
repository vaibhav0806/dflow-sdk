import type { HttpClient } from '../../utils/http.js';
import type {
  Event,
  EventsParams,
  EventsResponse,
  ForecastHistory,
  Candlestick,
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
   * @param eventId - The unique identifier of the event
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
   * @param params.seriesTicker - Filter by series ticker (e.g., 'KXBTC')
   * @param params.limit - Maximum number of events to return
   * @param params.cursor - Pagination cursor from previous response
   * @returns Paginated list of events
   *
   * @example
   * ```typescript
   * // Get all active events
   * const { events, cursor } = await dflow.events.getEvents({ status: 'active' });
   *
   * // Get events for a specific series
   * const btcEvents = await dflow.events.getEvents({
   *   seriesTicker: 'KXBTC',
   *   limit: 50,
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
   * Returns historical forecast data showing how predictions have changed over time.
   *
   * @param seriesTicker - The series ticker (e.g., 'KXBTC')
   * @param eventId - The event identifier within the series
   * @returns Forecast history with percentile data points
   *
   * @example
   * ```typescript
   * const history = await dflow.events.getEventForecastHistory('KXBTC', 'event-123');
   * console.log(history.dataPoints); // Historical forecast values
   * ```
   */
  async getEventForecastHistory(
    seriesTicker: string,
    eventId: string
  ): Promise<ForecastHistory> {
    return this.http.get<ForecastHistory>(
      `/event/${seriesTicker}/${eventId}/forecast_percentile_history`
    );
  }

  /**
   * Get forecast percentile history for an event by its mint address.
   *
   * Alternative to {@link getEventForecastHistory} when you have the mint address
   * instead of series ticker and event ID.
   *
   * @param mintAddress - The Solana mint address of the event's outcome token
   * @returns Forecast history with percentile data points
   *
   * @example
   * ```typescript
   * const history = await dflow.events.getEventForecastByMint('EPjFWdd5...');
   * ```
   */
  async getEventForecastByMint(mintAddress: string): Promise<ForecastHistory> {
    return this.http.get<ForecastHistory>(
      `/event/by-mint/${mintAddress}/forecast_percentile_history`
    );
  }

  /**
   * Get OHLCV candlestick data for an event.
   *
   * Returns price history in candlestick format for charting.
   *
   * @param ticker - The event ticker
   * @returns Array of candlestick data points
   *
   * @example
   * ```typescript
   * const candles = await dflow.events.getEventCandlesticks('BTCD-25DEC0313');
   * candles.forEach(c => {
   *   console.log(`Open: ${c.open}, High: ${c.high}, Low: ${c.low}, Close: ${c.close}`);
   * });
   * ```
   */
  async getEventCandlesticks(ticker: string): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/event/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }
}
