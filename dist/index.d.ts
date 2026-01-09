import { Connection, Keypair, Commitment, PublicKey } from '@solana/web3.js';

/**
 * Configuration options for the HTTP client.
 */
interface HttpClientOptions {
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
declare class DFlowApiError extends Error {
    statusCode: number;
    response?: unknown | undefined;
    /**
     * Create a new API error.
     *
     * @param message - Error message
     * @param statusCode - HTTP status code from the response
     * @param response - Parsed response body (if available)
     */
    constructor(message: string, statusCode: number, response?: unknown | undefined);
}
/**
 * Internal HTTP client for making API requests.
 *
 * Handles request construction, authentication headers, and response parsing.
 * Used internally by all API classes.
 */
declare class HttpClient {
    private baseUrl;
    private apiKey?;
    private defaultHeaders;
    /**
     * Create a new HTTP client.
     *
     * @param options - Client configuration
     */
    constructor(options: HttpClientOptions);
    private getHeaders;
    private buildUrl;
    /**
     * Make a GET request.
     *
     * @param path - API endpoint path
     * @param params - Optional query parameters
     * @returns Parsed JSON response
     * @throws {@link DFlowApiError} if the request fails
     */
    get<T>(path: string, params?: object): Promise<T>;
    /**
     * Make a POST request.
     *
     * @param path - API endpoint path
     * @param body - Optional request body (will be JSON serialized)
     * @returns Parsed JSON response
     * @throws {@link DFlowApiError} if the request fails
     */
    post<T>(path: string, body?: unknown): Promise<T>;
    private handleResponse;
    /**
     * Update the API key for subsequent requests.
     *
     * @param apiKey - New API key to use
     */
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

/**
 * API for discovering and querying prediction market events.
 *
 * Events are the top-level containers for prediction markets. Each event
 * represents a question or outcome to predict (e.g., "Will Bitcoin exceed $100k?")
 * and contains one or more markets for trading.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get active events
 * const { events } = await dflow.events.getEvents({ status: 'active' });
 *
 * // Get a specific event with its markets
 * const event = await dflow.events.getEvent('event-id', true);
 * ```
 */
declare class EventsAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get a single event by its ID.
     *
     * @param eventId - The unique identifier of the event
     * @param withNestedMarkets - If true, includes all markets within the event
     * @returns The event data, optionally with nested markets
     *
     * @example
     * ```typescript
     * // Get event without markets
     * const event = await dflow.events.getEvent('BTCD-25DEC0313');
     *
     * // Get event with all its markets
     * const eventWithMarkets = await dflow.events.getEvent('BTCD-25DEC0313', true);
     * console.log(eventWithMarkets.markets); // Array of Market objects
     * ```
     */
    getEvent(eventId: string, withNestedMarkets?: boolean): Promise<Event>;
    /**
     * List events with optional filtering.
     *
     * @param params - Optional filter parameters
     * @param params.status - Filter by event status ('active', 'closed', etc.)
     * @param params.seriesTicker - Filter by series ticker (e.g., 'KXBTC')
     * @param params.limit - Maximum number of events to return
     * @param params.cursor - Pagination cursor from previous response
     * @returns Paginated list of events
     *
     * @example
     * ```typescript
     * // Get all active events
     * const { events, cursor } = await dflow.events.getEvents({ status: 'active' });
     *
     * // Get events for a specific series
     * const btcEvents = await dflow.events.getEvents({
     *   seriesTicker: 'KXBTC',
     *   limit: 50,
     * });
     *
     * // Paginate through results
     * const nextPage = await dflow.events.getEvents({ cursor });
     * ```
     */
    getEvents(params?: EventsParams): Promise<EventsResponse>;
    /**
     * Get forecast percentile history for an event.
     *
     * Returns historical forecast data showing how predictions have changed over time.
     *
     * @param seriesTicker - The series ticker (e.g., 'KXBTC')
     * @param eventId - The event identifier within the series
     * @returns Forecast history with percentile data points
     *
     * @example
     * ```typescript
     * const history = await dflow.events.getEventForecastHistory('KXBTC', 'event-123');
     * console.log(history.dataPoints); // Historical forecast values
     * ```
     */
    getEventForecastHistory(seriesTicker: string, eventId: string): Promise<ForecastHistory>;
    /**
     * Get forecast percentile history for an event by its mint address.
     *
     * Alternative to {@link getEventForecastHistory} when you have the mint address
     * instead of series ticker and event ID.
     *
     * @param mintAddress - The Solana mint address of the event's outcome token
     * @returns Forecast history with percentile data points
     *
     * @example
     * ```typescript
     * const history = await dflow.events.getEventForecastByMint('EPjFWdd5...');
     * ```
     */
    getEventForecastByMint(mintAddress: string): Promise<ForecastHistory>;
    /**
     * Get OHLCV candlestick data for an event.
     *
     * Returns price history in candlestick format for charting.
     *
     * @param ticker - The event ticker
     * @returns Array of candlestick data points
     *
     * @example
     * ```typescript
     * const candles = await dflow.events.getEventCandlesticks('BTCD-25DEC0313');
     * candles.forEach(c => {
     *   console.log(`Open: ${c.open}, High: ${c.high}, Low: ${c.low}, Close: ${c.close}`);
     * });
     * ```
     */
    getEventCandlesticks(ticker: string): Promise<Candlestick[]>;
}

/**
 * API for querying prediction market data, pricing, and batch operations.
 *
 * Markets represent individual trading instruments within events. Each market
 * has YES and NO outcome tokens that can be traded. Markets can be binary
 * (yes/no) or scalar (range of values).
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get a specific market
 * const market = await dflow.markets.getMarket('BTCD-25DEC0313-T92749.99');
 *
 * // Get active markets
 * const { markets } = await dflow.markets.getMarkets({ status: 'active' });
 *
 * // Batch query multiple markets
 * const markets = await dflow.markets.getMarketsBatch({
 *   tickers: ['MARKET-1', 'MARKET-2'],
 * });
 * ```
 */
declare class MarketsAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get a single market by its ticker.
     *
     * @param marketId - The market ticker (e.g., 'BTCD-25DEC0313-T92749.99')
     * @returns Complete market data including prices, accounts, and status
     *
     * @example
     * ```typescript
     * const market = await dflow.markets.getMarket('BTCD-25DEC0313-T92749.99');
     * console.log(`YES: ${market.yesAsk}, NO: ${market.noAsk}`);
     * console.log(`Volume: ${market.volume}`);
     * ```
     */
    getMarket(marketId: string): Promise<Market>;
    /**
     * Get a market by its outcome token mint address.
     *
     * Useful when you have a mint address from a wallet or transaction
     * and need to look up the associated market.
     *
     * @param mintAddress - The Solana mint address of a YES or NO token
     * @returns The market associated with the mint address
     *
     * @example
     * ```typescript
     * const market = await dflow.markets.getMarketByMint('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
     * ```
     */
    getMarketByMint(mintAddress: string): Promise<Market>;
    /**
     * List markets with optional filtering.
     *
     * @param params - Optional filter parameters
     * @param params.status - Filter by market status ('active', 'closed', etc.)
     * @param params.eventTicker - Filter by parent event ticker
     * @param params.limit - Maximum number of markets to return
     * @param params.cursor - Pagination cursor from previous response
     * @returns Paginated list of markets
     *
     * @example
     * ```typescript
     * // Get all active markets
     * const { markets, cursor } = await dflow.markets.getMarkets({ status: 'active' });
     *
     * // Get markets for a specific event
     * const eventMarkets = await dflow.markets.getMarkets({
     *   eventTicker: 'BTCD-25DEC0313',
     * });
     *
     * // Paginate through results
     * const nextPage = await dflow.markets.getMarkets({ cursor });
     * ```
     */
    getMarkets(params?: MarketsParams): Promise<MarketsResponse>;
    /**
     * Batch query multiple markets by tickers and/or mint addresses.
     *
     * More efficient than multiple individual requests when you need
     * data for several markets at once.
     *
     * @param params - Batch query parameters
     * @param params.tickers - Array of market tickers to fetch
     * @param params.mints - Array of mint addresses to fetch
     * @returns Array of market data
     * @throws Error if total items exceed {@link MAX_BATCH_SIZE} (100)
     *
     * @example
     * ```typescript
     * const markets = await dflow.markets.getMarketsBatch({
     *   tickers: ['MARKET-1', 'MARKET-2', 'MARKET-3'],
     *   mints: ['mint-address-1'],
     * });
     * ```
     */
    getMarketsBatch(params: MarketsBatchParams): Promise<Market[]>;
    /**
     * Get all outcome token mint addresses.
     *
     * Returns a list of all valid outcome token mints across all markets.
     * Useful for filtering wallet tokens to find prediction market positions.
     *
     * @returns Array of mint addresses
     *
     * @example
     * ```typescript
     * const allMints = await dflow.markets.getOutcomeMints();
     * console.log(`Total outcome tokens: ${allMints.length}`);
     * ```
     */
    getOutcomeMints(): Promise<string[]>;
    /**
     * Filter a list of addresses to find which are outcome token mints.
     *
     * Given a list of token addresses (e.g., from a wallet), returns only
     * those that are prediction market outcome tokens.
     *
     * @param addresses - Array of Solana token addresses to check
     * @returns Array of addresses that are outcome token mints
     * @throws Error if addresses exceed {@link MAX_FILTER_ADDRESSES} (200)
     *
     * @example
     * ```typescript
     * // Get user's wallet tokens
     * const walletTokens = ['addr1', 'addr2', 'addr3', ...];
     *
     * // Filter to find prediction market tokens
     * const predictionTokens = await dflow.markets.filterOutcomeMints(walletTokens);
     * ```
     */
    filterOutcomeMints(addresses: string[]): Promise<string[]>;
    /**
     * Get OHLCV candlestick data for a market.
     *
     * Returns price history in candlestick format for charting.
     *
     * @param ticker - The market ticker
     * @returns Array of candlestick data points
     *
     * @example
     * ```typescript
     * const candles = await dflow.markets.getMarketCandlesticks('BTCD-25DEC0313-T92749.99');
     * candles.forEach(c => {
     *   console.log(`${c.timestamp}: O=${c.open} H=${c.high} L=${c.low} C=${c.close}`);
     * });
     * ```
     */
    getMarketCandlesticks(ticker: string): Promise<Candlestick[]>;
    /**
     * Get OHLCV candlestick data for a market by mint address.
     *
     * Alternative to {@link getMarketCandlesticks} when you have the mint address.
     *
     * @param mintAddress - The Solana mint address of the market's outcome token
     * @returns Array of candlestick data points
     *
     * @example
     * ```typescript
     * const candles = await dflow.markets.getMarketCandlesticksByMint('EPjFWdd5...');
     * ```
     */
    getMarketCandlesticksByMint(mintAddress: string): Promise<Candlestick[]>;
}

/**
 * API for retrieving orderbook snapshots.
 *
 * The orderbook shows current bid/ask prices and quantities for YES and NO
 * outcome tokens in a market.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const orderbook = await dflow.orderbook.getOrderbook('BTCD-25DEC0313-T92749.99');
 * console.log(`YES Bid: ${orderbook.yesBid.price}, Ask: ${orderbook.yesAsk.price}`);
 * ```
 */
declare class OrderbookAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get the orderbook for a market by ticker.
     *
     * @param marketTicker - The market ticker
     * @returns Orderbook with YES/NO bid and ask prices and quantities
     *
     * @example
     * ```typescript
     * const orderbook = await dflow.orderbook.getOrderbook('BTCD-25DEC0313-T92749.99');
     * console.log(`YES: Bid ${orderbook.yesBid.price} / Ask ${orderbook.yesAsk.price}`);
     * console.log(`NO:  Bid ${orderbook.noBid.price} / Ask ${orderbook.noAsk.price}`);
     * ```
     */
    getOrderbook(marketTicker: string): Promise<Orderbook>;
    /**
     * Get the orderbook for a market by mint address.
     *
     * Alternative to {@link getOrderbook} when you have the mint address.
     *
     * @param mintAddress - The Solana mint address of the market's outcome token
     * @returns Orderbook with YES/NO bid and ask prices and quantities
     *
     * @example
     * ```typescript
     * const orderbook = await dflow.orderbook.getOrderbookByMint('EPjFWdd5...');
     * ```
     */
    getOrderbookByMint(mintAddress: string): Promise<Orderbook>;
}

/**
 * API for retrieving historical trade data.
 *
 * Access past trades for markets to analyze trading activity and price history.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const { trades } = await dflow.trades.getTrades({
 *   marketTicker: 'BTCD-25DEC0313-T92749.99',
 *   limit: 100,
 * });
 * ```
 */
declare class TradesAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get historical trades with optional filtering.
     *
     * @param params - Optional filter parameters
     * @param params.marketTicker - Filter by market ticker
     * @param params.limit - Maximum number of trades to return
     * @param params.cursor - Pagination cursor from previous response
     * @returns Paginated list of trades
     *
     * @example
     * ```typescript
     * // Get recent trades for a market
     * const { trades, cursor } = await dflow.trades.getTrades({
     *   marketTicker: 'BTCD-25DEC0313-T92749.99',
     *   limit: 100,
     * });
     *
     * // Paginate through results
     * const nextPage = await dflow.trades.getTrades({ cursor });
     * ```
     */
    getTrades(params?: TradesParams): Promise<TradesResponse>;
    /**
     * Get trades for a market by mint address.
     *
     * Alternative to {@link getTrades} when you have the mint address.
     *
     * @param mintAddress - The Solana mint address of the market's outcome token
     * @param params - Optional filter parameters (excluding marketTicker)
     * @returns Paginated list of trades
     *
     * @example
     * ```typescript
     * const { trades } = await dflow.trades.getTradesByMint('EPjFWdd5...', {
     *   limit: 50,
     * });
     * ```
     */
    getTradesByMint(mintAddress: string, params?: Omit<TradesParams, 'marketTicker'>): Promise<TradesResponse>;
}

/**
 * API for retrieving real-time milestone and progress data.
 *
 * Live data provides real-time updates on event milestones and progress
 * indicators that can affect market outcomes.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get live data for specific milestones
 * const data = await dflow.liveData.getLiveData(['milestone1', 'milestone2']);
 *
 * // Get live data for an event
 * const eventData = await dflow.liveData.getLiveDataByEvent('BTCD-25DEC0313');
 * ```
 */
declare class LiveDataAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get live data for specific milestones.
     *
     * @param milestones - Array of milestone identifiers to fetch
     * @returns Array of live data for the requested milestones
     *
     * @example
     * ```typescript
     * const data = await dflow.liveData.getLiveData(['btc-price', 'eth-price']);
     * data.forEach(d => console.log(`${d.milestone}: ${d.value}`));
     * ```
     */
    getLiveData(milestones: string[]): Promise<LiveData[]>;
    /**
     * Get live data for an event by its ticker.
     *
     * @param eventTicker - The event ticker
     * @returns Live data for the event
     *
     * @example
     * ```typescript
     * const data = await dflow.liveData.getLiveDataByEvent('BTCD-25DEC0313');
     * console.log(`Current value: ${data.value}`);
     * ```
     */
    getLiveDataByEvent(eventTicker: string): Promise<LiveData>;
    /**
     * Get live data for a market by mint address.
     *
     * @param mintAddress - The Solana mint address of the market's outcome token
     * @returns Live data for the market
     *
     * @example
     * ```typescript
     * const data = await dflow.liveData.getLiveDataByMint('EPjFWdd5...');
     * ```
     */
    getLiveDataByMint(mintAddress: string): Promise<LiveData>;
}

/**
 * API for retrieving series/category information.
 *
 * Series group related events together (e.g., all Bitcoin price events,
 * all election events). Use series to browse events by category.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get all series
 * const series = await dflow.series.getSeries();
 *
 * // Get a specific series
 * const btcSeries = await dflow.series.getSeriesByTicker('KXBTC');
 * ```
 */
declare class SeriesAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get all available series.
     *
     * @returns Array of all series
     *
     * @example
     * ```typescript
     * const series = await dflow.series.getSeries();
     * series.forEach(s => console.log(`${s.ticker}: ${s.name}`));
     * ```
     */
    getSeries(): Promise<Series[]>;
    /**
     * Get a specific series by its ticker.
     *
     * @param ticker - The series ticker (e.g., 'KXBTC', 'KXETH')
     * @returns The series data
     *
     * @example
     * ```typescript
     * const series = await dflow.series.getSeriesByTicker('KXBTC');
     * console.log(`${series.name}: ${series.description}`);
     * ```
     */
    getSeriesByTicker(ticker: string): Promise<Series>;
}

/**
 * API for retrieving category tags.
 *
 * Tags provide a way to categorize and filter events by topic
 * (e.g., 'crypto', 'politics', 'sports').
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const tags = await dflow.tags.getTagsByCategories();
 * console.log(tags.categories);
 * ```
 */
declare class TagsAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get all tags organized by category.
     *
     * @returns Tags grouped by their categories
     *
     * @example
     * ```typescript
     * const tags = await dflow.tags.getTagsByCategories();
     * Object.entries(tags).forEach(([category, tagList]) => {
     *   console.log(`${category}: ${tagList.join(', ')}`);
     * });
     * ```
     */
    getTagsByCategories(): Promise<CategoryTags>;
}

/**
 * API for retrieving sports-specific filters.
 *
 * Get available filters for sports-related prediction markets
 * (leagues, teams, event types, etc.).
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const filters = await dflow.sports.getFiltersBySports();
 * console.log(filters.leagues);
 * ```
 */
declare class SportsAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get all available sports filters.
     *
     * @returns Sports filters including leagues, teams, and event types
     *
     * @example
     * ```typescript
     * const filters = await dflow.sports.getFiltersBySports();
     * filters.leagues.forEach(league => console.log(league.name));
     * ```
     */
    getFiltersBySports(): Promise<SportsFilters>;
}

/**
 * API for searching events and markets.
 *
 * Full-text search across events and markets by keywords.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const results = await dflow.search.search({ query: 'bitcoin' });
 * console.log(`Found ${results.events.length} events`);
 * ```
 */
declare class SearchAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Search for events and markets by keyword.
     *
     * @param params - Search parameters
     * @param params.query - The search query string
     * @param params.limit - Maximum number of results to return
     * @returns Search results containing matching events and markets
     *
     * @example
     * ```typescript
     * // Search for Bitcoin-related markets
     * const results = await dflow.search.search({ query: 'bitcoin', limit: 20 });
     *
     * results.events.forEach(event => {
     *   console.log(`Event: ${event.title}`);
     * });
     *
     * results.markets.forEach(market => {
     *   console.log(`Market: ${market.title}`);
     * });
     * ```
     */
    search(params: SearchParams): Promise<SearchResult>;
}

/**
 * API for creating and tracking orders.
 *
 * Orders provide a way to get a quote and transaction for trading
 * prediction market outcome tokens. Use this for straightforward
 * order execution.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient({ environment: 'production', apiKey: 'your-key' });
 *
 * // Get an order quote and transaction
 * const order = await dflow.orders.getOrder({
 *   inputMint: USDC_MINT,
 *   outputMint: market.accounts.usdc.yesMint,
 *   amount: 1000000, // 1 USDC
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 *
 * // Sign and send the transaction
 * const signature = await signAndSendTransaction(connection, order.transaction, keypair);
 *
 * // Check order status
 * const status = await dflow.orders.getOrderStatus(signature);
 * ```
 */
declare class OrdersAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get an order quote and transaction for a trade.
     *
     * Returns a ready-to-sign transaction for swapping tokens.
     *
     * @param params - Order parameters
     * @param params.inputMint - The mint address of the token to sell (e.g., USDC)
     * @param params.outputMint - The mint address of the token to buy (e.g., YES token)
     * @param params.amount - The amount to trade in base units (e.g., 1000000 for 1 USDC)
     * @param params.slippageBps - Maximum slippage in basis points (e.g., 50 = 0.5%)
     * @param params.userPublicKey - The user's Solana wallet public key
     * @param params.platformFeeBps - Optional platform fee in basis points
     * @param params.platformFeeAccount - Optional account to receive platform fees
     * @returns Order response with transaction and quote details
     *
     * @example
     * ```typescript
     * import { USDC_MINT } from 'dflow-sdk';
     *
     * const order = await dflow.orders.getOrder({
     *   inputMint: USDC_MINT,
     *   outputMint: market.accounts.usdc.yesMint,
     *   amount: 1000000, // 1 USDC (6 decimals)
     *   slippageBps: 50, // 0.5% slippage
     *   userPublicKey: wallet.publicKey.toBase58(),
     * });
     *
     * console.log(`Input: ${order.inAmount}, Output: ${order.outAmount}`);
     * // Sign and send order.transaction
     * ```
     */
    getOrder(params: OrderParams): Promise<OrderResponse>;
    /**
     * Check the status of a submitted order.
     *
     * Use this to track async order completion or check if an order
     * was successfully executed.
     *
     * @param signature - The transaction signature from submitting the order
     * @returns Order status ('open', 'closed', 'failed', or 'pendingClose')
     *
     * @example
     * ```typescript
     * const status = await dflow.orders.getOrderStatus(signature);
     *
     * if (status.status === 'closed') {
     *   console.log('Order completed successfully!');
     * } else if (status.status === 'failed') {
     *   console.log('Order failed');
     * } else {
     *   console.log('Order still pending...');
     * }
     * ```
     */
    getOrderStatus(signature: string): Promise<OrderStatusResponse>;
}

/**
 * API for imperative swap operations with route preview.
 *
 * The Swap API provides a two-step process: first get a quote to preview
 * the trade, then create a swap transaction. This gives you control over
 * trade execution and allows displaying quotes to users before committing.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Step 1: Get a quote
 * const quote = await dflow.swap.getQuote({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 * });
 * console.log(`You'll receive: ${quote.outAmount} tokens`);
 *
 * // Step 2: Create and execute swap
 * const swap = await dflow.swap.createSwap({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 * ```
 */
declare class SwapAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get a quote for a swap without creating a transaction.
     *
     * Use this to preview trade amounts before committing. The quote
     * shows expected input/output amounts and price impact.
     *
     * @param params - Quote parameters
     * @param params.inputMint - The mint address of the token to sell
     * @param params.outputMint - The mint address of the token to buy
     * @param params.amount - The amount to trade in base units
     * @param params.slippageBps - Optional slippage tolerance in basis points
     * @returns Quote with expected amounts and route information
     *
     * @example
     * ```typescript
     * const quote = await dflow.swap.getQuote({
     *   inputMint: USDC_MINT,
     *   outputMint: market.accounts.usdc.yesMint,
     *   amount: 1000000, // 1 USDC
     *   slippageBps: 50,
     * });
     *
     * console.log(`Input: ${quote.inAmount}`);
     * console.log(`Output: ${quote.outAmount}`);
     * console.log(`Price impact: ${quote.priceImpactPct}%`);
     * ```
     */
    getQuote(params: QuoteParams): Promise<SwapQuote>;
    /**
     * Create a swap transaction ready for signing.
     *
     * Combines getting a quote and creating a transaction in one call.
     * Returns a base64-encoded transaction that can be signed and sent.
     *
     * @param params - Swap parameters
     * @param params.inputMint - The mint address of the token to sell
     * @param params.outputMint - The mint address of the token to buy
     * @param params.amount - The amount to trade in base units
     * @param params.slippageBps - Slippage tolerance in basis points
     * @param params.userPublicKey - The user's Solana wallet public key
     * @param params.wrapUnwrapSol - Whether to wrap/unwrap SOL automatically
     * @param params.priorityFee - Optional priority fee configuration
     * @returns Swap response with transaction and quote details
     *
     * @example
     * ```typescript
     * const swap = await dflow.swap.createSwap({
     *   inputMint: USDC_MINT,
     *   outputMint: market.accounts.usdc.yesMint,
     *   amount: 1000000,
     *   slippageBps: 50,
     *   userPublicKey: wallet.publicKey.toBase58(),
     *   wrapUnwrapSol: true,
     *   priorityFee: { type: 'exact', amount: 10000 },
     * });
     *
     * // Sign and send the transaction
     * const result = await signSendAndConfirm(connection, swap.transaction, keypair);
     * ```
     */
    createSwap(params: SwapParams): Promise<SwapResponse>;
    /**
     * Get swap instructions for custom transaction composition.
     *
     * Instead of a complete transaction, returns individual instructions
     * that can be combined with other instructions in a custom transaction.
     * Useful for advanced use cases like atomic multi-step operations.
     *
     * @param params - Swap parameters (same as {@link createSwap})
     * @returns Instructions and accounts for building a custom transaction
     *
     * @example
     * ```typescript
     * const instructions = await dflow.swap.getSwapInstructions({
     *   inputMint: USDC_MINT,
     *   outputMint: yesMint,
     *   amount: 1000000,
     *   slippageBps: 50,
     *   userPublicKey: wallet.publicKey.toBase58(),
     * });
     *
     * // Build a custom transaction with these instructions
     * const tx = new Transaction();
     * instructions.instructions.forEach(ix => tx.add(ix));
     * ```
     */
    getSwapInstructions(params: SwapParams): Promise<SwapInstructionsResponse>;
}

/**
 * API for declarative intent-based swaps.
 *
 * Intents provide a declarative approach to trading where you specify
 * what you want (exact input or exact output) and the system handles
 * the execution details. This is useful for "sell exactly X" or
 * "buy exactly Y" scenarios.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // ExactIn: Sell exactly 1 USDC, receive variable YES tokens
 * const intent = await dflow.intent.submitIntent({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 *   mode: 'ExactIn',
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 *
 * // ExactOut: Receive exactly 100 YES tokens, pay variable USDC
 * const intent = await dflow.intent.submitIntent({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 100000000, // 100 tokens
 *   mode: 'ExactOut',
 *   slippageBps: 50,
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 * ```
 */
declare class IntentAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get a quote for an intent-based swap.
     *
     * Preview what you'll receive (ExactIn) or what you'll pay (ExactOut)
     * before submitting the intent.
     *
     * @param params - Intent quote parameters
     * @param params.inputMint - The mint address of the token to sell
     * @param params.outputMint - The mint address of the token to buy
     * @param params.amount - The exact amount (input or output based on mode)
     * @param params.mode - 'ExactIn' to specify input amount, 'ExactOut' for output amount
     * @returns Quote showing expected amounts
     *
     * @example
     * ```typescript
     * // How much YES will I get for exactly 1 USDC?
     * const quote = await dflow.intent.getIntentQuote({
     *   inputMint: USDC_MINT,
     *   outputMint: yesMint,
     *   amount: 1000000,
     *   mode: 'ExactIn',
     * });
     * console.log(`You'll receive: ${quote.outAmount} YES tokens`);
     *
     * // How much USDC do I need to get exactly 100 YES tokens?
     * const quote = await dflow.intent.getIntentQuote({
     *   inputMint: USDC_MINT,
     *   outputMint: yesMint,
     *   amount: 100000000,
     *   mode: 'ExactOut',
     * });
     * console.log(`You'll pay: ${quote.inAmount} USDC`);
     * ```
     */
    getIntentQuote(params: IntentQuoteParams): Promise<IntentQuote>;
    /**
     * Submit an intent-based swap for execution.
     *
     * Creates and returns a transaction for the intent. The transaction
     * will execute the swap according to the specified mode (ExactIn/ExactOut).
     *
     * @param params - Intent submission parameters
     * @param params.inputMint - The mint address of the token to sell
     * @param params.outputMint - The mint address of the token to buy
     * @param params.amount - The exact amount (input or output based on mode)
     * @param params.mode - 'ExactIn' or 'ExactOut'
     * @param params.slippageBps - Slippage tolerance in basis points
     * @param params.userPublicKey - The user's Solana wallet public key
     * @param params.priorityFee - Optional priority fee configuration
     * @returns Intent response with transaction to sign
     *
     * @example
     * ```typescript
     * const intent = await dflow.intent.submitIntent({
     *   inputMint: USDC_MINT,
     *   outputMint: market.accounts.usdc.yesMint,
     *   amount: 1000000,
     *   mode: 'ExactIn',
     *   slippageBps: 50,
     *   userPublicKey: wallet.publicKey.toBase58(),
     * });
     *
     * // Sign and send the transaction
     * const result = await signSendAndConfirm(connection, intent.transaction, keypair);
     * ```
     */
    submitIntent(params: SubmitIntentParams): Promise<IntentResponse>;
}

/**
 * API for initializing new prediction markets.
 *
 * Create new prediction markets on-chain. This initializes the market
 * accounts and creates YES/NO outcome token mints.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient({ environment: 'production', apiKey: 'your-key' });
 *
 * const init = await dflow.predictionMarket.initializeMarket({
 *   marketTicker: 'MY-MARKET-TICKER',
 *   userPublicKey: wallet.publicKey.toBase58(),
 * });
 *
 * console.log(`YES mint: ${init.yesMint}`);
 * console.log(`NO mint: ${init.noMint}`);
 * // Sign and send init.transaction to create the market
 * ```
 */
declare class PredictionMarketAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Initialize a new prediction market.
     *
     * Creates a new prediction market with YES and NO outcome tokens.
     * The returned transaction must be signed and sent to complete
     * market creation.
     *
     * @param params - Market initialization parameters
     * @param params.marketTicker - Unique ticker for the new market
     * @param params.userPublicKey - The creator's Solana wallet public key
     * @param params.settlementMint - Token mint for settlement (defaults to USDC)
     * @returns Initialization response with transaction and mint addresses
     *
     * @example
     * ```typescript
     * import { USDC_MINT } from 'dflow-sdk';
     *
     * const init = await dflow.predictionMarket.initializeMarket({
     *   marketTicker: 'BTCPRICE-25DEC-100K',
     *   userPublicKey: wallet.publicKey.toBase58(),
     *   settlementMint: USDC_MINT, // Optional, defaults to USDC
     * });
     *
     * // Sign and send the initialization transaction
     * const result = await signSendAndConfirm(connection, init.transaction, keypair);
     *
     * // Store the mint addresses for trading
     * console.log(`Market created!`);
     * console.log(`YES token: ${init.yesMint}`);
     * console.log(`NO token: ${init.noMint}`);
     * ```
     */
    initializeMarket(params: PredictionMarketInitParams): Promise<PredictionMarketInitResponse>;
}

/**
 * API for retrieving available token information.
 *
 * Get information about tokens supported for trading, including
 * their mint addresses and decimal precision.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Get all available tokens
 * const tokens = await dflow.tokens.getTokens();
 *
 * // Get tokens with decimal information
 * const tokensWithDecimals = await dflow.tokens.getTokensWithDecimals();
 * ```
 */
declare class TokensAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get all available tokens for trading.
     *
     * @returns Array of token information
     *
     * @example
     * ```typescript
     * const tokens = await dflow.tokens.getTokens();
     * tokens.forEach(token => {
     *   console.log(`${token.symbol}: ${token.mint}`);
     * });
     * ```
     */
    getTokens(): Promise<Token[]>;
    /**
     * Get all available tokens with decimal information.
     *
     * Includes the number of decimal places for each token,
     * useful for formatting amounts correctly.
     *
     * @returns Array of tokens with decimal information
     *
     * @example
     * ```typescript
     * const tokens = await dflow.tokens.getTokensWithDecimals();
     * tokens.forEach(token => {
     *   console.log(`${token.symbol}: ${token.decimals} decimals`);
     *   // Convert 1 token to base units
     *   const baseUnits = 1 * Math.pow(10, token.decimals);
     * });
     * ```
     */
    getTokensWithDecimals(): Promise<TokenWithDecimals[]>;
}

/**
 * API for retrieving trading venue information.
 *
 * Venues represent the underlying exchanges or liquidity sources
 * where trades are executed.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * const venues = await dflow.venues.getVenues();
 * venues.forEach(venue => console.log(venue.name));
 * ```
 */
declare class VenuesAPI {
    private http;
    constructor(http: HttpClient);
    /**
     * Get all available trading venues.
     *
     * @returns Array of venue information
     *
     * @example
     * ```typescript
     * const venues = await dflow.venues.getVenues();
     * venues.forEach(venue => {
     *   console.log(`${venue.name}: ${venue.description}`);
     * });
     * ```
     */
    getVenues(): Promise<Venue[]>;
}

type MessageCallback<T> = (data: T) => void;
type ErrorCallback = (error: Error) => void;
type CloseCallback = (event: CloseEvent) => void;
/**
 * WebSocket client for real-time price, trade, and orderbook updates.
 *
 * Provides streaming market data with automatic reconnection support.
 * Subscribe to specific markets or all markets for each data channel.
 *
 * @example
 * ```typescript
 * const dflow = new DFlowClient();
 *
 * // Connect to WebSocket
 * await dflow.ws.connect();
 *
 * // Subscribe to price updates for specific markets
 * dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
 *
 * // Handle price updates
 * const unsubscribe = dflow.ws.onPrice((update) => {
 *   console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
 * });
 *
 * // Later: cleanup
 * unsubscribe(); // Remove callback
 * dflow.ws.disconnect(); // Close connection
 * ```
 */
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
    /**
     * Create a new WebSocket client.
     *
     * @param options - WebSocket configuration options
     * @param options.url - Custom WebSocket URL (defaults to DFlow WebSocket)
     * @param options.reconnect - Whether to auto-reconnect on disconnect (default: true)
     * @param options.reconnectInterval - Milliseconds between reconnect attempts (default: 5000)
     * @param options.maxReconnectAttempts - Max reconnection attempts (default: 10)
     */
    constructor(options?: WebSocketOptions);
    /**
     * Connect to the WebSocket server.
     *
     * Must be called before subscribing to any channels.
     * Resolves when connection is established.
     *
     * @returns Promise that resolves when connected
     * @throws Error if connection fails
     *
     * @example
     * ```typescript
     * await dflow.ws.connect();
     * console.log('Connected!', dflow.ws.isConnected);
     * ```
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the WebSocket server.
     *
     * Disables auto-reconnect and closes the connection.
     *
     * @example
     * ```typescript
     * dflow.ws.disconnect();
     * ```
     */
    disconnect(): void;
    private attemptReconnect;
    private handleMessage;
    private send;
    /**
     * Subscribe to price updates for specific markets.
     *
     * @param tickers - Array of market tickers to subscribe to
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99', 'ETHD-25DEC0313']);
     * ```
     */
    subscribePrices(tickers: string[]): void;
    /**
     * Subscribe to price updates for all markets.
     *
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * dflow.ws.subscribeAllPrices();
     * ```
     */
    subscribeAllPrices(): void;
    /**
     * Subscribe to trade updates for specific markets.
     *
     * @param tickers - Array of market tickers to subscribe to
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * dflow.ws.subscribeTrades(['BTCD-25DEC0313-T92749.99']);
     * ```
     */
    subscribeTrades(tickers: string[]): void;
    /**
     * Subscribe to trade updates for all markets.
     *
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * dflow.ws.subscribeAllTrades();
     * ```
     */
    subscribeAllTrades(): void;
    /**
     * Subscribe to orderbook updates for specific markets.
     *
     * @param tickers - Array of market tickers to subscribe to
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * dflow.ws.subscribeOrderbook(['BTCD-25DEC0313-T92749.99']);
     * ```
     */
    subscribeOrderbook(tickers: string[]): void;
    /**
     * Subscribe to orderbook updates for all markets.
     *
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * dflow.ws.subscribeAllOrderbook();
     * ```
     */
    subscribeAllOrderbook(): void;
    /**
     * Unsubscribe from a channel.
     *
     * @param channel - The channel to unsubscribe from ('prices', 'trades', or 'orderbook')
     * @param tickers - Optional specific tickers to unsubscribe. If omitted, unsubscribes from all.
     * @throws Error if WebSocket is not connected
     *
     * @example
     * ```typescript
     * // Unsubscribe from specific markets
     * dflow.ws.unsubscribe('prices', ['BTCD-25DEC0313-T92749.99']);
     *
     * // Unsubscribe from all on a channel
     * dflow.ws.unsubscribe('trades');
     * ```
     */
    unsubscribe(channel: WebSocketChannel, tickers?: string[]): void;
    /**
     * Register a callback for price updates.
     *
     * @param callback - Function called when a price update is received
     * @returns Unsubscribe function to remove the callback
     *
     * @example
     * ```typescript
     * const unsubscribe = dflow.ws.onPrice((update) => {
     *   console.log(`${update.ticker}: YES=${update.yesPrice} NO=${update.noPrice}`);
     * });
     *
     * // Later: remove callback
     * unsubscribe();
     * ```
     */
    onPrice(callback: MessageCallback<PriceUpdate>): () => void;
    /**
     * Register a callback for trade updates.
     *
     * @param callback - Function called when a trade update is received
     * @returns Unsubscribe function to remove the callback
     *
     * @example
     * ```typescript
     * const unsubscribe = dflow.ws.onTrade((trade) => {
     *   console.log(`Trade: ${trade.side} ${trade.amount} @ ${trade.price}`);
     * });
     *
     * // Later: remove callback
     * unsubscribe();
     * ```
     */
    onTrade(callback: MessageCallback<TradeUpdate>): () => void;
    /**
     * Register a callback for orderbook updates.
     *
     * @param callback - Function called when an orderbook update is received
     * @returns Unsubscribe function to remove the callback
     *
     * @example
     * ```typescript
     * const unsubscribe = dflow.ws.onOrderbook((book) => {
     *   console.log(`${book.ticker}: Bid=${book.yesBid} Ask=${book.yesAsk}`);
     * });
     *
     * // Later: remove callback
     * unsubscribe();
     * ```
     */
    onOrderbook(callback: MessageCallback<OrderbookUpdate>): () => void;
    /**
     * Register a callback for WebSocket errors.
     *
     * @param callback - Function called when an error occurs
     * @returns Unsubscribe function to remove the callback
     *
     * @example
     * ```typescript
     * const unsubscribe = dflow.ws.onError((error) => {
     *   console.error('WebSocket error:', error.message);
     * });
     * ```
     */
    onError(callback: ErrorCallback): () => void;
    /**
     * Register a callback for WebSocket close events.
     *
     * @param callback - Function called when the connection closes
     * @returns Unsubscribe function to remove the callback
     *
     * @example
     * ```typescript
     * const unsubscribe = dflow.ws.onClose((event) => {
     *   console.log('WebSocket closed:', event.code, event.reason);
     * });
     * ```
     */
    onClose(callback: CloseCallback): () => void;
    /**
     * Check if the WebSocket is currently connected.
     *
     * @returns true if connected, false otherwise
     *
     * @example
     * ```typescript
     * if (dflow.ws.isConnected) {
     *   dflow.ws.subscribePrices(['BTCD-25DEC0313-T92749.99']);
     * }
     * ```
     */
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

/**
 * Sign and send a base64-encoded transaction to the Solana network.
 *
 * Deserializes the transaction, signs it with the provided keypair,
 * and sends it to the network.
 *
 * @param connection - Solana RPC connection
 * @param transactionBase64 - Base64-encoded transaction (from DFlow API responses)
 * @param signer - Keypair to sign the transaction with
 * @returns Transaction signature
 *
 * @example
 * ```typescript
 * import { Connection, Keypair } from '@solana/web3.js';
 * import { signAndSendTransaction } from 'dflow-sdk';
 *
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const keypair = Keypair.fromSecretKey(secretKey);
 *
 * const order = await dflow.orders.getOrder({ ... });
 * const signature = await signAndSendTransaction(connection, order.transaction, keypair);
 * console.log(`Transaction sent: ${signature}`);
 * ```
 */
declare function signAndSendTransaction(connection: Connection, transactionBase64: string, signer: Keypair): Promise<string>;
/**
 * Wait for a transaction to be confirmed on-chain.
 *
 * Polls the network until the transaction reaches the desired confirmation
 * level or times out.
 *
 * @param connection - Solana RPC connection
 * @param signature - Transaction signature to wait for
 * @param commitment - Desired confirmation level (default: 'confirmed')
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 60000)
 * @returns Confirmation details including slot and status
 * @throws Error if transaction fails or times out
 *
 * @example
 * ```typescript
 * import { waitForConfirmation } from 'dflow-sdk';
 *
 * const confirmation = await waitForConfirmation(connection, signature, 'confirmed');
 * console.log(`Confirmed at slot ${confirmation.slot}`);
 * ```
 */
declare function waitForConfirmation(connection: Connection, signature: string, commitment?: Commitment, timeoutMs?: number): Promise<TransactionConfirmation>;
/**
 * Sign, send, and wait for confirmation in one call.
 *
 * Convenience function that combines {@link signAndSendTransaction} and
 * {@link waitForConfirmation} into a single operation.
 *
 * @param connection - Solana RPC connection
 * @param transactionBase64 - Base64-encoded transaction (from DFlow API responses)
 * @param signer - Keypair to sign the transaction with
 * @param commitment - Desired confirmation level (default: 'confirmed')
 * @returns Confirmation details including signature, slot, and status
 * @throws Error if transaction fails or times out
 *
 * @example
 * ```typescript
 * import { Connection, Keypair } from '@solana/web3.js';
 * import { DFlowClient, signSendAndConfirm, USDC_MINT } from 'dflow-sdk';
 *
 * const dflow = new DFlowClient();
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const keypair = Keypair.fromSecretKey(secretKey);
 *
 * // Get a swap transaction
 * const swap = await dflow.swap.createSwap({
 *   inputMint: USDC_MINT,
 *   outputMint: yesMint,
 *   amount: 1000000,
 *   slippageBps: 50,
 *   userPublicKey: keypair.publicKey.toBase58(),
 * });
 *
 * // Sign, send, and wait for confirmation
 * const result = await signSendAndConfirm(connection, swap.transaction, keypair);
 * console.log(`Transaction confirmed: ${result.signature}`);
 * console.log(`Slot: ${result.slot}`);
 * ```
 */
declare function signSendAndConfirm(connection: Connection, transactionBase64: string, signer: Keypair, commitment?: Commitment): Promise<TransactionConfirmation>;

/**
 * Get all token balances for a wallet.
 *
 * Queries both the standard Token Program and Token-2022 Program to find
 * all token holdings. Returns only tokens with non-zero balances.
 *
 * @param connection - Solana RPC connection
 * @param walletAddress - Wallet public key to query
 * @returns Array of token balances with mint, balance, and decimal info
 *
 * @example
 * ```typescript
 * import { Connection, PublicKey } from '@solana/web3.js';
 * import { getTokenBalances } from 'dflow-sdk';
 *
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const wallet = new PublicKey('...');
 *
 * const balances = await getTokenBalances(connection, wallet);
 * balances.forEach(token => {
 *   console.log(`${token.mint}: ${token.balance} (${token.decimals} decimals)`);
 * });
 * ```
 */
declare function getTokenBalances(connection: Connection, walletAddress: PublicKey): Promise<TokenBalance[]>;
/**
 * Get a user's prediction market positions.
 *
 * Finds all prediction market outcome tokens in a wallet and enriches them
 * with market data and position type (YES/NO).
 *
 * @param connection - Solana RPC connection
 * @param walletAddress - Wallet public key to query
 * @param marketsAPI - Markets API instance for looking up market data
 * @returns Array of user positions with market context
 *
 * @example
 * ```typescript
 * import { Connection, PublicKey } from '@solana/web3.js';
 * import { DFlowClient, getUserPositions } from 'dflow-sdk';
 *
 * const dflow = new DFlowClient();
 * const connection = new Connection('https://api.mainnet-beta.solana.com');
 * const wallet = new PublicKey('...');
 *
 * const positions = await getUserPositions(connection, wallet, dflow.markets);
 *
 * positions.forEach(pos => {
 *   console.log(`${pos.position} position: ${pos.balance} tokens`);
 *   if (pos.market) {
 *     console.log(`  Market: ${pos.market.title}`);
 *     console.log(`  Status: ${pos.market.status}`);
 *   }
 * });
 * ```
 */
declare function getUserPositions(connection: Connection, walletAddress: PublicKey, marketsAPI: MarketsAPI): Promise<UserPosition[]>;
/**
 * Check if a position is eligible for redemption.
 *
 * A position is eligible if:
 * - The market is 'determined' or 'finalized'
 * - The redemption window is open
 * - The position is on the winning side (or it's a scalar market)
 *
 * @param market - The market data
 * @param outcomeMint - The mint address of the outcome token to check
 * @returns true if the position can be redeemed
 *
 * @example
 * ```typescript
 * import { isRedemptionEligible } from 'dflow-sdk';
 *
 * const positions = await getUserPositions(connection, wallet, dflow.markets);
 *
 * for (const pos of positions) {
 *   if (pos.market && isRedemptionEligible(pos.market, pos.mint)) {
 *     console.log(`Position ${pos.mint} is redeemable!`);
 *   }
 * }
 * ```
 */
declare function isRedemptionEligible(market: Market, outcomeMint: string): boolean;
/**
 * Calculate the payout for a scalar market position.
 *
 * Scalar markets pay out based on where the outcome falls within a range.
 * YES tokens pay the outcome percentage, NO tokens pay the inverse.
 *
 * @param market - The market data
 * @param outcomeMint - The mint address of the outcome token
 * @param amount - The number of tokens held
 * @returns The payout amount in settlement tokens
 *
 * @example
 * ```typescript
 * import { calculateScalarPayout, isRedemptionEligible } from 'dflow-sdk';
 *
 * for (const pos of positions) {
 *   if (pos.market && isRedemptionEligible(pos.market, pos.mint)) {
 *     const payout = calculateScalarPayout(pos.market, pos.mint, pos.balance);
 *     console.log(`Expected payout: ${payout} USDC`);
 *   }
 * }
 * ```
 */
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

/**
 * Default metadata API base URL (development environment).
 * No API key required. For testing with real capital against Kalshi.
 */
declare const METADATA_API_BASE_URL = "https://dev-prediction-markets-api.dflow.net/api/v1";
/**
 * Default trade API base URL (development environment).
 * No API key required. For testing with real capital against Kalshi.
 */
declare const TRADE_API_BASE_URL = "https://dev-quote-api.dflow.net";
/**
 * Default WebSocket URL (development environment).
 * No API key required.
 */
declare const WEBSOCKET_URL = "wss://dev-prediction-markets-api.dflow.net/api/v1/ws";
/**
 * Production metadata API base URL.
 * Requires API key for access.
 */
declare const PROD_METADATA_API_BASE_URL = "https://prediction-markets-api.dflow.net/api/v1";
/**
 * Production trade API base URL.
 * Requires API key for access.
 */
declare const PROD_TRADE_API_BASE_URL = "https://quote-api.dflow.net";
/**
 * Production WebSocket URL.
 * Requires API key for access.
 */
declare const PROD_WEBSOCKET_URL = "wss://prediction-markets-api.dflow.net/api/v1/ws";
/**
 * USDC token mint address on Solana mainnet.
 * Used as the default settlement currency for prediction markets.
 */
declare const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
/**
 * Native SOL mint address (wrapped SOL).
 */
declare const SOL_MINT = "So11111111111111111111111111111111111111112";
/**
 * Default slippage tolerance in basis points (0.5%).
 * 50 bps = 0.5% = multiply price by 1.005 for max acceptable price.
 */
declare const DEFAULT_SLIPPAGE_BPS = 50;
/**
 * Number of decimal places for outcome tokens.
 * All YES/NO tokens use 6 decimals (same as USDC).
 */
declare const OUTCOME_TOKEN_DECIMALS = 6;
/**
 * Maximum number of items in a batch request.
 * Applies to getMarketsBatch and similar batch endpoints.
 */
declare const MAX_BATCH_SIZE = 100;
/**
 * Maximum number of addresses for filterOutcomeMints.
 */
declare const MAX_FILTER_ADDRESSES = 200;

export { type Candlestick, type CandlestickPeriod, type CategoryTags, DEFAULT_SLIPPAGE_BPS, DFlowApiError, DFlowClient, type DFlowClientOptions, type DFlowEnvironment, DFlowWebSocket, type Event, EventsAPI, type EventsParams, type EventsResponse, type ExecutionMode, type FilterOutcomeMintsParams, type FilterOutcomeMintsResponse, type ForecastHistory, type ForecastHistoryPoint, HttpClient, IntentAPI, type IntentQuote, type IntentQuoteParams, type IntentResponse, type LiveData, LiveDataAPI, type LiveDataMilestone, type LiveDataResponse, MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES, METADATA_API_BASE_URL, type Market, type MarketAccount, type MarketResult, type MarketStatus, MarketsAPI, type MarketsBatchParams, type MarketsBatchResponse, type MarketsParams, type MarketsResponse, OUTCOME_TOKEN_DECIMALS, type OrderFill, type OrderParams, type OrderResponse, type OrderStatusResponse, type OrderStatusType, type Orderbook, OrderbookAPI, type OrderbookLevel, type OrderbookUpdate, OrdersAPI, type OutcomeMintsResponse, PROD_METADATA_API_BASE_URL, PROD_TRADE_API_BASE_URL, PROD_WEBSOCKET_URL, type PaginateOptions, type PaginatedResponse, type PaginationParams, type PositionType, PredictionMarketAPI, type PredictionMarketInitParams, type PredictionMarketInitResponse, type PriceUpdate, type PriorityFeeConfig, type QuoteParams, type RedemptionResult, type RedemptionStatus, type RetryOptions, type RoutePlanStep, SOL_MINT, SearchAPI, type SearchParams, type SearchResult, type SerializedInstruction, type Series, SeriesAPI, type SeriesResponse, SportsAPI, type SportsFilter, type SportsFilters, type SubmitIntentParams, SwapAPI, type SwapInstructionsResponse, type SwapParams, type SwapQuote, type SwapResponse, TRADE_API_BASE_URL, TagsAPI, type Token, type TokenBalance, type TokenWithDecimals, TokensAPI, type Trade, type TradeAction, type TradeSide, type TradeUpdate, TradesAPI, type TradesParams, type TradesResponse, type TransactionConfirmation, USDC_MINT, type UserPosition, type Venue, VenuesAPI, WEBSOCKET_URL, type WebSocketChannel, type WebSocketMessage, type WebSocketOptions, type WebSocketSubscribeMessage, type WebSocketUnsubscribeMessage, type WebSocketUpdate, calculateScalarPayout, collectAll, countAll, createRetryable, defaultShouldRetry, findFirst, getTokenBalances, getUserPositions, isRedemptionEligible, paginate, signAndSendTransaction, signSendAndConfirm, waitForConfirmation, withRetry };
