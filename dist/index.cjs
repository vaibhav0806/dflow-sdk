'use strict';

var web3_js = require('@solana/web3.js');
var splToken = require('@solana/spl-token');

// src/utils/http.ts
var DFlowApiError = class extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
    this.name = "DFlowApiError";
  }
};
var HttpClient = class {
  baseUrl;
  apiKey;
  defaultHeaders;
  constructor(options) {
    this.baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : options.baseUrl + "/";
    this.apiKey = options.apiKey;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers
    };
  }
  getHeaders() {
    const headers = { ...this.defaultHeaders };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }
    return headers;
  }
  buildUrl(path, params) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(cleanPath, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }
  async get(path, params) {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  async post(path, body) {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : void 0
    });
    return this.handleResponse(response);
  }
  async handleResponse(response) {
    const text = await response.text();
    if (!response.ok) {
      let errorBody;
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
      return JSON.parse(text);
    } catch {
      throw new DFlowApiError(
        `Failed to parse response as JSON`,
        response.status,
        text
      );
    }
  }
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
};

// src/utils/constants.ts
var METADATA_API_BASE_URL = "https://prediction-markets-api.dflow.net/api/v1";
var TRADE_API_BASE_URL = "https://quote-api.dflow.net";
var WEBSOCKET_URL = "wss://prediction-markets-api.dflow.net/api/v1/ws";
var DEV_METADATA_API_BASE_URL = "https://dev-prediction-markets-api.dflow.net/api/v1";
var DEV_TRADE_API_BASE_URL = "https://dev-quote-api.dflow.net";
var DEV_WEBSOCKET_URL = "wss://dev-prediction-markets-api.dflow.net/api/v1/ws";
var USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
var SOL_MINT = "So11111111111111111111111111111111111111112";
var DEFAULT_SLIPPAGE_BPS = 50;
var MAX_BATCH_SIZE = 100;
var MAX_FILTER_ADDRESSES = 200;
var OUTCOME_TOKEN_DECIMALS = 6;

// src/api/metadata/events.ts
var EventsAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getEvent(eventId, withNestedMarkets) {
    return this.http.get(`/event/${eventId}`, {
      withNestedMarkets
    });
  }
  async getEvents(params) {
    return this.http.get("/events", params);
  }
  async getEventForecastHistory(seriesTicker, eventId) {
    return this.http.get(
      `/event/${seriesTicker}/${eventId}/forecast_percentile_history`
    );
  }
  async getEventForecastByMint(mintAddress) {
    return this.http.get(
      `/event/by-mint/${mintAddress}/forecast_percentile_history`
    );
  }
  async getEventCandlesticks(ticker) {
    const response = await this.http.get(
      `/event/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }
};

// src/api/metadata/markets.ts
var MarketsAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getMarket(marketId) {
    return this.http.get(`/market/${marketId}`);
  }
  async getMarketByMint(mintAddress) {
    return this.http.get(`/market/by-mint/${mintAddress}`);
  }
  async getMarkets(params) {
    return this.http.get("/markets", params);
  }
  async getMarketsBatch(params) {
    const totalItems = (params.tickers?.length ?? 0) + (params.mints?.length ?? 0);
    if (totalItems > MAX_BATCH_SIZE) {
      throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} items`);
    }
    const response = await this.http.post("/markets/batch", params);
    return response.markets;
  }
  async getOutcomeMints() {
    const response = await this.http.get("/outcome_mints");
    return response.mints;
  }
  async filterOutcomeMints(addresses) {
    if (addresses.length > MAX_FILTER_ADDRESSES) {
      throw new Error(`Address count exceeds maximum of ${MAX_FILTER_ADDRESSES}`);
    }
    const params = { addresses };
    const response = await this.http.post(
      "/filter_outcome_mints",
      params
    );
    return response.outcomeMints;
  }
  async getMarketCandlesticks(ticker) {
    const response = await this.http.get(
      `/market/${ticker}/candlesticks`
    );
    return response.candlesticks;
  }
  async getMarketCandlesticksByMint(mintAddress) {
    const response = await this.http.get(
      `/market/by-mint/${mintAddress}/candlesticks`
    );
    return response.candlesticks;
  }
};

// src/api/metadata/orderbook.ts
var OrderbookAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getOrderbook(marketTicker) {
    return this.http.get(`/orderbook/${marketTicker}`);
  }
  async getOrderbookByMint(mintAddress) {
    return this.http.get(`/orderbook/by-mint/${mintAddress}`);
  }
};

// src/api/metadata/trades.ts
var TradesAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getTrades(params) {
    return this.http.get("/trades", params);
  }
  async getTradesByMint(mintAddress, params) {
    return this.http.get(`/trades/by-mint/${mintAddress}`, params);
  }
};

// src/api/metadata/liveData.ts
var LiveDataAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getLiveData(milestones) {
    const response = await this.http.get("/live_data", {
      milestones: milestones.join(",")
    });
    return response.data;
  }
  async getLiveDataByEvent(eventTicker) {
    return this.http.get(`/live_data/by-event/${eventTicker}`);
  }
  async getLiveDataByMint(mintAddress) {
    return this.http.get(`/live_data/by-mint/${mintAddress}`);
  }
};

// src/api/metadata/series.ts
var SeriesAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getSeries() {
    const response = await this.http.get("/series");
    return response.series;
  }
  async getSeriesByTicker(ticker) {
    return this.http.get(`/series/${ticker}`);
  }
};

// src/api/metadata/tags.ts
var TagsAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getTagsByCategories() {
    return this.http.get("/tags_by_categories");
  }
};

// src/api/metadata/sports.ts
var SportsAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getFiltersBySports() {
    return this.http.get("/filters_by_sports");
  }
};

// src/api/metadata/search.ts
var SearchAPI = class {
  constructor(http) {
    this.http = http;
  }
  async search(params) {
    return this.http.get("/search", params);
  }
};

// src/api/trade/orders.ts
var OrdersAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getOrder(params) {
    return this.http.get("/order", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      platformFeeBps: params.platformFeeBps,
      platformFeeAccount: params.platformFeeAccount
    });
  }
  async getOrderStatus(signature) {
    return this.http.get("/order-status", { signature });
  }
};

// src/api/trade/swap.ts
var SwapAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getQuote(params) {
    return this.http.get("/quote", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps
    });
  }
  async createSwap(params) {
    return this.http.post("/swap", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee
    });
  }
  async getSwapInstructions(params) {
    return this.http.post("/swap-instructions", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      wrapUnwrapSol: params.wrapUnwrapSol,
      priorityFee: params.priorityFee
    });
  }
};

// src/api/trade/intent.ts
var IntentAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getIntentQuote(params) {
    return this.http.get("/intent", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      mode: params.mode
    });
  }
  async submitIntent(params) {
    return this.http.post("/submit-intent", {
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: String(params.amount),
      mode: params.mode,
      slippageBps: params.slippageBps,
      userPublicKey: params.userPublicKey,
      priorityFee: params.priorityFee
    });
  }
};

// src/api/trade/predictionMarket.ts
var PredictionMarketAPI = class {
  constructor(http) {
    this.http = http;
  }
  async initializeMarket(params) {
    return this.http.get("/prediction-market-init", {
      marketTicker: params.marketTicker,
      userPublicKey: params.userPublicKey,
      settlementMint: params.settlementMint ?? USDC_MINT
    });
  }
};

// src/api/trade/tokens.ts
var TokensAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getTokens() {
    return this.http.get("/tokens");
  }
  async getTokensWithDecimals() {
    return this.http.get("/tokens-with-decimals");
  }
};

// src/api/trade/venues.ts
var VenuesAPI = class {
  constructor(http) {
    this.http = http;
  }
  async getVenues() {
    return this.http.get("/venues");
  }
};

// src/websocket/client.ts
var DFlowWebSocket = class {
  ws = null;
  url;
  reconnect;
  reconnectInterval;
  maxReconnectAttempts;
  reconnectAttempts = 0;
  isConnecting = false;
  priceCallbacks = [];
  tradeCallbacks = [];
  orderbookCallbacks = [];
  errorCallbacks = [];
  closeCallbacks = [];
  constructor(options) {
    this.url = options?.url ?? WEBSOCKET_URL;
    this.reconnect = options?.reconnect ?? true;
    this.reconnectInterval = options?.reconnectInterval ?? 5e3;
    this.maxReconnectAttempts = options?.maxReconnectAttempts ?? 10;
  }
  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
        this.ws.onerror = () => {
          this.isConnecting = false;
          const error = new Error("WebSocket error");
          this.errorCallbacks.forEach((cb) => cb(error));
          reject(error);
        };
        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.closeCallbacks.forEach((cb) => cb(event));
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  disconnect() {
    this.reconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  attemptReconnect() {
    if (!this.reconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error("Max reconnection attempts reached");
      this.errorCallbacks.forEach((cb) => cb(error));
      return;
    }
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect().catch(() => {
      });
    }, this.reconnectInterval);
  }
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      switch (data.channel) {
        case "prices":
          this.priceCallbacks.forEach((cb) => cb(data));
          break;
        case "trades":
          this.tradeCallbacks.forEach((cb) => cb(data));
          break;
        case "orderbook":
          this.orderbookCallbacks.forEach((cb) => cb(data));
          break;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to parse message");
      this.errorCallbacks.forEach((cb) => cb(err));
    }
  }
  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(JSON.stringify(message));
  }
  subscribePrices(tickers) {
    this.send({ type: "subscribe", channel: "prices", tickers });
  }
  subscribeAllPrices() {
    this.send({ type: "subscribe", channel: "prices", all: true });
  }
  subscribeTrades(tickers) {
    this.send({ type: "subscribe", channel: "trades", tickers });
  }
  subscribeAllTrades() {
    this.send({ type: "subscribe", channel: "trades", all: true });
  }
  subscribeOrderbook(tickers) {
    this.send({ type: "subscribe", channel: "orderbook", tickers });
  }
  subscribeAllOrderbook() {
    this.send({ type: "subscribe", channel: "orderbook", all: true });
  }
  unsubscribe(channel, tickers) {
    if (tickers) {
      this.send({ type: "unsubscribe", channel, tickers });
    } else {
      this.send({ type: "unsubscribe", channel, all: true });
    }
  }
  onPrice(callback) {
    this.priceCallbacks.push(callback);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter((cb) => cb !== callback);
    };
  }
  onTrade(callback) {
    this.tradeCallbacks.push(callback);
    return () => {
      this.tradeCallbacks = this.tradeCallbacks.filter((cb) => cb !== callback);
    };
  }
  onOrderbook(callback) {
    this.orderbookCallbacks.push(callback);
    return () => {
      this.orderbookCallbacks = this.orderbookCallbacks.filter((cb) => cb !== callback);
    };
  }
  onError(callback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }
  onClose(callback) {
    this.closeCallbacks.push(callback);
    return () => {
      this.closeCallbacks = this.closeCallbacks.filter((cb) => cb !== callback);
    };
  }
  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
};

// src/client.ts
var DFlowClient = class {
  metadataHttp;
  tradeHttp;
  events;
  markets;
  orderbook;
  trades;
  liveData;
  series;
  tags;
  sports;
  search;
  orders;
  swap;
  intent;
  predictionMarket;
  tokens;
  venues;
  ws;
  constructor(options) {
    this.metadataHttp = new HttpClient({
      baseUrl: options?.metadataBaseUrl ?? METADATA_API_BASE_URL,
      apiKey: options?.apiKey
    });
    this.tradeHttp = new HttpClient({
      baseUrl: options?.tradeBaseUrl ?? TRADE_API_BASE_URL,
      apiKey: options?.apiKey
    });
    this.events = new EventsAPI(this.metadataHttp);
    this.markets = new MarketsAPI(this.metadataHttp);
    this.orderbook = new OrderbookAPI(this.metadataHttp);
    this.trades = new TradesAPI(this.metadataHttp);
    this.liveData = new LiveDataAPI(this.metadataHttp);
    this.series = new SeriesAPI(this.metadataHttp);
    this.tags = new TagsAPI(this.metadataHttp);
    this.sports = new SportsAPI(this.metadataHttp);
    this.search = new SearchAPI(this.metadataHttp);
    this.orders = new OrdersAPI(this.tradeHttp);
    this.swap = new SwapAPI(this.tradeHttp);
    this.intent = new IntentAPI(this.tradeHttp);
    this.predictionMarket = new PredictionMarketAPI(this.tradeHttp);
    this.tokens = new TokensAPI(this.tradeHttp);
    this.venues = new VenuesAPI(this.tradeHttp);
    this.ws = new DFlowWebSocket(options?.wsOptions);
  }
  setApiKey(apiKey) {
    this.metadataHttp.setApiKey(apiKey);
    this.tradeHttp.setApiKey(apiKey);
  }
};
async function signAndSendTransaction(connection, transactionBase64, signer) {
  const transactionBuffer = Buffer.from(transactionBase64, "base64");
  const transaction = web3_js.VersionedTransaction.deserialize(transactionBuffer);
  transaction.sign([signer]);
  const signature = await connection.sendTransaction(transaction, {
    skipPreflight: false,
    preflightCommitment: "confirmed"
  });
  return signature;
}
async function waitForConfirmation(connection, signature, commitment = "confirmed", timeoutMs = 6e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const response = await connection.getSignatureStatus(signature);
    const status = response.value;
    if (status) {
      if (status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }
      const confirmationStatus = status.confirmationStatus;
      if (confirmationStatus === "finalized" || commitment === "confirmed" && confirmationStatus === "confirmed" || commitment === "processed" && confirmationStatus === "processed") {
        return {
          signature,
          slot: status.slot,
          confirmationStatus: confirmationStatus ?? "processed",
          err: status.err
        };
      }
    }
    await sleep(2e3);
  }
  throw new Error(`Transaction confirmation timeout after ${timeoutMs}ms`);
}
async function signSendAndConfirm(connection, transactionBase64, signer, commitment = "confirmed") {
  const signature = await signAndSendTransaction(connection, transactionBase64, signer);
  return waitForConfirmation(connection, signature, commitment);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function getTokenBalances(connection, walletAddress) {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
    programId: splToken.TOKEN_2022_PROGRAM_ID
  });
  return tokenAccounts.value.map(({ account }) => {
    const info = account.data.parsed.info;
    return {
      mint: info.mint,
      rawBalance: info.tokenAmount.amount,
      balance: info.tokenAmount.uiAmount,
      decimals: info.tokenAmount.decimals
    };
  }).filter((token) => token.balance > 0);
}
async function getUserPositions(connection, walletAddress, marketsAPI) {
  const tokenBalances = await getTokenBalances(connection, walletAddress);
  if (tokenBalances.length === 0) {
    return [];
  }
  const allMints = tokenBalances.map((t) => t.mint);
  const predictionMints = await marketsAPI.filterOutcomeMints(allMints);
  if (predictionMints.length === 0) {
    return [];
  }
  const outcomeTokens = tokenBalances.filter((t) => predictionMints.includes(t.mint));
  const markets = await marketsAPI.getMarketsBatch({ mints: predictionMints });
  const marketsByMint = /* @__PURE__ */ new Map();
  markets.forEach((market) => {
    Object.values(market.accounts).forEach((account) => {
      marketsByMint.set(account.yesMint, market);
      marketsByMint.set(account.noMint, market);
      marketsByMint.set(account.marketLedger, market);
    });
  });
  return outcomeTokens.map((token) => {
    const market = marketsByMint.get(token.mint) ?? null;
    if (!market) {
      return {
        mint: token.mint,
        balance: token.balance,
        decimals: token.decimals,
        position: "UNKNOWN",
        market: null
      };
    }
    const isYesToken = Object.values(market.accounts).some(
      (account) => account.yesMint === token.mint
    );
    const isNoToken = Object.values(market.accounts).some(
      (account) => account.noMint === token.mint
    );
    return {
      mint: token.mint,
      balance: token.balance,
      decimals: token.decimals,
      position: isYesToken ? "YES" : isNoToken ? "NO" : "UNKNOWN",
      market
    };
  });
}
function isRedemptionEligible(market, outcomeMint) {
  if (market.status !== "determined" && market.status !== "finalized") {
    return false;
  }
  for (const account of Object.values(market.accounts)) {
    if (account.redemptionStatus !== "open") {
      continue;
    }
    const isWinningYes = market.result === "yes" && account.yesMint === outcomeMint;
    const isWinningNo = market.result === "no" && account.noMint === outcomeMint;
    const isScalarOutcome = market.result === "" && account.scalarOutcomePct !== void 0 && (account.yesMint === outcomeMint || account.noMint === outcomeMint);
    if (isWinningYes || isWinningNo || isScalarOutcome) {
      return true;
    }
  }
  return false;
}
function calculateScalarPayout(market, outcomeMint, amount) {
  for (const account of Object.values(market.accounts)) {
    if (account.scalarOutcomePct === void 0) continue;
    if (account.yesMint === outcomeMint) {
      return amount * account.scalarOutcomePct / 1e4;
    }
    if (account.noMint === outcomeMint) {
      return amount * (1e4 - account.scalarOutcomePct) / 1e4;
    }
  }
  return 0;
}

exports.DEFAULT_SLIPPAGE_BPS = DEFAULT_SLIPPAGE_BPS;
exports.DEV_METADATA_API_BASE_URL = DEV_METADATA_API_BASE_URL;
exports.DEV_TRADE_API_BASE_URL = DEV_TRADE_API_BASE_URL;
exports.DEV_WEBSOCKET_URL = DEV_WEBSOCKET_URL;
exports.DFlowApiError = DFlowApiError;
exports.DFlowClient = DFlowClient;
exports.DFlowWebSocket = DFlowWebSocket;
exports.EventsAPI = EventsAPI;
exports.HttpClient = HttpClient;
exports.IntentAPI = IntentAPI;
exports.LiveDataAPI = LiveDataAPI;
exports.MAX_BATCH_SIZE = MAX_BATCH_SIZE;
exports.MAX_FILTER_ADDRESSES = MAX_FILTER_ADDRESSES;
exports.METADATA_API_BASE_URL = METADATA_API_BASE_URL;
exports.MarketsAPI = MarketsAPI;
exports.OUTCOME_TOKEN_DECIMALS = OUTCOME_TOKEN_DECIMALS;
exports.OrderbookAPI = OrderbookAPI;
exports.OrdersAPI = OrdersAPI;
exports.PredictionMarketAPI = PredictionMarketAPI;
exports.SOL_MINT = SOL_MINT;
exports.SearchAPI = SearchAPI;
exports.SeriesAPI = SeriesAPI;
exports.SportsAPI = SportsAPI;
exports.SwapAPI = SwapAPI;
exports.TRADE_API_BASE_URL = TRADE_API_BASE_URL;
exports.TagsAPI = TagsAPI;
exports.TokensAPI = TokensAPI;
exports.TradesAPI = TradesAPI;
exports.USDC_MINT = USDC_MINT;
exports.VenuesAPI = VenuesAPI;
exports.WEBSOCKET_URL = WEBSOCKET_URL;
exports.calculateScalarPayout = calculateScalarPayout;
exports.getTokenBalances = getTokenBalances;
exports.getUserPositions = getUserPositions;
exports.isRedemptionEligible = isRedemptionEligible;
exports.signAndSendTransaction = signAndSendTransaction;
exports.signSendAndConfirm = signSendAndConfirm;
exports.waitForConfirmation = waitForConfirmation;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map