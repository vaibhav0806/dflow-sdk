export interface HttpClientOptions {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export class DFlowApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'DFlowApiError';
  }
}

export class HttpClient {
  private baseUrl: string;
  private apiKey?: string;
  private defaultHeaders: Record<string, string>;

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

  async get<T>(path: string, params?: object): Promise<T> {
    const url = this.buildUrl(path, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

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

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}
