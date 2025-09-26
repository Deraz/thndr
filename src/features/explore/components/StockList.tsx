import { useEffect, useCallback } from 'react'
import StockCard from './StockCard'
import { useStocks } from '../hooks/useStocks'
import type { Stock } from '../types'
import StockListSkeleton from './StockListSkeleton'
import ErrorScreen from '@/components/ui/ErrorScreen'
import RateLimitBanner from '@/components/ui/RateLimitBanner'

interface StockListProps {
  searchQuery: string
  onStockClick?: (stock: Stock) => void
}

const StockList = ({ searchQuery, onStockClick }: StockListProps) => {
  const {
    stocks,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useStocks(searchQuery)

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - (parseInt(import.meta.env.VITE_SCROLL_THRESHOLD) || 1000) &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (isLoading) {
    return (
      <StockListSkeleton />
    )
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorScreen
          title="Unable to load stocks"
          message={error instanceof Error ? error.message : 'We encountered an error while fetching stock data. Please check your connection and try again.'}
          onRetry={() => window.location.reload()}
          showRetry={true}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Rate limit info banner */}
      <RateLimitBanner />

      {/* Results header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Stocks'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {totalCount.toLocaleString()} stocks found
        </p>
      </div>

      {/* Stock grid */}
      {stocks.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                onClick={onStockClick}
              />
            ))}
          </div>

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="text-gray-600 dark:text-gray-300">Loading more stocks...</span>
              </div>
            </div>
          )}

          {/* End of results */}
          {!hasNextPage && stocks.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                You've reached the end of the results
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No stocks found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchQuery
              ? `No stocks match "${searchQuery}". Try a different search term.`
              : 'No stocks available at the moment.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default StockList
