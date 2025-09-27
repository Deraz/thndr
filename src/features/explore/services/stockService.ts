import { listTickers } from "@/lib/polygonApi";
import type {
  Stock,
  StockListResponse,
  PolygonTicker,
  PolygonTickersResponse,
} from "../types";

// Aggressive caching for extreme rate limits (5 calls per minute)
const stockListCache = new Map<
  string,
  { data: PolygonTickersResponse; timestamp: number }
>();
const paginationCache = new Map<string, string>(); // key: search query, value: next cursor
const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION) || 30 * 60 * 1000; // 30 minutes - very long cache

// Function to clear caches (for testing)
export const clearCaches = () => {
  stockListCache.clear();
  paginationCache.clear();
};

// Function to transform Polygon ticker to our Stock interface (no price data)
const transformTickerToStock = (ticker: PolygonTicker): Stock => {
  return {
    id: ticker.ticker,
    ticker: ticker.ticker,
    companyName: ticker.name,
    sector: ticker.type || "Common Stock",
    description: `${ticker.name} (${ticker.ticker}) is traded on ${
      ticker.primary_exchange || "NASDAQ"
    }`,
    // No price data in list view
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
  };
};

// Main function to fetch stocks using real Polygon.io API with aggressive caching
export const fetchStocks = async (
  pageParam: number = 0,
  searchQuery: string = "",
  limit: number = 20
): Promise<StockListResponse> => {
  try {
    // Generate cache key
    const cacheKey = `${searchQuery || "default"}_${pageParam}_${limit}`;

    // Check cache first (30 minute cache)
    const cached = stockListCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const stocks = (cached.data.results || []).map((ticker) => transformTickerToStock(ticker));
      return {
        stocks,
        total: cached.data.count || stocks.length,
        hasMore: !!cached.data.next_url,
      };
    }

    // Get cursor for pagination (if not first page)
    let cursor: string | undefined;
    if (pageParam > 0) {
      cursor = paginationCache.get(`${searchQuery || "default"}_${pageParam}`);
    }

    const response = (await listTickers({
      market: "stocks",
      active: true,
      order: "asc",
      limit: limit,
      sort: "ticker",
      ...(searchQuery && { search: searchQuery }),
      ...(cursor && { cursor }),
    })) as PolygonTickersResponse;

    if (!response.results || response.results.length === 0) {
      return {
        stocks: [],
        total: 0,
        hasMore: false,
      };
    }

    // Cache the API response
    stockListCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    // Store next cursor for pagination
    if (response.next_url) {
      const nextUrl = new URL(response.next_url);
      const nextCursor = nextUrl.searchParams.get("cursor");
      if (nextCursor) {
        paginationCache.set(
          `${searchQuery || "default"}_${pageParam + 1}`,
          nextCursor
        );
      }
    }

    // Transform tickers to stocks (no API calls, instant processing)
    const stocks = response.results.map((ticker) => transformTickerToStock(ticker));

    return {
      stocks,
      total: response.count || stocks.length,
      hasMore: !!response.next_url,
    };
  } catch (error) {
    console.error("Error fetching stocks from Polygon.io:", error);
    // Re-throw the error to be handled by the UI
    throw new Error(
      `Failed to fetch stock data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
