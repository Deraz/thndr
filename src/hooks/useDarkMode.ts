import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = import.meta.env.VITE_THEME_STORAGE_KEY || 'theme-preference'

/**
 * Custom hook for managing dark mode with priority:
 * 1. localStorage value
 * 2. Browser/system preference
 * 3. Default to light mode
 */
export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>('light')
  const [isLoading, setIsLoading] = useState(true)

  // Get initial theme based on priority
  const getInitialTheme = (): Theme => {
    try {
      // Priority 1: Check localStorage
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme
      }

      // Priority 2: Check browser/system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    } catch (error) {
      console.warn('Failed to get theme preference:', error)
    }

    // Priority 3: Default to light mode
    return 'light'
  }

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Set specific theme
  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    setTheme(initialTheme)
    applyTheme(initialTheme)
    setIsLoading(false)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no localStorage preference exists
      const savedTheme = localStorage.getItem(STORAGE_KEY)
      if (!savedTheme) {
        const systemTheme: Theme = e.matches ? 'dark' : 'light'
        setTheme(systemTheme)
        applyTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme: setThemeMode,
    isLoading
  }
}
