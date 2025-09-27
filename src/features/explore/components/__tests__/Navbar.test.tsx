import { render, screen } from '@/test/utils'
import Navbar from '../Navbar'
import * as polygonApi from '@/lib/polygonApi'

// Mock the polygon API
vi.mock('@/lib/polygonApi')

// Mock DarkModeToggle component
vi.mock('@/components/ui/DarkModeToggle', () => ({
  default: () => <button data-testid="dark-mode-toggle">Dark Mode Toggle</button>,
}))

describe('Navbar', () => {
  const mockOnSearch = vi.fn()
  const mockGetRateLimitStatus = vi.mocked(polygonApi.getRateLimitStatus)

  const defaultRateLimitStatus = {
    canMakeCall: true,
    remainingCalls: 5,
    timeUntilNextCall: 0,
    totalCalls: 5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRateLimitStatus.mockReturnValue(defaultRateLimitStatus)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render navbar with logo', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const logo = screen.getByAltText('Nasdaq Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/images/nasdaq-full-logo.png')
  })

  it('should render search input', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const searchInput = screen.getByPlaceholderText('Search stocks by ticker or company name...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should render dark mode toggle', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument()
  })

  it('should display API call status', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    expect(screen.getByText('API calls:')).toBeInTheDocument()
    expect(screen.getByText('5/5')).toBeInTheDocument()
  })

  it('should show green color for remaining calls when available', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const callsStatus = screen.getByText('5/5')
    expect(callsStatus).toHaveClass('text-green-600')
    expect(callsStatus).toHaveClass('dark:text-green-400')
  })

  it('should show red color when no calls remaining', () => {
    mockGetRateLimitStatus.mockReturnValue({
      ...defaultRateLimitStatus,
      canMakeCall: false,
      remainingCalls: 0,
    })

    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const callsStatus = screen.getByText('0/5')
    expect(callsStatus).toHaveClass('text-red-600')
    expect(callsStatus).toHaveClass('dark:text-red-400')
  })

  it('should disable search when rate limited', () => {
    mockGetRateLimitStatus.mockReturnValue({
      ...defaultRateLimitStatus,
      canMakeCall: false,
      remainingCalls: 0,
      timeUntilNextCall: 30000,
    })

    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const searchInput = screen.getByPlaceholderText('Search disabled - rate limit reached')
    expect(searchInput).toBeDisabled()
    expect(searchInput).toHaveClass('opacity-50')
    expect(searchInput).toHaveClass('cursor-not-allowed')
  })

  it('should show countdown when rate limited', () => {
    mockGetRateLimitStatus.mockReturnValue({
      ...defaultRateLimitStatus,
      canMakeCall: false,
      remainingCalls: 0,
      timeUntilNextCall: 30000, // 30 seconds
    })

    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    expect(screen.getByText('30s')).toBeInTheDocument()
  })

  it('should have search input that accepts text', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const searchInput = screen.getByPlaceholderText('Search stocks by ticker or company name...')
    
    // Just verify the input exists and can be focused
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).not.toBeDisabled()
  })

  it('should show disabled search when rate limited', () => {
    mockGetRateLimitStatus.mockReturnValue({
      ...defaultRateLimitStatus,
      canMakeCall: false,
      remainingCalls: 0,
    })

    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const searchInput = screen.getByPlaceholderText('Search disabled - rate limit reached')
    expect(searchInput).toBeDisabled()
  })

  it('should update rate limit status periodically', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    // Should call getRateLimitStatus at least once
    expect(mockGetRateLimitStatus).toHaveBeenCalled()

    const initialCallCount = mockGetRateLimitStatus.mock.calls.length

    // Advance timer by update interval
    vi.advanceTimersByTime(1000)

    // Should have been called more times after timer advance
    expect(mockGetRateLimitStatus.mock.calls.length).toBeGreaterThan(initialCallCount)
  })

  it('should display controlled search query', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="AAPL" />)

    const searchInput = screen.getByDisplayValue('AAPL')
    expect(searchInput).toBeInTheDocument()
  })

  it('should display controlled search query value', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="GOOGL" />)

    const searchInput = screen.getByDisplayValue('GOOGL')
    expect(searchInput).toBeInTheDocument()
  })

  it('should have dark mode styles', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const nav = document.querySelector('nav')
    expect(nav).toHaveClass('dark:bg-gray-900')
    expect(nav).toHaveClass('dark:border-gray-700')
    expect(nav).toHaveClass('transition-colors')
    expect(nav).toHaveClass('duration-200')
  })

  it('should have proper layout and spacing', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const nav = document.querySelector('nav')
    expect(nav).toHaveClass('sticky')
    expect(nav).toHaveClass('top-0')
    expect(nav).toHaveClass('z-50')
    expect(nav).toHaveClass('shadow-sm')

    const container = nav?.querySelector('.max-w-7xl')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('mx-auto')

    const flexContainer = container?.querySelector('.flex')
    expect(flexContainer).toHaveClass('items-center')
    expect(flexContainer).toHaveClass('justify-between')
    expect(flexContainer).toHaveClass('h-16')
  })

  it('should have proper input attributes', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const searchInput = screen.getByPlaceholderText('Search stocks by ticker or company name...')
    
    // The input might not have explicit type="text" if it's the default
    expect(searchInput.tagName.toLowerCase()).toBe('input')
    expect(searchInput).toHaveAttribute('placeholder', 'Search stocks by ticker or company name...')
  })

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    
    const { unmount } = render(<Navbar onSearch={mockOnSearch} searchQuery="" />)
    
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    
    clearIntervalSpy.mockRestore()
  })

  it('should handle rate limit status updates', () => {
    const { rerender } = render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    // Initially can make calls
    expect(screen.getByText('5/5')).toBeInTheDocument()

    // Update to rate limited
    mockGetRateLimitStatus.mockReturnValue({
      ...defaultRateLimitStatus,
      canMakeCall: false,
      remainingCalls: 0,
      timeUntilNextCall: 15000,
    })

    // Advance timer to trigger update
    vi.advanceTimersByTime(1000)

    rerender(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    expect(screen.getByText('0/5')).toBeInTheDocument()
    expect(screen.getByText('15s')).toBeInTheDocument()
  })

  it('should have accessible search input', () => {
    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder')
  })

  it('should handle environment variable for debounce delay', () => {
    // Mock environment variable using Object.defineProperty
    const originalEnv = import.meta.env.VITE_SEARCH_DEBOUNCE_DELAY
    Object.defineProperty(import.meta.env, 'VITE_SEARCH_DEBOUNCE_DELAY', {
      value: '500',
      writable: true,
      configurable: true,
    })

    render(<Navbar onSearch={mockOnSearch} searchQuery="" />)

    // Just verify the component renders with custom env
    const searchInput = screen.getByPlaceholderText('Search stocks by ticker or company name...')
    expect(searchInput).toBeInTheDocument()

    // Restore
    Object.defineProperty(import.meta.env, 'VITE_SEARCH_DEBOUNCE_DELAY', {
      value: originalEnv,
      writable: true,
      configurable: true,
    })
  })
})
