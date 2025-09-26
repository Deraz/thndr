// Environment configuration with fallbacks
const API_KEY = import.meta.env.VITE_POLYGON_API_KEY
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.polygon.io'

// Rate limiting and retry configuration from environment
const MAX_RETRIES = parseInt(import.meta.env.VITE_API_MAX_RETRIES) || 2
const BASE_DELAY = parseInt(import.meta.env.VITE_API_BASE_DELAY) || 15000 // 15 seconds
const MAX_DELAY = parseInt(import.meta.env.VITE_API_MAX_DELAY) || 60000 // 1 minute max delay
const NETWORK_RETRY_DELAY = parseInt(import.meta.env.VITE_API_NETWORK_RETRY_DELAY) || 30000 // 30 seconds

// API call tracking for rate limiting with localStorage persistence
const RATE_LIMIT = parseInt(import.meta.env.VITE_API_RATE_LIMIT) || 5
const RATE_WINDOW = parseInt(import.meta.env.VITE_API_RATE_WINDOW) || 60000 // 1 minute
const STORAGE_KEY = import.meta.env.VITE_RATE_LIMIT_STORAGE_KEY || 'polygon_api_calls'

// Get API call timestamps from localStorage
const getApiCallTimestamps = (): number[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const timestamps = JSON.parse(stored) as number[]
      // Clean up old timestamps
      const now = Date.now()
      const validTimestamps = timestamps.filter(timestamp => now - timestamp <= RATE_WINDOW)
      
      // Update localStorage with cleaned timestamps
      if (validTimestamps.length !== timestamps.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validTimestamps))
      }
      
      return validTimestamps
    }
  } catch (error) {
    console.warn('Failed to read API call timestamps from localStorage:', error)
  }
  return []
}

// Save API call timestamps to localStorage
const saveApiCallTimestamps = (timestamps: number[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps))
  } catch (error) {
    console.warn('Failed to save API call timestamps to localStorage:', error)
  }
}

// Check if we can make an API call without exceeding rate limit
const canMakeApiCall = (): boolean => {
  const timestamps = getApiCallTimestamps()
  return timestamps.length < RATE_LIMIT
}

// Record an API call
const recordApiCall = (): void => {
  const timestamps = getApiCallTimestamps()
  timestamps.push(Date.now())
  saveApiCallTimestamps(timestamps)
}

// Calculate time until next API call is allowed
const timeUntilNextCall = (): number => {
  const timestamps = getApiCallTimestamps()
  if (timestamps.length < RATE_LIMIT) return 0
  const oldestCall = timestamps[0]
  return RATE_WINDOW - (Date.now() - oldestCall)
}

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Calculate exponential backoff delay
const calculateDelay = (attempt: number): number => {
  const delay = BASE_DELAY * Math.pow(2, attempt)
  return Math.min(delay + Math.random() * 1000, MAX_DELAY) // Add jitter
}

// Generic API call function with strict rate limiting
async function polygonApiCall<T>(endpoint: string, params: Record<string, string | number | boolean> = {}, retryCount = 0): Promise<T> {
  // Check rate limit before making call
  if (!canMakeApiCall()) {
    const waitTime = timeUntilNextCall()
    console.warn(`Rate limit reached. Waiting ${Math.round(waitTime / 1000)}s before next call`)
    await sleep(waitTime + 1000) // Add 1 second buffer
  }

  const url = new URL(`${BASE_URL}${endpoint}`)
  
  // Add API key to all requests
  url.searchParams.append('apikey', API_KEY)
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString())
    }
  })

  try {
    // Record the API call before making it
    recordApiCall()
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      // Handle rate limiting (status 429) with longer delays
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const delay = Math.max(60000, calculateDelay(retryCount)) // At least 1 minute
        console.warn(`Rate limited by server. Waiting ${Math.round(delay / 1000)}s (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        await sleep(delay)
        return polygonApiCall<T>(endpoint, params, retryCount + 1)
      }
      
      // Handle other 5xx errors with retry
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        const delay = calculateDelay(retryCount)
        console.warn(`Server error ${response.status}. Retrying in ${Math.round(delay / 1000)}s (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        await sleep(delay)
        return polygonApiCall<T>(endpoint, params, retryCount + 1)
      }
      
      throw new Error(`Polygon API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // Very conservative retry on network errors
    if (retryCount < 1 && error instanceof Error && 
        (error.message.includes('fetch') || error.message.includes('network'))) {
      const delay = NETWORK_RETRY_DELAY
      console.warn(`Network error. Retrying in ${Math.round(delay / 1000)}s (attempt ${retryCount + 1}/1)`)
      await sleep(delay)
      return polygonApiCall<T>(endpoint, params, retryCount + 1)
    }
    
    throw error
  }
}

export async function listTickers(params: {
  market?: string
  active?: boolean
  order?: 'asc' | 'desc'
  limit?: number
  sort?: string
  search?: string
  cursor?: string
}) {
  const apiParams: Record<string, string | number | boolean> = {
    market: params.market || 'stocks',
    active: params.active !== false ? 'true' : 'false',
    order: params.order || 'asc',
    limit: params.limit || 20,
    sort: params.sort || 'ticker'
  }

  // Add search parameter if provided
  if (params.search) {
    apiParams.search = params.search
  }

  // Add cursor parameter for pagination if provided
  if (params.cursor) {
    apiParams.cursor = params.cursor
  }

  return polygonApiCall('/v3/reference/tickers', apiParams)
}

// Get previous close
export async function getPreviousClose(ticker: string, adjusted: boolean = true) {
  return polygonApiCall(`/v2/aggs/ticker/${ticker}/prev`, {
    adjusted: adjusted ? 'true' : 'false'
  })
}

// Export rate limit checking functions for UI components
export const getRateLimitStatus = () => {
  const timestamps = getApiCallTimestamps()
  return {
    canMakeCall: canMakeApiCall(),
    remainingCalls: Math.max(0, RATE_LIMIT - timestamps.length),
    timeUntilNextCall: timeUntilNextCall(),
    totalCalls: RATE_LIMIT
  }
}