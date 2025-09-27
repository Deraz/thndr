import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_POLYGON_API_KEY: 'test-api-key',
    VITE_API_URL: 'https://api.polygon.io',
    VITE_APP_NAME: 'Test App',
    VITE_APP_VERSION: '1.0.0',
    VITE_API_RATE_LIMIT: '5',
    VITE_API_RATE_WINDOW: '60000',
    VITE_API_MAX_RETRIES: '2',
    VITE_API_BASE_DELAY: '15000',
    VITE_API_MAX_DELAY: '60000',
    VITE_API_NETWORK_RETRY_DELAY: '30000',
    VITE_CACHE_DURATION: '1800000',
    VITE_QUERY_STALE_TIME: '120000',
    VITE_QUERY_REFETCH_INTERVAL: '300000',
    VITE_SEARCH_DEBOUNCE_DELAY: '1000',
    VITE_RATE_LIMIT_UPDATE_INTERVAL: '1000',
    VITE_SCROLL_THRESHOLD: '1000',
    VITE_SPLASH_DURATION: '3000',
    VITE_SPLASH_FADE_DURATION: '500',
    VITE_RATE_LIMIT_STORAGE_KEY: 'polygon_api_calls',
    VITE_THEME_STORAGE_KEY: 'theme-preference',
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock fetch
global.fetch = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})
