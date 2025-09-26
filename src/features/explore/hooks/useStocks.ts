import { useState, useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchStocks } from '../services/stockService'

const ITEMS_PER_PAGE = 20

export const useStocks = (searchQuery: string = '') => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

  // Debounce search query
  const debounceSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [])

  // Update debounced query when search query changes
  useMemo(() => {
    const cleanup = debounceSearch(searchQuery)
    return cleanup
  }, [searchQuery, debounceSearch])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['stocks', debouncedQuery],
    queryFn: ({ pageParam = 0 }) => fetchStocks(pageParam, debouncedQuery, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined
    },
    initialPageParam: 0,
    staleTime: parseInt(import.meta.env.VITE_QUERY_STALE_TIME) || 2 * 60 * 1000, // 2 minutes stale time for stock data
    refetchInterval: parseInt(import.meta.env.VITE_QUERY_REFETCH_INTERVAL) || 5 * 60 * 1000, // Refetch every 5 minutes for fresh data
  })

  // Flatten all pages into a single array
  const stocks = useMemo(() => {
    return data?.pages.flatMap(page => page.stocks) ?? []
  }, [data])

  const totalCount = stocks?.length ?? 0

  return {
    stocks,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  }
}
