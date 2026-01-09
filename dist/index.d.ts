import { Connection, Keypair, Commitment, PublicKey } from '@solana/web3.js';

interface HttpClientOptions {
    baseUrl: string;
    apiKey?: string;
    headers?: Record<string, string>;
}
declare class DFlowApiError extends Error {
    statusCode: number;
    response?: unknown | undefined;
    constructor(message: string, statusCode: number, response?: unknown | undefined);
}
declare class HttpClient {
    private baseUrl;
    private apiKey?;
    private defaultHeaders;
    constructor(options: HttpClientOptions);
    private getHeaders;
    private buildUrl;
    get<T>(path: string, params?: object): Promise<T>;
    post<T>(path: string, body?: unknown): Promise<T>;
    private handleResponse;
    setApiKey(apiKey: string): void;
}

interface PaginatedResponse<T> {
    cursor?: string;
    data: T[];
}
interface PaginationParams {
    cursor?: string;
    limit?: number;
}
interface Candlestick {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
type CandlestickPeriod = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

interface Series {
    ticker: string;
    title: string;
    category: string;
    tags: string[];
    frequency?: string;
    description?: string;
}
interface SeriesResponse {
    series: Series[];
}

type MarketStatus = 'initialized' | 'active' | 'inactive' | 'closed' | 'determined' | 'finalized';
type MarketResult = 'yes' | 'no' | '';
type RedemptionStatus = 'open' | 'closed';
interface MarketAccount {
    yesMint: string;
    noMint: string;
    marketLedger: string;
    redemptionStatus: RedemptionStatus;
    scalarOutcomePct?: number;
}
interface Market {
    ticker: string;
    title: string;
    subtitle?: string;
    eventTicker: string;
    status: MarketStatus;
    result: MarketResult;
    yesPrice?: number;
    noPrice?: number;
    volume?: number;
    volume24h?: number;
    openInterest?: number;
    liquidity?: number;
    openTime?: string;
    closeTime?: string;
    expirationTime?: string;
    accounts: Record<string, MarketAccount>;
    rules?: string;
}
interface MarketsParams extends PaginationParams {
    status?: MarketStatus;
    eventTicker?: string;
    seriesTicker?: string;
}
interface MarketsResponse {
    cursor?: string;
    markets: Market[];
}
interface MarketsBatchParams {
    tickers?: string[];
    mints?: string[];
}
interface MarketsBatchResponse {
    markets: Market[];
}
interface OutcomeMintsResponse {
    outcomeMints: string[];
}
interface FilterOutcomeMintsParams {
    addresses: string[];
}
interface FilterOutcomeMintsResponse {
    outcomeMints: string[];
}

interface Event {
    ticker: string;
    title: string;
    subtitle?: string;
    seriesTicker: string;
    category?: string;
    mutuallyExclusive?: boolean;
    markets?: Market[];
}
interface EventsParams extends PaginationParams {
    status?: string;
    seriesTicker?: string;
    withNestedMarkets?: boolean;
}
interface EventsResponse {
    cursor?: string;
    events: Event[];
}
interface ForecastHistoryPoint {
    timestamp: number;
    yesPrice: number;
    noPrice: number;
    percentile?: number;
}
interface ForecastHistory {
    eventTicker: string;
    history: ForecastHistoryPoint[];
}

interface OrderbookLevel {
    price: number;
    quantity: number;
}
interface Orderbook {
    marketTicker: string;
    timestamp: number;
    yesAsk: OrderbookLevel[];
    yesBid: OrderbookLevel[];
    noAsk: OrderbookLevel[];
    noBid: OrderbookLevel[];
}

type TradeSide = 'yes' | 'no';
type TradeAction = 'buy' | 'sell';
interface Trade {
    id: string;
    marketTicker: string;
    side: TradeSide;
    action: TradeAction;
    price: number;
    quantity: number;
    timestamp: string;
    takerAddress?: string;
    makerAddress?: string;
}
interface TradesParams extends PaginationParams {
    marketTicker?: string;
    startTimestamp?: string;
    endTimestamp?: string;
}
interface TradesResponse {
    cursor?: string;
    trades: Trade[];
}

type ExecutionMode = 'sync' | 'async';
type OrderStatusType = 'open' | 'closed' | 'failed' | 'pendingClose';
interface OrderParams {
    inputMint: string;
    outputMint: string;
    amount: number | string;
    slippageBps: number;
    userPublicKey: string;
    platformFeeBps?: number;
    platformFeeAccount?: string;
}
interface OrderResponse {
    transaction: string;
    inAmount: string;
    outAmount: string;
    executionMode: ExecutionMode;
    priceImpactPct?: number;
}
interface OrderStatusResponse {
    status: OrderStatusType;
    signature: string;
    inAmount?: string;
    outAmount?: string;
    fills?: OrderFill[];
    error?: string;
}
interface OrderFill {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    price: number;
    timestamp: string;
}
interface QuoteParams {
    inputMint: string;
    outputMint: string;
    amount: number | string;
    slippageBps?: number;
}
interface SwapQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    priceImpactPct: number;
    routePlan?: RoutePlanStep[];
}
interface RoutePlanStep {
    swapInfo: {
        ammKey: string;
        label: string;
        inputMint: string;
        outputMint: string;
        inAmount: string;
        outAmount: string;
        feeAmount: string;
        feeMint: string;
    };
    percent: number;
}
interface SwapParams extends QuoteParams {
    userPublicKey: string;
    wrapUnwrapSol?: boolean;
    priorityFee?: PriorityFeeConfig;
}
interface SwapResponse {
    swapTransaction: string;
    lastValidBlockHeight?: number;
    prioritizationFeeLamports?: number;
    computeUnitLimit?: number;
    prioritizationType?: string;
    quote?: SwapQuote;
}
interface SwapInstructionsResponse {
    setupInstructions: SerializedInstruction[];
    swapInstruction: SerializedInstruction;
    cleanupInstruction?: SerializedInstruction;
    addressLookupTableAddresses: string[];
}
interface SerializedInstruction {
    programId: string;
    accounts: {
        pubkey: string;
        isSigner: boolean;
        isWritable: boolean;
    }[];
    data: string;
}
interface IntentQuoteParams {
    inputMint: string;
    outputMint: string;
    amount: number | string;
    mode: 'ExactIn' | 'ExactOut';
}
interface IntentQuote {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    minOutAmount: string;
    maxInAmount: string;
    expiresAt: string;
}
interface SubmitIntentParams {
    userPublicKey: string;
    inputMint: string;
    outputMint: string;
    amount: number | string;
    mode: 'ExactIn' | 'ExactOut';
    slippageBps?: number;
    priorityFee?: PriorityFeeConfig;
}
interface IntentResponse {
    transaction: string;
    intentId: string;
    quote: IntentQuote;
}
interface PriorityFeeConfig {
    type: 'exact' | 'max';
    amount: number;
}
interface PredictionMarketInitParams {
    marketTicker: string;
    userPublicKey: string;
    settlementMint?: string;
}
interface PredictionMarketInitResponse {
    transaction: string;
    yesMint: string;
    noMint: string;
}

type WebSocketChannel = 'prices' | 'trades' | 'orderbook';
interface WebSocketSubscribeMessage {
    type: 'subscribe';
    channel: WebSocketChannel;
    all?: boolean;
    tickers?: string[];
}
interface WebSocketUnsubscribeMessage {
    type: 'unsubscribe';
    channel: WebSocketChannel;
    all?: boolean;
    tickers?: string[];
}
type WebSocketMessage = WebSocketSubscribeMessage | WebSocketUnsubscribeMessage;
interface PriceUpdate {
    channel: 'prices';
    ticker: string;
    timestamp: number;
    yesPrice: number;
    noPrice: number;
    yesBid?: number;
    yesAsk?: number;
    noBid?: number;
    noAsk?: number;
}
interface TradeUpdate {
    channel: 'trades';
    ticker: string;
    timestamp: number;
    side: 'yes' | 'no';
    price: number;
    quantity: number;
    tradeId: string;
}
interface OrderbookUpdate {
    channel: 'orderbook';
    ticker: string;
    timestamp: number;
    yesAsk: Array<{
        price: number;
        quantity: number;
    }>;
    yesBid: Array<{
        price: number;
        quantity: number;
    }>;
    noAsk: Array<{
        price: number;
        quantity: number;
    }>;
    noBid: Array<{
        price: number;
        quantity: number;
    }>;
}
type WebSocketUpdate = PriceUpdate | TradeUpdate | OrderbookUpdate;
interface WebSocketOptions {
    url?: string;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

interface LiveDataMilestone {
    id: string;
    name: string;
    value?: string | number;
    timestamp?: string;
}
interface LiveData {
    eventTicker?: string;
    milestones: LiveDataMilestone[];
}
interface LiveDataResponse {
    data: LiveData[];
}

interface CategoryTags {
    [category: string]: string[];
}
interface SportsFilter {
    sport: string;
    leagues: string[];
    teams?: string[];
}
interface SportsFilters {
    sports: SportsFilter[];
}

interface SearchParams {
    query: string;
    limit?: number;
}
interface SearchResult {
    events: Event[];
}

type PositionType = 'YES' | 'NO' | 'UNKNOWN';
interface TokenBalance {
    mint: string;
    rawBalance: string;
    balance: number;
    decimals: number;
}
interface UserPosition {
    mint: string;
    balance: number;
    decimals: number;
    position: PositionType;
    market: Market | null;
}
interface RedemptionResult {
    signature: string;
    inputAmount: string;
    outputAmount: string;
    outcomeMint: string;
    settlementMint: string;
}
interface TransactionConfirmation {
    signature: string;
    slot: number;
    confirmationStatus: 'processed' | 'confirmed' | 'finalized';
    err: unknown | null;
}

interface Token {
    mint: string;
    symbol: string;
    name: string;
    logoUri?: string;
}
interface TokenWithDecimals extends Token {
    decimals: number;
}

interface Venue {
    id: string;
    name: string;
    label: string;
}

declare class EventsAPI {
    private http;
    constructor(http: HttpClient);
    getEvent(eventId: string, withNestedMarkets?: boolean): Promise<Event>;
    getEvents(params?: EventsParams): Promise<EventsResponse>;
    getEventForecastHistory(seriesTicker: string, eventId: string): Promise<ForecastHistory>;
    getEventForecastByMint(mintAddress: string): Promise<ForecastHistory>;
    getEventCandlesticks(ticker: string): Promise<Candlestick[]>;
}

declare class MarketsAPI {
    private http;
    constructor(http: HttpClient);
    getMarket(marketId: string): Promise<Market>;
    getMarketByMint(mintAddress: string): Promise<Market>;
    getMarkets(params?: MarketsParams): Promise<MarketsResponse>;
    getMarketsBatch(params: MarketsBatchParams): Promise<Market[]>;
    getOutcomeMints(): Promise<string[]>;
    filterOutcomeMints(addresses: string[]): Promise<string[]>;
    getMarketCandlesticks(ticker: string): Promise<Candlestick[]>;
    getMarketCandlesticksByMint(mintAddress: string): Promise<Candlestick[]>;
}

declare class OrderbookAPI {
    private http;
    constructor(http: HttpClient);
    getOrderbook(marketTicker: string): Promise<Orderbook>;
    getOrderbookByMint(mintAddress: string): Promise<Orderbook>;
}

declare class TradesAPI {
    private http;
    constructor(http: HttpClient);
    getTrades(params?: TradesParams): Promise<TradesResponse>;
    getTradesByMint(mintAddress: string, params?: Omit<TradesParams, 'marketTicker'>): Promise<TradesResponse>;
}

declare class LiveDataAPI {
    private http;
    constructor(http: HttpClient);
    getLiveData(milestones: string[]): Promise<LiveData[]>;
    getLiveDataByEvent(eventTicker: string): Promise<LiveData>;
    getLiveDataByMint(mintAddress: string): Promise<LiveData>;
}

declare class SeriesAPI {
    private http;
    constructor(http: HttpClient);
    getSeries(): Promise<Series[]>;
    getSeriesByTicker(ticker: string): Promise<Series>;
}

declare class TagsAPI {
    private http;
    constructor(http: HttpClient);
    getTagsByCategories(): Promise<CategoryTags>;
}

declare class SportsAPI {
    private http;
    constructor(http: HttpClient);
    getFiltersBySports(): Promise<SportsFilters>;
}

declare class SearchAPI {
    private http;
    constructor(http: HttpClient);
    search(params: SearchParams): Promise<SearchResult>;
}

declare class OrdersAPI {
    private http;
    constructor(http: HttpClient);
    getOrder(params: OrderParams): Promise<OrderResponse>;
    getOrderStatus(signature: string): Promise<OrderStatusResponse>;
}

declare class SwapAPI {
    private http;
    constructor(http: HttpClient);
    getQuote(params: QuoteParams): Promise<SwapQuote>;
    createSwap(params: SwapParams): Promise<SwapResponse>;
    getSwapInstructions(params: SwapParams): Promise<SwapInstructionsResponse>;
}

declare class IntentAPI {
    private http;
    constructor(http: HttpClient);
    getIntentQuote(params: IntentQuoteParams): Promise<IntentQuote>;
    submitIntent(params: SubmitIntentParams): Promise<IntentResponse>;
}

declare class PredictionMarketAPI {
    private http;
    constructor(http: HttpClient);
    initializeMarket(params: PredictionMarketInitParams): Promise<PredictionMarketInitResponse>;
}

declare class TokensAPI {
    private http;
    constructor(http: HttpClient);
    getTokens(): Promise<Token[]>;
    getTokensWithDecimals(): Promise<TokenWithDecimals[]>;
}

declare class VenuesAPI {
    private http;
    constructor(http: HttpClient);
    getVenues(): Promise<Venue[]>;
}

type MessageCallback<T> = (data: T) => void;
type ErrorCallback = (error: Error) => void;
type CloseCallback = (event: CloseEvent) => void;
declare class DFlowWebSocket {
    private ws;
    private url;
    private reconnect;
    private reconnectInterval;
    private maxReconnectAttempts;
    private reconnectAttempts;
    private isConnecting;
    private priceCallbacks;
    private tradeCallbacks;
    private orderbookCallbacks;
    private errorCallbacks;
    private closeCallbacks;
    constructor(options?: WebSocketOptions);
    connect(): Promise<void>;
    disconnect(): void;
    private attemptReconnect;
    private handleMessage;
    private send;
    subscribePrices(tickers: string[]): void;
    subscribeAllPrices(): void;
    subscribeTrades(tickers: string[]): void;
    subscribeAllTrades(): void;
    subscribeOrderbook(tickers: string[]): void;
    subscribeAllOrderbook(): void;
    unsubscribe(channel: WebSocketChannel, tickers?: string[]): void;
    onPrice(callback: MessageCallback<PriceUpdate>): () => void;
    onTrade(callback: MessageCallback<TradeUpdate>): () => void;
    onOrderbook(callback: MessageCallback<OrderbookUpdate>): () => void;
    onError(callback: ErrorCallback): () => void;
    onClose(callback: CloseCallback): () => void;
    get isConnected(): boolean;
}

/**
 * Environment type for DFlow API endpoints.
 * - 'development': Uses dev endpoints, no API key required. Good for testing with real capital against Kalshi.
 * - 'production': Uses prod endpoints, API key required. For production deployments.
 */
type DFlowEnvironment = 'development' | 'production';
/**
 * Configuration options for the DFlow client.
 */
interface DFlowClientOptions {
    /**
     * Environment to use. Defaults to 'development'.
     * - 'development': No API key required, uses dev-*.dflow.net endpoints
     * - 'production': API key required, uses *.dflow.net endpoints
     */
    environment?: DFlowEnvironment;
    /** API key for authenticated endpoints (required for production) */
    apiKey?: string;
    /** Custom base URL for the metadata API (overrides environment setting) */
    metadataBaseUrl?: string;
    /** Custom base URL for the trade API (overrides environment setting) */
    tradeBaseUrl?: string;
    /** WebSocket connection options */
    wsOptions?: WebSocketOptions;
}
/**
 * Main client for interacting with the DFlow prediction markets platform.
 *
 * @example
 * ```typescript
 * import { DFlowClient } from 'dflow-sdk';
 *
 * // Development (default) - no API key required
 * // Uses dev-*.dflow.net endpoints for testing with real capital
 * const dflow = new DFlowClient();
 * const markets = await dflow.markets.getMarkets();
 *
 * // Production - API key required
 * // Uses *.dflow.net endpoints for production deployments
 * const dflow = new DFlowClient({
 *   environment: 'production',
 *   apiKey: 'your-api-key',
 * });
 *
 * // Get a quote and trade
 * const quote = await dflow.swap.getQuote({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 * });
 * ```
 */
declare class DFlowClient {
    private metadataHttp;
    private tradeHttp;
    /** API for discovering and querying prediction events */
    readonly events: EventsAPI;
    /** API for market data, pricing, and batch queries */
    readonly markets: MarketsAPI;
    /** API for orderbook snapshots */
    readonly orderbook: OrderbookAPI;
    /** API for historical trade data */
    readonly trades: TradesAPI;
    /** API for real-time milestone data */
    readonly liveData: LiveDataAPI;
    /** API for series/category information */
    readonly series: SeriesAPI;
    /** API for tag-based filtering */
    readonly tags: TagsAPI;
    /** API for sports-specific filters */
    readonly sports: SportsAPI;
    /** API for searching events and markets */
    readonly search: SearchAPI;
    /** API for order creation and status (requires API key) */
    readonly orders: OrdersAPI;
    /** API for imperative swaps with route preview (requires API key) */
    readonly swap: SwapAPI;
    /** API for declarative intent-based swaps (requires API key) */
    readonly intent: IntentAPI;
    /** API for prediction market initialization (requires API key) */
    readonly predictionMarket: PredictionMarketAPI;
    /** API for token information */
    readonly tokens: TokensAPI;
    /** API for trading venue information */
    readonly venues: VenuesAPI;
    /** WebSocket client for real-time price, trade, and orderbook updates */
    readonly ws: DFlowWebSocket;
    /**
     * Create a new DFlow client instance.
     *
     * @param options - Client configuration options
     */
    constructor(options?: DFlowClientOptions);
    /**
     * Update the API key for both metadata and trade HTTP clients.
     * Useful for setting the key after initialization or rotating keys.
     *
     * @param apiKey - The new API key to use
     *
     * @example
     * ```typescript
     * const dflow = new DFlowClient();
     *
     * // Browse markets without auth
     * const markets = await dflow.markets.getMarkets();
     *
     * // Set API key when user logs in
     * dflow.setApiKey('user-api-key');
     *
     * // Now can use authenticated endpoints
     * const quote = await dflow.swap.getQuote(params);
     * ```
     */
    setApiKey(apiKey: string): void;
}

declare function signAndSendTransaction(connection: Connection, transactionBase64: string, signer: Keypair): Promise<string>;
declare function waitForConfirmation(connection: Connection, signature: string, commitment?: Commitment, timeoutMs?: number): Promise<TransactionConfirmation>;
declare function signSendAndConfirm(connection: Connection, transactionBase64: string, signer: Keypair, commitment?: Commitment): Promise<TransactionConfirmation>;

declare function getTokenBalances(connection: Connection, walletAddress: PublicKey): Promise<TokenBalance[]>;
declare function getUserPositions(connection: Connection, walletAddress: PublicKey, marketsAPI: MarketsAPI): Promise<UserPosition[]>;
declare function isRedemptionEligible(market: Market, outcomeMint: string): boolean;
declare function calculateScalarPayout(market: Market, outcomeMint: string, amount: number): number;

interface RetryOptions {
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
declare function defaultShouldRetry(error: unknown, _attempt: number): boolean;
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
declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
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
declare function createRetryable<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>, options?: RetryOptions): (...args: TArgs) => Promise<TResult>;

interface PaginateOptions<TResponse, TItem> {
    /** Maximum number of items to fetch in total (default: unlimited) */
    maxItems?: number;
    /** Number of items per page (default: API default, usually 50) */
    pageSize?: number;
    /**
     * Function to extract items array from response.
     * Required because different APIs use different field names (markets, events, data, etc.)
     */
    getItems: (response: TResponse) => TItem[];
    /** Function to extract cursor from response (default: response.cursor) */
    getCursor?: (response: TResponse) => string | undefined;
}
/**
 * Create an async iterator that automatically paginates through all results.
 *
 * @example
 * ```typescript
 * import { paginate } from 'dflow-sdk';
 *
 * // Iterate through all markets
 * for await (const market of paginate(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets }
 * )) {
 *   console.log(market.ticker, market.yesPrice);
 * }
 *
 * // Iterate through all events
 * for await (const event of paginate(
 *   (params) => dflow.events.getEvents({ ...params, status: 'active' }),
 *   { getItems: (r) => r.events, maxItems: 100 }
 * )) {
 *   console.log(event.title);
 * }
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @yields Individual items from each page
 */
declare function paginate<TResponse extends {
    cursor?: string;
}, TItem>(fetchPage: (params: PaginationParams) => Promise<TResponse>, options: PaginateOptions<TResponse, TItem>): AsyncGenerator<TItem, void, undefined>;
/**
 * Collect all items from a paginated endpoint into an array.
 *
 * @example
 * ```typescript
 * import { collectAll } from 'dflow-sdk';
 *
 * // Get all markets as an array
 * const allMarkets = await collectAll(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets }
 * );
 *
 * console.log(`Found ${allMarkets.length} markets`);
 *
 * // With a limit
 * const first100 = await collectAll(
 *   (params) => dflow.events.getEvents(params),
 *   { getItems: (r) => r.events, maxItems: 100 }
 * );
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @returns Array of all items
 */
declare function collectAll<TResponse extends {
    cursor?: string;
}, TItem>(fetchPage: (params: PaginationParams) => Promise<TResponse>, options: PaginateOptions<TResponse, TItem>): Promise<TItem[]>;
/**
 * Count total items from a paginated endpoint without storing them.
 *
 * @example
 * ```typescript
 * import { countAll } from 'dflow-sdk';
 *
 * const totalMarkets = await countAll(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets }
 * );
 *
 * console.log(`Total markets: ${totalMarkets}`);
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @returns Total count of items
 */
declare function countAll<TResponse extends {
    cursor?: string;
}, TItem>(fetchPage: (params: PaginationParams) => Promise<TResponse>, options: PaginateOptions<TResponse, TItem>): Promise<number>;
/**
 * Find the first item matching a predicate from a paginated endpoint.
 *
 * @example
 * ```typescript
 * import { findFirst } from 'dflow-sdk';
 *
 * // Find a specific market by title
 * const market = await findFirst(
 *   (params) => dflow.markets.getMarkets(params),
 *   { getItems: (r) => r.markets },
 *   (m) => m.title.includes('Bitcoin')
 * );
 *
 * if (market) {
 *   console.log('Found:', market.ticker);
 * }
 * ```
 *
 * @param fetchPage - Function that fetches a page given pagination params
 * @param options - Pagination options including item extractor
 * @param predicate - Function to test each item
 * @returns The first matching item, or undefined if not found
 */
declare function findFirst<TResponse extends {
    cursor?: string;
}, TItem>(fetchPage: (params: PaginationParams) => Promise<TResponse>, options: PaginateOptions<TResponse, TItem>, predicate: (item: TItem) => boolean): Promise<TItem | undefined>;

declare const METADATA_API_BASE_URL = "https://dev-prediction-markets-api.dflow.net/api/v1";
declare const TRADE_API_BASE_URL = "https://dev-quote-api.dflow.net";
declare const WEBSOCKET_URL = "wss://dev-prediction-markets-api.dflow.net/api/v1/ws";
declare const PROD_METADATA_API_BASE_URL = "https://prediction-markets-api.dflow.net/api/v1";
declare const PROD_TRADE_API_BASE_URL = "https://quote-api.dflow.net";
declare const PROD_WEBSOCKET_URL = "wss://prediction-markets-api.dflow.net/api/v1/ws";
declare const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
declare const SOL_MINT = "So11111111111111111111111111111111111111112";
declare const DEFAULT_SLIPPAGE_BPS = 50;
declare const MAX_BATCH_SIZE = 100;
declare const MAX_FILTER_ADDRESSES = 200;
declare const OUTCOME_TOKEN_DECIMALS = 6;

export { type Candlestick, type CandlestickPeriod, type CategoryTags, DEFAULT_SLIPPAGE_BPS, DFlowApiError, DFlowClient, type DFlowClientOptions, type DFlowEnvironment, DFlowWebSocket, type Event, EventsAPI, type EventsParams, type EventsResponse, type ExecutionMode, type FilterOutcomeMintsParams, type FilterOutcomeMintsResponse, type ForecastHistory, type ForecastHistoryPoint, HttpClient, IntentAPI, type IntentQuote, type IntentQuoteParams, type IntentResponse, type LiveData, LiveDataAPI, type LiveDataMilestone, type LiveDataResponse, MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES, METADATA_API_BASE_URL, type Market, type MarketAccount, type MarketResult, type MarketStatus, MarketsAPI, type MarketsBatchParams, type MarketsBatchResponse, type MarketsParams, type MarketsResponse, OUTCOME_TOKEN_DECIMALS, type OrderFill, type OrderParams, type OrderResponse, type OrderStatusResponse, type OrderStatusType, type Orderbook, OrderbookAPI, type OrderbookLevel, type OrderbookUpdate, OrdersAPI, type OutcomeMintsResponse, PROD_METADATA_API_BASE_URL, PROD_TRADE_API_BASE_URL, PROD_WEBSOCKET_URL, type PaginateOptions, type PaginatedResponse, type PaginationParams, type PositionType, PredictionMarketAPI, type PredictionMarketInitParams, type PredictionMarketInitResponse, type PriceUpdate, type PriorityFeeConfig, type QuoteParams, type RedemptionResult, type RedemptionStatus, type RetryOptions, type RoutePlanStep, SOL_MINT, SearchAPI, type SearchParams, type SearchResult, type SerializedInstruction, type Series, SeriesAPI, type SeriesResponse, SportsAPI, type SportsFilter, type SportsFilters, type SubmitIntentParams, SwapAPI, type SwapInstructionsResponse, type SwapParams, type SwapQuote, type SwapResponse, TRADE_API_BASE_URL, TagsAPI, type Token, type TokenBalance, type TokenWithDecimals, TokensAPI, type Trade, type TradeAction, type TradeSide, type TradeUpdate, TradesAPI, type TradesParams, type TradesResponse, type TransactionConfirmation, USDC_MINT, type UserPosition, type Venue, VenuesAPI, WEBSOCKET_URL, type WebSocketChannel, type WebSocketMessage, type WebSocketOptions, type WebSocketSubscribeMessage, type WebSocketUnsubscribeMessage, type WebSocketUpdate, calculateScalarPayout, collectAll, countAll, createRetryable, defaultShouldRetry, findFirst, getTokenBalances, getUserPositions, isRedemptionEligible, paginate, signAndSendTransaction, signSendAndConfirm, waitForConfirmation, withRetry };
