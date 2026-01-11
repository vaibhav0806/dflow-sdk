/**
 * A milestone data point from live data.
 */
export interface LiveDataMilestone {
  /** Unique milestone identifier */
  id: string;
  /** Display name of the milestone */
  name: string;
  /** Current value of the milestone */
  value?: string | number;
  /** Timestamp of the data */
  timestamp?: string;
}

/**
 * Live data for an event or market.
 */
export interface LiveData {
  /** Event ticker (if applicable) */
  eventTicker?: string;
  /** Array of milestone data points */
  milestones: LiveDataMilestone[];
}

/**
 * Response from the live data endpoint.
 */
export interface LiveDataResponse {
  /** Array of live data */
  data: LiveData[];
}

/**
 * Parameters for fetching live data.
 */
export interface LiveDataParams {
  /** 
   * Array of milestone IDs (max 100).
   * Required parameter.
   */
  milestoneIds: string[];
}

/**
 * Filter parameters for live data by event or mint endpoints.
 */
export interface LiveDataFilterParams {
  /** Minimum start date to filter milestones (RFC3339 format) */
  minimumStartDate?: string;
  /** Filter by milestone category */
  category?: string;
  /** Filter by competition */
  competition?: string;
  /** Filter by source ID */
  sourceId?: string;
  /** Filter by milestone type */
  type?: string;
}
