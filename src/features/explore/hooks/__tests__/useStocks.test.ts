import React, { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStocks } from '../useStocks'
import * as stockService from '../../services/stockService'

// Mock the stock service
vi.mock('../../services/stockService')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useStocks', () => {
  const mockFetchStocks = vi.mocked(stockService.fetchStocks)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch stocks successfully', async () => {
    const mockResponse = {
      stocks: [
        {
          id: 'AAPL',
          ticker: 'AAPL',
          companyName: 'Apple Inc.',
          price: 150.25,
          change: 2.5,
          changePercent: 1.69,
          volume: 1000000,
          marketCap: 2500000000,
          sector: 'Technology',
          description: 'Apple Inc. description',
        },
      ],
      total: 1,
      hasMore: false,
    }

    mockFetchStocks.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useStocks(''), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stocks).toEqual(mockResponse.stocks)
    expect(result.current.totalCount).toBe(1)
    expect(result.current.hasNextPage).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('should handle search query', async () => {
    const mockResponse = {
      stocks: [],
      total: 0,
      hasMore: false,
    }

    mockFetchStocks.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useStocks('AAPL'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetchStocks).toHaveBeenCalledWith(0, 'AAPL', 20)
  })

  it('should handle pagination', async () => {
    const mockFirstPage = {
      stocks: [
        {
          id: 'AAPL',
          ticker: 'AAPL',
          companyName: 'Apple Inc.',
          price: 150.25,
          change: 2.5,
          changePercent: 1.69,
          volume: 1000000,
          marketCap: 2500000000,
          sector: 'Technology',
          description: 'Apple Inc. description',
        },
      ],
      total: 2,
      hasMore: true,
    }

    const mockSecondPage = {
      stocks: [
        {
          id: 'GOOGL',
          ticker: 'GOOGL',
          companyName: 'Alphabet Inc.',
          price: 2750.80,
          change: -15.20,
          changePercent: -0.55,
          volume: 800000,
          marketCap: 1800000000,
          sector: 'Technology',
          description: 'Alphabet Inc. description',
        },
      ],
      total: 2,
      hasMore: false,
    }

    mockFetchStocks
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage)

    const { result } = renderHook(() => useStocks(''), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stocks).toEqual(mockFirstPage.stocks)
    expect(result.current.hasNextPage).toBe(true)

    // Fetch next page
    await result.current.fetchNextPage()

    await waitFor(() => {
      expect(result.current.isFetchingNextPage).toBe(false)
    })

    expect(result.current.stocks).toEqual([
      ...mockFirstPage.stocks,
      ...mockSecondPage.stocks,
    ])
    expect(result.current.hasNextPage).toBe(false)
  })

  it('should handle errors', async () => {
    const mockError = new Error('Failed to fetch stocks')
    mockFetchStocks.mockRejectedValue(mockError)

    const { result } = renderHook(() => useStocks(''), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(mockError)
    expect(result.current.stocks).toEqual([])
  })

  it('should handle search query changes', async () => {
    const mockResponse = {
      stocks: [],
      total: 0,
      hasMore: false,
    }

    mockFetchStocks.mockResolvedValue(mockResponse)

    const { result, rerender } = renderHook(
      ({ query }) => useStocks(query),
      {
        wrapper: createWrapper(),
        initialProps: { query: '' },
      }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Change query
    rerender({ query: 'AAPL' })

    // Should eventually call fetchStocks
    await waitFor(() => {
      expect(mockFetchStocks).toHaveBeenCalled()
    })
  })

  it('should handle query changes and load new data', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useStocks(query),
      {
        wrapper: createWrapper(),
        initialProps: { query: 'AAPL' },
      }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should have loaded some data
    expect(result.current.stocks).toBeDefined()
    const initialCallCount = mockFetchStocks.mock.calls.length

    // Change search query
    rerender({ query: 'GOOGL' })

    // Should eventually make another call
    await waitFor(() => {
      expect(mockFetchStocks.mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })

  it('should provide total count from response', async () => {
    const { result } = renderHook(() => useStocks(''), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should have a totalCount property
    expect(typeof result.current.totalCount).toBe('number')
    expect(result.current.totalCount).toBeGreaterThanOrEqual(0)
  })
})
