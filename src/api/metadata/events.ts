import type { HttpClient } from '../../utils/http.js';
import type {
  Event,
  EventsParams,
  EventsResponse,
  ForecastHistory,
  Candlestick,
} from '../../types/index.js';

export class EventsAPI {
  constructor(private http: HttpClient) {}

  async getEvent(eventId: string, withNestedMarkets?: boolean): Promise<Event> {
    return this.http.get<Event>(`/event/${eventId}`, {
      withNestedMarkets,
    });
  }

  async getEvents(params?: EventsParams): Promise<EventsResponse> {
    return this.http.get<EventsResponse>('/events', params);
  }

  async getEventForecastHistory(
    seriesTicker: string,
    eventId: string
  ): Promise<ForecastHistory> {
    return this.http.get<ForecastHistory>(
      `/event/${seriesTicker}/${eventId}/forecast_percentile_history`
    );
  }

  async getEventForecastByMint(mintAddress: string): Promise<ForecastHistory> {
    return this.http.get<ForecastHistory>(
      `/event/by-mint/${mintAddress}/forecast_percentile_history`
    );
  }

  async getEventCandlesticks(ticker: string): Promise<Candlestick[]> {
    const response = await this.http.get<{ candlesticks: Candlestick[] }>(
      `/event/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }
}
