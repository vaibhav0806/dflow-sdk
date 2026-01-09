/**
 * Configuration options for the HTTP client.
 */
export interface HttpClientOptions {
  /** Base URL for API requests */
  baseUrl: string;
  /** Optional API key for authenticated requests */
  apiKey?: string;
  /** Optional additional headers to include in all requests */
  headers?: Record<string, string>;
}

/**
 * Custom error class for DFlow API errors.
 *
 * Thrown when the API returns a non-2xx status code.
 * Contains the HTTP status code and response body for debugging.
 *
 * @example
 * ```typescript
 * import { DFlowApiError } from 'dflow-sdk';
 *
 * try {
 *   const market = await dflow.markets.getMarket('invalid-ticker');
 * } catch (error) {
 *   if (error instanceof DFlowApiError) {
 *     console.error(`API Error ${error.statusCode}: ${error.message}`);
 *     console.error('Response:', error.response);
 *   }
 * }
 * ```
 */
export class DFlowApiError extends Error {
  /**
   * Create a new API error.
   *
   * @param message - Error message
   * @param statusCode - HTTP status code from the response
   * @param response - Parsed response body (if available)
   */
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'DFlowApiError';
  }
}

/**
 * Internal HTTP client for making API requests.
 *
 * Handles request construction, authentication headers, and response parsing.
 * Used internally by all API classes.
 */
export class HttpClient {
  private baseUrl: string;
  private apiKey?: string;
  private defaultHeaders: Record<string, string>;

  /**
   * Create a new HTTP client.
   *
   * @param options - Client configuration
   */
  constructor(options: HttpClientOptions) {
    // Ensure baseUrl ends with /
    this.baseUrl = options.baseUrl.endsWith('/') ? options.baseUrl : options.baseUrl + '/';
    this.apiKey = options.apiKey;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  private buildUrl(path: string, params?: object): string {
    // Remove leading slash from path to avoid URL resolution issues
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(cleanPath, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make a GET request.
   *
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns Parsed JSON response
   * @throws {@link DFlowApiError} if the request fails
   */
  async get<T>(path: string, params?: object): Promise<T> {
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request.
   *
   * @param path - API endpoint path
   * @param body - Optional request body (will be JSON serialized)
   * @returns Parsed JSON response
   * @throws {@link DFlowApiError} if the request fails
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = JSON.parse(text);
      } catch {
        errorBody = text;
      }

      throw new DFlowApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new DFlowApiError(
        `Failed to parse response as JSON`,
        response.status,
        text
      );
    }
  }

  /**
   * Update the API key for subsequent requests.
   *
   * @param apiKey - New API key to use
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}
