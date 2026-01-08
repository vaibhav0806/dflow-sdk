export interface CategoryTags {
  [category: string]: string[];
}

export interface SportsFilter {
  sport: string;
  leagues: string[];
  teams?: string[];
}

export interface SportsFilters {
  sports: SportsFilter[];
}
