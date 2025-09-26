# 📈 Nasdaq Stock Explorer

A modern, responsive React application for exploring Nasdaq stock market data with real-time pricing information. Built with performance and user experience in mind, featuring intelligent rate limiting, aggressive caching, and seamless infinite scrolling.

## ✨ Features

### 🎯 Core Functionality
- **Splash Screen**: Branded loading experience with Nasdaq logo
- **Dark Mode**: System-aware theme switching with localStorage persistence
- **Live Stock Data**: Real-time stock listings from Polygon.io API
- **Infinite Scrolling**: Seamless browsing through thousands of stocks
- **Smart Search**: Debounced search with backend filtering
- **Stock Details**: Click any stock for live pricing data (OHLCV)
- **Rate Limit Management**: Intelligent API usage with visual feedback

### 🚀 Performance & UX
- **Aggressive Caching**: 30-minute cache for stock listings
- **Persistent Rate Limiting**: Survives page refreshes and browser restarts
- **Optimistic Loading**: Skeleton screens and loading states
- **Error Handling**: Comprehensive error screens with retry functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🔧 Technical Highlights
- **TypeScript**: Full type safety throughout the application
- **React Query**: Advanced data fetching and caching
- **Environment Configuration**: Fully configurable via environment variables
- **Modern React**: Hooks, context, and functional components
- **ESLint**: Code quality and consistency enforcement

## 🏗️ Architecture & Assumptions

### 📊 Data Flow
```
User Interaction → React Query → Stock Service → Polygon.io API
                                      ↓
                              localStorage Cache
                                      ↓
                              Rate Limit Tracking
```

### 🏗️ Feature-Based Architecture
- **Splash Feature**: Self-contained splash screen with timing logic
- **Explore Feature**: Complete stock exploration functionality
- **Dark Mode System**: Smart theme detection and persistence
- **Shared Components**: Reusable UI components across features
- **Clean Imports**: Each feature exports through index.ts

### 🎯 Key Assumptions

#### API Rate Limiting (5 calls/minute)
- **Conservative Approach**: Only essential API calls are made
- **List View**: No individual price fetching (uses cached ticker data)
- **Detail View**: Live data fetched only on user demand
- **Persistent Tracking**: Rate limits tracked in localStorage across sessions

#### Caching Strategy
- **Stock Lists**: Cached for 30 minutes (configurable)
- **Pagination Cursors**: Cached to avoid redundant API calls
- **Query Stale Time**: 2 minutes for React Query
- **Background Refetch**: Every 5 minutes for fresh data

#### User Experience
- **Search Debouncing**: 1-second delay to prevent excessive API calls
- **Infinite Scroll**: Loads more content 1000px before reaching bottom
- **Rate Limit UI**: Real-time feedback with countdown timers
- **Error Recovery**: Automatic retries with exponential backoff
- **Dark Mode Priority**: localStorage → system preference → light default

### 🔄 Caching Techniques

#### 1. **API Response Caching**
```typescript
// 30-minute cache for stock listings
const stockListCache = new Map<string, { 
  data: PolygonTickersResponse; 
  timestamp: number 
}>()
```

#### 2. **Pagination Cursor Caching**
```typescript
// Prevents redundant pagination API calls
const paginationCache = new Map<string, string>()
```

#### 3. **React Query Caching**
```typescript
// Intelligent query caching with background updates
staleTime: 2 * 60 * 1000,        // 2 minutes
refetchInterval: 5 * 60 * 1000,  // 5 minutes
```

#### 4. **Rate Limit Persistence**
```typescript
// Survives page refreshes and browser restarts
localStorage.setItem('polygon_api_calls', JSON.stringify(timestamps))
```

### 🌙 Dark Mode System

The application features an intelligent dark mode system with smart detection:

#### **Priority Order:**
1. **localStorage**: User's previously saved preference
2. **System Preference**: Browser/OS dark mode setting
3. **Default**: Light mode fallback

#### **Features:**
- **Smart Detection**: Automatically detects system preference on first visit
- **Persistent Storage**: Remembers user choice across sessions
- **Live Updates**: Responds to system theme changes when no preference is saved
- **Smooth Transitions**: CSS transitions for seamless theme switching
- **Accessibility**: Proper ARIA labels and keyboard navigation

#### **Usage:**
```typescript
const { isDark, toggleTheme, setTheme } = useDarkMode()

// Toggle between light/dark
toggleTheme()

// Set specific theme
setTheme('dark')
setTheme('light')
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Polygon.io API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thndr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure your API key**
   ```env
   # You can use this key: fQEPVuqDY77cA20ISr1JpVdXk9jGXGPS
   VITE_POLYGON_API_KEY=your_polygon_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## ⚙️ Configuration

### Environment Variables

All configuration is handled through environment variables. Copy `.env.example` to `.env` and customize as needed:

#### 🔑 API Configuration
```env
VITE_POLYGON_API_KEY=your_polygon_api_key_here
VITE_API_URL=https://api.polygon.io
```

#### ⏱️ Rate Limiting
```env
VITE_API_RATE_LIMIT=5                    # Calls per minute
VITE_API_RATE_WINDOW=60000               # Rate window (ms)
VITE_API_MAX_RETRIES=2                   # Max retry attempts
VITE_API_BASE_DELAY=15000                # Base retry delay (ms)
VITE_API_MAX_DELAY=60000                 # Max retry delay (ms)
VITE_API_NETWORK_RETRY_DELAY=30000       # Network error delay (ms)
```

#### 💾 Caching
```env
VITE_CACHE_DURATION=1800000              # 30 minutes (ms)
VITE_QUERY_STALE_TIME=120000             # 2 minutes (ms)
VITE_QUERY_REFETCH_INTERVAL=300000       # 5 minutes (ms)
```

#### 🎨 UI Behavior
```env
VITE_SEARCH_DEBOUNCE_DELAY=1000          # Search delay (ms)
VITE_RATE_LIMIT_UPDATE_INTERVAL=1000     # UI update interval (ms)
VITE_SCROLL_THRESHOLD=1000               # Infinite scroll trigger (px)

# Splash Screen
VITE_SPLASH_DURATION=3000                # Splash screen duration (ms)
VITE_SPLASH_FADE_DURATION=500            # Fade out duration (ms)

# Dark Mode
VITE_THEME_STORAGE_KEY="theme-preference" # localStorage key for theme
```

#### 📱 Application
```env
VITE_APP_NAME="Nasdaq Stock Explorer"
VITE_APP_VERSION="1.0.0"
VITE_RATE_LIMIT_STORAGE_KEY="polygon_api_calls"
```

### Development vs Production

The application automatically adapts to different environments:

- **Development**: Enhanced logging, detailed error messages
- **Production**: Optimized builds, error boundaries, performance monitoring

## 🏛️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Base UI components (Modal, SearchInput, DarkModeToggle, etc.)
├── hooks/              # Custom React hooks
│   └── useDarkMode.ts  # Dark mode management hook
├── features/           # Feature-based organization
│   ├── explore/        # Stock exploration feature
│   │   ├── components/ # Feature-specific components
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript definitions
│   └── splash/         # Splash screen feature
│       ├── components/ # SplashScreen component
│       └── index.ts    # Feature exports
├── lib/                # Utility libraries
│   ├── polygonApi.ts   # Polygon.io API client
│   └── utils.ts        # Helper functions
└── types/              # Global type definitions
```

## 🔧 API Integration

### Polygon.io Endpoints Used

1. **List Tickers** (`/v3/reference/tickers`)
   - Fetches stock listings with pagination
   - Supports search filtering
   - Used for: Main stock list, search results

2. **Previous Close** (`/v2/aggs/ticker/{ticker}/prev`)
   - Gets previous day's OHLCV data
   - Used for: Stock detail modal pricing

### Rate Limiting Strategy

```typescript
// Client-side rate limiting (5 calls/minute)
const canMakeApiCall = (): boolean => {
  const timestamps = getApiCallTimestamps()
  return timestamps.length < RATE_LIMIT
}

// Exponential backoff for server errors
const calculateDelay = (attempt: number): number => {
  const delay = BASE_DELAY * Math.pow(2, attempt)
  return Math.min(delay + Math.random() * 1000, MAX_DELAY)
}
```

## 🧪 Testing & Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Development Tools

- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type checking and IntelliSense
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (via ESLint integration)

### Debugging Rate Limits

```javascript
// Check current rate limit status
console.log(getRateLimitStatus())

// View raw localStorage data
console.log(JSON.parse(localStorage.getItem('polygon_api_calls')))

// Clear rate limit data (development only)
localStorage.removeItem('polygon_api_calls')
```

## 🚀 Performance Optimizations

### 1. **Lazy Loading**
- Components loaded on demand
- Images with loading states
- Infinite scroll implementation

### 2. **Memoization**
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers

### 3. **Bundle Optimization**
- Tree shaking for unused code
- Code splitting by routes
- Optimized asset loading

### 4. **Caching Layers**
- Browser cache for static assets
- React Query for API responses
- localStorage for user preferences

## 🔒 Security Considerations

- **API Key Protection**: Environment variables only
- **Rate Limiting**: Prevents API abuse
- **Input Sanitization**: XSS prevention
- **Error Boundaries**: Graceful error handling

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the environment configuration

---

**Built with ❤️ by Yehia Deraz.**
