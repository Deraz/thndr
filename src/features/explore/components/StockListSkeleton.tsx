const StockListSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              {/* Company info section */}
              <div className="flex items-center space-x-4">
                {/* Logo placeholder */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
                
                {/* Company details */}
                <div className="flex-1 min-w-0">
                  {/* Ticker */}
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                  {/* Company name */}
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                  {/* Sector badge */}
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
                
                {/* Chevron placeholder */}
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Description section */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
              </div>

              {/* Click hint section */}
              <div className="mt-4 text-center">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
}

export default StockListSkeleton