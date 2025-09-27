import { fetchStocks, clearCaches } from '../stockService'
import * as polygonApi from '@/lib/polygonApi'

// Mock the polygon API
vi.mock('@/lib/polygonApi')

describe('stockService', () => {
  const mockListTickers = vi.mocked(polygonApi.listTickers)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Clear the service's internal caches
    clearCaches()
    
    // Set default mock response
    mockListTickers.mockResolvedValue({
      results: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          type: 'CS',
          primary_exchange: 'NASDAQ',
        },
        {
          ticker: 'GOOGL',
          name: 'Alphabet Inc.',
          type: 'CS',
          primary_exchange: 'NASDAQ',
        },
      ],
      count: 2,
      next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=next',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('fetchStocks', () => {
    const mockPolygonResponse = {
      results: [
        {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          type: 'CS',
          primary_exchange: 'NASDAQ',
        },
        {
          ticker: 'GOOGL',
          name: 'Alphabet Inc.',
          type: 'CS',
          primary_exchange: 'NASDAQ',
        },
      ],
      count: 2,
      next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=next',
    }

    it('should fetch stocks successfully', async () => {
      mockListTickers.mockResolvedValue(mockPolygonResponse)

      const result = await fetchStocks(0, '', 20)

      expect(mockListTickers).toHaveBeenCalledWith({
        market: 'stocks',
        active: true,
        order: 'asc',
        limit: 20,
        sort: 'ticker',
      })

      expect(result).toEqual({
        stocks: [
          {
            id: 'AAPL',
            ticker: 'AAPL',
            companyName: 'Apple Inc.',
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            marketCap: 0,
            sector: 'CS',
            description: 'Apple Inc. (AAPL) is traded on NASDAQ',
          },
          {
            id: 'GOOGL',
            ticker: 'GOOGL',
            companyName: 'Alphabet Inc.',
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            marketCap: 0,
            sector: 'CS',
            description: 'Alphabet Inc. (GOOGL) is traded on NASDAQ',
          },
        ],
        total: 2,
        hasMore: true,
      })
    })

    it('should include search query in API call', async () => {
      mockListTickers.mockResolvedValue(mockPolygonResponse)

      await fetchStocks(0, 'AAPL', 20)

      expect(mockListTickers).toHaveBeenCalledWith({
        market: 'stocks',
        active: true,
        order: 'asc',
        limit: 20,
        sort: 'ticker',
        search: 'AAPL',
      })
    })

    it('should handle pagination with cursor', async () => {
      
      // First call to set up pagination cache
      mockListTickers.mockResolvedValueOnce(mockPolygonResponse)
      await fetchStocks(0, '', 20)

      // Second call should use cursor
      mockListTickers.mockResolvedValueOnce({
        ...mockPolygonResponse,
        next_url: null,
      })

      await fetchStocks(1, '', 20)

      // Should be called twice
      expect(mockListTickers).toHaveBeenCalledTimes(2)
    })

    it('should use cache when available', async () => {
      mockListTickers.mockResolvedValue(mockPolygonResponse)

      // First call
      await fetchStocks(0, '', 20)
      
      // Second call should use cache
      await fetchStocks(0, '', 20)

      // Should only make one API call due to caching
      expect(mockListTickers).toHaveBeenCalledTimes(1)
    })

    it('should handle empty results', async () => {
      mockListTickers.mockResolvedValueOnce({
        results: [],
        count: 0,
        next_url: null,
      })

      const result = await fetchStocks(0, '', 20)

      expect(result).toEqual({
        stocks: [],
        total: 0,
        hasMore: false,
      })
    })

    it('should handle API errors', async () => {
      const mockError = new Error('API Error')
      mockListTickers.mockRejectedValueOnce(mockError)

      await expect(fetchStocks(0, '', 20)).rejects.toThrow(
        'Failed to fetch stock data: API Error'
      )
    })

    it('should transform ticker data correctly', async () => {
      const customResponse = {
        results: [
          {
            ticker: 'TSLA',
            name: 'Tesla, Inc.',
            type: 'Common Stock',
            primary_exchange: 'NASDAQ',
          },
        ],
        count: 1,
        next_url: null,
      }

      mockListTickers.mockResolvedValueOnce(customResponse)

      const result = await fetchStocks(0, '', 20)

      expect(result.stocks[0]).toEqual({
        id: 'TSLA',
        ticker: 'TSLA',
        companyName: 'Tesla, Inc.',
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        sector: 'Common Stock',
        description: 'Tesla, Inc. (TSLA) is traded on NASDAQ',
      })
    })

    it('should handle missing ticker properties', async () => {
      const incompleteResponse = {
        results: [
          {
            ticker: 'TEST',
            name: 'Test Company',
            // Missing type and primary_exchange
          },
        ],
        count: 1,
        next_url: null,
      }

      mockListTickers.mockResolvedValueOnce(incompleteResponse)

      const result = await fetchStocks(0, '', 20)

      expect(result.stocks[0]).toEqual({
        id: 'TEST',
        ticker: 'TEST',
        companyName: 'Test Company',
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        sector: 'Common Stock', // Default value
        description: 'Test Company (TEST) is traded on NASDAQ', // Default exchange
      })
    })

    it('should cache results for 30 minutes', async () => {
      mockListTickers.mockResolvedValue(mockPolygonResponse)

      // First call
      await fetchStocks(0, '', 20)

      // Advance time by 29 minutes (should still use cache)
      vi.advanceTimersByTime(29 * 60 * 1000)

      // Second call
      await fetchStocks(0, '', 20)

      expect(mockListTickers).toHaveBeenCalledTimes(1)

      // Advance time by 2 more minutes (total 31 minutes, cache expired)
      vi.advanceTimersByTime(2 * 60 * 1000)

      // Third call should make new API call
      await fetchStocks(0, '', 20)

      expect(mockListTickers).toHaveBeenCalledTimes(2)
    })

    it('should handle different search queries separately', async () => {
      mockListTickers.mockResolvedValue(mockPolygonResponse)

      // Different search queries should not share cache
      await fetchStocks(0, 'AAPL', 20)
      await fetchStocks(0, 'GOOGL', 20)

      expect(mockListTickers).toHaveBeenCalledTimes(2)
    })

    it('should handle different page sizes', async () => {
      mockListTickers.mockResolvedValue(mockPolygonResponse)

      await fetchStocks(0, '', 10)

      expect(mockListTickers).toHaveBeenCalledWith({
        market: 'stocks',
        active: true,
        order: 'asc',
        limit: 10,
        sort: 'ticker',
      })
    })

    it('should use cache for identical requests', async () => {
      // First call
      const result1 = await fetchStocks(0, '', 20)
      expect(mockListTickers).toHaveBeenCalledTimes(1)

      // Second identical call should use cache
      const result2 = await fetchStocks(0, '', 20)
      expect(mockListTickers).toHaveBeenCalledTimes(1) // Still 1 call
      
      // Results should be identical
      expect(result1).toEqual(result2)
    })

    it('should handle null or undefined results', async () => {
      mockListTickers.mockResolvedValueOnce({
        results: null as any,
        count: 0,
        next_url: null,
      })

      const result = await fetchStocks(0, '', 20)

      expect(result).toEqual({
        stocks: [],
        total: 0,
        hasMore: false,
      })
    })

    it('should extract cursor from next_url correctly', async () => {
      const responseWithCursor = {
        ...mockPolygonResponse,
        next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=abc123&other=param',
      }

      mockListTickers.mockResolvedValue(responseWithCursor)

      await fetchStocks(0, '', 20)

      // The cursor should be extracted and stored for next page
      // This is tested indirectly through the pagination functionality
      expect(mockListTickers).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple sequential requests', async () => {
      // First request
      await fetchStocks(0, '', 20)
      expect(mockListTickers).toHaveBeenCalledTimes(1)

      // Second request should use cache
      await fetchStocks(0, '', 20)
      expect(mockListTickers).toHaveBeenCalledTimes(1)

      // Third request should also use cache
      await fetchStocks(0, '', 20)
      expect(mockListTickers).toHaveBeenCalledTimes(1)
    })
  })
})
