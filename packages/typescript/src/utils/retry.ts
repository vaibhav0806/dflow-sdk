import { DFlowApiError } from './http.js';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds between retries (default: 30000) */
  maxDelayMs?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Function to determine if an error should trigger a retry */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Default retry condition: retry on network errors and rate limits (429)
 */
export function defaultShouldRetry(error: unknown, _attempt: number): boolean {
  if (error instanceof DFlowApiError) {
    // Retry on rate limit (429) or server errors (5xx)
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number
): number {
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt);
  const delayWithCap = Math.min(exponentialDelay, maxDelayMs);
  // Add jitter (0-25% of delay) to prevent thundering herd
  const jitter = delayWithCap * Math.random() * 0.25;
  return delayWithCap + jitter;
}

/**
 * Execute a function with automatic retry on failure using exponential backoff.
 *
 * @example
 * ```typescript
 * import { withRetry } from 'dflow-sdk';
 *
 * // Basic usage
 * const markets = await withRetry(() => dflow.markets.getMarkets());
 *
 * // With custom options
 * const events = await withRetry(
 *   () => dflow.events.getEvents({ limit: 100 }),
 *   { maxRetries: 5, initialDelayMs: 500 }
 * );
 *
 * // Custom retry condition
 * const quote = await withRetry(
 *   () => dflow.swap.getQuote(params),
 *   {
 *     shouldRetry: (error) => {
 *       if (error instanceof DFlowApiError) {
 *         return error.statusCode === 429; // Only retry rate limits
 *       }
 *       return false;
 *     }
 *   }
 * );
 * ```
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        const delay = calculateDelay(attempt, initialDelayMs, maxDelayMs, backoffMultiplier);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // No more retries, throw the error
      throw error;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Create a retryable version of an async function.
 *
 * @example
 * ```typescript
 * import { createRetryable } from 'dflow-sdk';
 *
 * const getMarketsWithRetry = createRetryable(
 *   (params) => dflow.markets.getMarkets(params),
 *   { maxRetries: 5 }
 * );
 *
 * const markets = await getMarketsWithRetry({ limit: 50 });
 * ```
 *
 * @param fn - The async function to wrap
 * @param options - Retry configuration options
 * @returns A wrapped function with automatic retry
 */
export function createRetryable<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}
