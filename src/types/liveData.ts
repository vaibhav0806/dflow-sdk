export interface LiveDataMilestone {
  id: string;
  name: string;
  value?: string | number;
  timestamp?: string;
}

export interface LiveData {
  eventTicker?: string;
  milestones: LiveDataMilestone[];
}

export interface LiveDataResponse {
  data: LiveData[];
}
