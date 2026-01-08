export interface Series {
  ticker: string;
  title: string;
  category: string;
  tags: string[];
  frequency?: string;
  description?: string;
}

export interface SeriesResponse {
  series: Series[];
}
