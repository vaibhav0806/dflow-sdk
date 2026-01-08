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
    transaction: string;
    quote: SwapQuote;
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

interface DFlowClientOptions {
    apiKey?: string;
    metadataBaseUrl?: string;
    tradeBaseUrl?: string;
    wsOptions?: WebSocketOptions;
}
declare class DFlowClient {
    private metadataHttp;
    private tradeHttp;
    readonly events: EventsAPI;
    readonly markets: MarketsAPI;
    readonly orderbook: OrderbookAPI;
    readonly trades: TradesAPI;
    readonly liveData: LiveDataAPI;
    readonly series: SeriesAPI;
    readonly tags: TagsAPI;
    readonly sports: SportsAPI;
    readonly search: SearchAPI;
    readonly orders: OrdersAPI;
    readonly swap: SwapAPI;
    readonly intent: IntentAPI;
    readonly predictionMarket: PredictionMarketAPI;
    readonly ws: DFlowWebSocket;
    constructor(options?: DFlowClientOptions);
    setApiKey(apiKey: string): void;
}

declare function signAndSendTransaction(connection: Connection, transactionBase64: string, signer: Keypair): Promise<string>;
declare function waitForConfirmation(connection: Connection, signature: string, commitment?: Commitment, timeoutMs?: number): Promise<TransactionConfirmation>;
declare function signSendAndConfirm(connection: Connection, transactionBase64: string, signer: Keypair, commitment?: Commitment): Promise<TransactionConfirmation>;

declare function getTokenBalances(connection: Connection, walletAddress: PublicKey): Promise<TokenBalance[]>;
declare function getUserPositions(connection: Connection, walletAddress: PublicKey, marketsAPI: MarketsAPI): Promise<UserPosition[]>;
declare function isRedemptionEligible(market: Market, outcomeMint: string): boolean;
declare function calculateScalarPayout(market: Market, outcomeMint: string, amount: number): number;

declare const METADATA_API_BASE_URL = "https://prediction-markets-api.dflow.net/api/v1";
declare const TRADE_API_BASE_URL = "https://quote-api.dflow.net";
declare const WEBSOCKET_URL = "wss://prediction-markets-api.dflow.net/api/v1/ws";
declare const DEV_METADATA_API_BASE_URL = "https://dev-prediction-markets-api.dflow.net/api/v1";
declare const DEV_TRADE_API_BASE_URL = "https://dev-quote-api.dflow.net";
declare const DEV_WEBSOCKET_URL = "wss://dev-prediction-markets-api.dflow.net/api/v1/ws";
declare const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
declare const SOL_MINT = "So11111111111111111111111111111111111111112";
declare const DEFAULT_SLIPPAGE_BPS = 50;
declare const MAX_BATCH_SIZE = 100;
declare const MAX_FILTER_ADDRESSES = 200;
declare const OUTCOME_TOKEN_DECIMALS = 6;

export { type Candlestick, type CandlestickPeriod, type CategoryTags, DEFAULT_SLIPPAGE_BPS, DEV_METADATA_API_BASE_URL, DEV_TRADE_API_BASE_URL, DEV_WEBSOCKET_URL, DFlowApiError, DFlowClient, type DFlowClientOptions, DFlowWebSocket, type Event, EventsAPI, type EventsParams, type EventsResponse, type ExecutionMode, type FilterOutcomeMintsParams, type FilterOutcomeMintsResponse, type ForecastHistory, type ForecastHistoryPoint, HttpClient, IntentAPI, type IntentQuote, type IntentQuoteParams, type IntentResponse, type LiveData, LiveDataAPI, type LiveDataMilestone, type LiveDataResponse, MAX_BATCH_SIZE, MAX_FILTER_ADDRESSES, METADATA_API_BASE_URL, type Market, type MarketAccount, type MarketResult, type MarketStatus, MarketsAPI, type MarketsBatchParams, type MarketsBatchResponse, type MarketsParams, type MarketsResponse, OUTCOME_TOKEN_DECIMALS, type OrderFill, type OrderParams, type OrderResponse, type OrderStatusResponse, type OrderStatusType, type Orderbook, OrderbookAPI, type OrderbookLevel, type OrderbookUpdate, OrdersAPI, type OutcomeMintsResponse, type PaginatedResponse, type PaginationParams, type PositionType, PredictionMarketAPI, type PredictionMarketInitParams, type PredictionMarketInitResponse, type PriceUpdate, type PriorityFeeConfig, type QuoteParams, type RedemptionResult, type RedemptionStatus, type RoutePlanStep, SOL_MINT, SearchAPI, type SearchParams, type SearchResult, type SerializedInstruction, type Series, SeriesAPI, type SeriesResponse, SportsAPI, type SportsFilter, type SportsFilters, type SubmitIntentParams, SwapAPI, type SwapInstructionsResponse, type SwapParams, type SwapQuote, type SwapResponse, TRADE_API_BASE_URL, TagsAPI, type TokenBalance, type Trade, type TradeAction, type TradeSide, type TradeUpdate, TradesAPI, type TradesParams, type TradesResponse, type TransactionConfirmation, USDC_MINT, type UserPosition, WEBSOCKET_URL, type WebSocketChannel, type WebSocketMessage, type WebSocketOptions, type WebSocketSubscribeMessage, type WebSocketUnsubscribeMessage, type WebSocketUpdate, calculateScalarPayout, getTokenBalances, getUserPositions, isRedemptionEligible, signAndSendTransaction, signSendAndConfirm, waitForConfirmation };
