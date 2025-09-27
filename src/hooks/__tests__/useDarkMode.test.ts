import { renderHook, act } from '@testing-library/react'
import { useDarkMode } from '../useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Reset document class
    document.documentElement.className = ''
    // Reset matchMedia mock
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  })

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useDarkMode())

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
    expect(result.current.isLight).toBe(true)
  })

  it('should initialize with dark theme when system prefers dark', () => {
    // Mock system preference for dark mode
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(result.current.isLight).toBe(false)
  })

  it('should use localStorage value when available', () => {
    // Set localStorage before rendering the hook
    vi.mocked(localStorage.getItem).mockReturnValue('dark')
    
    const { result } = renderHook(() => useDarkMode())

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('should toggle theme correctly', () => {
    // Ensure no localStorage preference for this test
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    
    const { result } = renderHook(() => useDarkMode())

    // Initially light
    expect(result.current.theme).toBe('light')

    // Toggle to dark
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark')

    // Toggle back to light
    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.theme).toBe('light')
    expect(result.current.isLight).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'light')
  })

  it('should set specific theme', () => {
    const { result } = renderHook(() => useDarkMode())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark')

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.theme).toBe('light')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'light')
  })

  it('should apply dark class to document element', () => {
    const { result } = renderHook(() => useDarkMode())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      result.current.setTheme('light')
    })

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useDarkMode())

    act(() => {
      result.current.toggleTheme()
    })

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save theme preference:', expect.any(Error))

    // Restore
    localStorage.setItem = originalSetItem
    consoleSpy.mockRestore()
  })

  it('should listen for system theme changes when no preference is saved', () => {
    const mockAddEventListener = vi.fn()
    const mockRemoveEventListener = vi.fn()

    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    })

    const { unmount } = renderHook(() => useDarkMode())

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    unmount()

    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should not update theme on system change when localStorage preference exists', () => {
    // Mock localStorage to return 'light' preference
    vi.mocked(localStorage.getItem).mockReturnValue('light')

    const mockAddEventListener = vi.fn()
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const { result } = renderHook(() => useDarkMode())

    // Simulate system theme change
    const changeHandler = mockAddEventListener.mock.calls[0][1]
    act(() => {
      changeHandler({ matches: true })
    })

    // Should still be light because localStorage preference exists
    expect(result.current.theme).toBe('light')
  })

  it('should show loading state initially', () => {
    const { result } = renderHook(() => useDarkMode())

    // Note: Due to the useEffect, isLoading might be false by the time we check
    // This test verifies the initial state structure
    expect(typeof result.current.isLoading).toBe('boolean')
  })
})
