import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement, ReactNode } from 'react'

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

const AllTheProviders = ({ 
  children, 
  queryClient = createTestQueryClient() 
}: { 
  children: ReactNode
  queryClient?: QueryClient 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  { queryClient, ...options }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
    ),
    ...options,
  })
}

// Mock stock data for tests
export const mockStock = {
  id: 'AAPL',
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  price: 150.25,
  change: 2.5,
  changePercent: 1.69,
  volume: 1000000,
  marketCap: 2500000000,
  sector: 'Technology',
  description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
}

export const mockStocks = [
  mockStock,
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
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
  },
  {
    id: 'TSLA',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    price: 800.50,
    change: 25.75,
    changePercent: 3.33,
    volume: 1200000,
    marketCap: 800000000,
    sector: 'Automotive',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
  },
]

// Mock API responses
export const mockPolygonResponse = {
  results: [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      type: 'CS',
      primary_exchange: 'NASDAQ',
    },
  ],
  count: 1,
  next_url: null,
}

export const mockPriceResponse = {
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

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }
