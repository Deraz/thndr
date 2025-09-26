/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string
  readonly VITE_POLYGON_API_KEY: string
  
  // Application Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  
  // Rate Limiting Configuration
  readonly VITE_API_RATE_LIMIT: string
  readonly VITE_API_RATE_WINDOW: string
  readonly VITE_API_MAX_RETRIES: string
  readonly VITE_API_BASE_DELAY: string
  readonly VITE_API_MAX_DELAY: string
  readonly VITE_API_NETWORK_RETRY_DELAY: string
  
  // Caching Configuration
  readonly VITE_CACHE_DURATION: string
  readonly VITE_QUERY_STALE_TIME: string
  readonly VITE_QUERY_REFETCH_INTERVAL: string
  
  // UI Configuration
  readonly VITE_SEARCH_DEBOUNCE_DELAY: string
  readonly VITE_RATE_LIMIT_UPDATE_INTERVAL: string
  readonly VITE_SCROLL_THRESHOLD: string
  
  // Splash Screen Configuration
  readonly VITE_SPLASH_DURATION: string
  readonly VITE_SPLASH_FADE_DURATION: string
  
  // localStorage Configuration
  readonly VITE_RATE_LIMIT_STORAGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
