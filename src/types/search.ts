import type { Event } from './events.js';

export interface SearchParams {
  query: string;
  limit?: number;
}

export interface SearchResult {
  events: Event[];
}
