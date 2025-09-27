import { 
  listTickers, 
  getPreviousClose, 
  getRateLimitStatus,
} from '../polygonApi'

// Mock fetch
const mockFetch = vi.mocked(fetch)

describe('polygonApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getRateLimitStatus', () => {
    it('should return initial rate limit status', () => {
      const status = getRateLimitStatus()
      
      expect(status).toEqual({
        canMakeCall: true,
        remainingCalls: 5,
        timeUntilNextCall: 0,
        totalCalls: 5,
      })
    })

    it('should update remaining calls after API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      await listTickers({})
      
      const status = getRateLimitStatus()
      expect(status.remainingCalls).toBe(4)
    })

    it('should calculate time until next call when rate limited', async () => {
      // Make 5 API calls to reach rate limit
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      for (let i = 0; i < 5; i++) {
        await listTickers({})
      }

      const status = getRateLimitStatus()
      expect(status.canMakeCall).toBe(false)
      expect(status.remainingCalls).toBe(0)
      expect(status.timeUntilNextCall).toBeGreaterThan(0)
    })

    it('should reset rate limit after time window', async () => {
      // Make 5 API calls
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      for (let i = 0; i < 5; i++) {
        await listTickers({})
      }

      expect(getRateLimitStatus().canMakeCall).toBe(false)

      // Advance time by rate window (1 minute)
      vi.advanceTimersByTime(60000)

      const status = getRateLimitStatus()
      expect(status.canMakeCall).toBe(true)
      expect(status.remainingCalls).toBe(5)
    })
  })

  describe('listTickers', () => {
    it('should make API call with correct parameters', async () => {
      const mockResponse = {
        results: [
          {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            type: 'CS',
            primary_exchange: 'NASDAQ',
          },
        ],
        count: 1,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await listTickers({
        market: 'stocks',
        active: true,
        limit: 20,
        search: 'AAPL',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.polygon.io/v3/reference/tickers')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('market=stocks')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('active=true')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=AAPL')
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(listTickers({})).rejects.toThrow('Polygon API Error: 500 Internal Server Error')
    })

    it('should retry on 429 rate limit error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: [] }),
        } as Response)

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await listTickers({})

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited by server')
      )

      consoleSpy.mockRestore()
    })

    it('should retry on 5xx server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: [] }),
        } as Response)

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await listTickers({})

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Server error 500')
      )

      consoleSpy.mockRestore()
    })

    it('should wait when rate limited', async () => {
      // Make 5 calls to reach rate limit
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      for (let i = 0; i < 5; i++) {
        await listTickers({})
      }

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // This call should wait
      const promise = listTickers({})

      // Advance time to simulate waiting
      vi.advanceTimersByTime(60000)

      await promise

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit reached')
      )

      consoleSpy.mockRestore()
    })

    it('should include API key in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      await listTickers({})

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('apikey=')
      )
    })

    it('should handle cursor pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      await listTickers({ cursor: 'next-page-cursor' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('cursor=next-page-cursor')
      )
    })
  })

  describe('getPreviousClose', () => {
    it('should make API call for previous close data', async () => {
      const mockResponse = {
        results: [
          {
            c: 150.25, // close
            h: 152.00, // high
            l: 149.50, // low
            o: 151.00, // open
            v: 1000000, // volume
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await getPreviousClose('AAPL')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/aggs/ticker/AAPL/prev')
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle adjusted parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      await getPreviousClose('AAPL', false)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('adjusted=false')
      )
    })
  })

  describe('localStorage persistence', () => {
    it('should persist API call timestamps in localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)

      await listTickers({})

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'polygon_api_calls',
        expect.stringContaining('[')
      )
    })

    it('should read API call timestamps from localStorage', () => {
      const timestamps = [Date.now() - 30000] // 30 seconds ago
      localStorage.setItem('polygon_api_calls', JSON.stringify(timestamps))

      const status = getRateLimitStatus()
      expect(status.remainingCalls).toBe(4) // 5 - 1 = 4
    })

    it('should clean up old timestamps from localStorage', () => {
      const oldTimestamp = Date.now() - 70000 // 70 seconds ago (older than 1 minute)
      const recentTimestamp = Date.now() - 30000 // 30 seconds ago
      
      localStorage.setItem('polygon_api_calls', JSON.stringify([oldTimestamp, recentTimestamp]))

      const status = getRateLimitStatus()
      expect(status.remainingCalls).toBe(4) // Only recent timestamp should count
    })

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Should not throw error
      const status = getRateLimitStatus()
      expect(status).toBeDefined()

      // Restore
      localStorage.setItem = originalSetItem
      consoleSpy.mockRestore()
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('polygon_api_calls', 'invalid-json')

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const status = getRateLimitStatus()
      expect(status.remainingCalls).toBe(5) // Should default to full limit

      consoleSpy.mockRestore()
    })
  })

  describe('network error handling', () => {
    it('should retry on network errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: [] }),
        } as Response)

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      await listTickers({})

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network error')
      )

      consoleSpy.mockRestore()
    })

    it('should not retry network errors more than once', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(listTickers({})).rejects.toThrow('Network error')
      expect(mockFetch).toHaveBeenCalledTimes(2) // Original + 1 retry
    })
  })
})
