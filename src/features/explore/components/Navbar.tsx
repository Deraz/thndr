import { useState, useEffect } from 'react'
import SearchInput from '@/components/ui/SearchInput'
import DarkModeToggle from '@/components/ui/DarkModeToggle'
import { getRateLimitStatus } from '@/lib/polygonApi'
import { useDarkMode } from '@/hooks/useDarkMode'

interface NavbarProps {
  onSearch: (query: string) => void
  searchQuery: string
}

const Navbar = ({ onSearch, searchQuery }: NavbarProps) => {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [rateLimitStatus, setRateLimitStatus] = useState(getRateLimitStatus())
  const { isDark, toggleTheme, isLoading } = useDarkMode()
  useEffect(() => {
    const updateInterval = parseInt(import.meta.env.VITE_RATE_LIMIT_UPDATE_INTERVAL) || 1000
    const interval = setInterval(() => {
      setRateLimitStatus(getRateLimitStatus())
    }, updateInterval)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (value: string) => {
    setLocalQuery(value)

    // Only search if we can make API calls
    if (!rateLimitStatus.canMakeCall) {
      return
    }

    // Debounce search to avoid too many calls
    const debounceDelay = parseInt(import.meta.env.VITE_SEARCH_DEBOUNCE_DELAY) || 1000
    const timeoutId = setTimeout(() => {
      onSearch(value)
    }, debounceDelay)

    return () => clearTimeout(timeoutId)
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Nasdaq Logo */}
          <img src={isDark ? "/images/nasdaq-white-logo.png" : "/images/nasdaq-full-logo.png"} alt="Nasdaq Logo" className="w-24" />

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <SearchInput
                placeholder={rateLimitStatus.canMakeCall
                  ? "Search stocks by ticker or company name..."
                  : "Search disabled - rate limit reached"
                }
                value={localQuery}
                onSearch={handleSearch}
                onChange={(e) => setLocalQuery(e.target.value)}
                className={`w-full ${!rateLimitStatus.canMakeCall ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!rateLimitStatus.canMakeCall}
              />
              {!rateLimitStatus.canMakeCall && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-orange-600 font-medium">
                    {Math.round(rateLimitStatus.timeUntilNextCall / 1000)}s
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Dark mode toggle and API status */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">API calls: </span>
              <span className={`font-medium ${rateLimitStatus.remainingCalls > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {rateLimitStatus.remainingCalls}/{rateLimitStatus.totalCalls}
              </span>
            </div>
            <DarkModeToggle isDark={isDark} toggleTheme={toggleTheme} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
