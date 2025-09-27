import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import DarkModeToggle from '../DarkModeToggle'

describe('DarkModeToggle', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render moon icon in light mode', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    expect(button).toHaveAttribute('title', 'Switch to dark mode')
    
    // Check for moon icon (path element should be present)
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render sun icon in dark mode', () => {
    render(<DarkModeToggle isDark={true} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    expect(button).toHaveAttribute('title', 'Switch to light mode')
    
    // Check for sun icon
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should call toggleTheme when clicked', async () => {
    const user = userEvent.setup()
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('should show loading placeholder when loading', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={true} />)
    
    // Should render a loading div instead of button
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    
    const loadingDiv = document.querySelector('.animate-pulse')
    expect(loadingDiv).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} className="custom-class" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should have proper hover and focus styles', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-gray-200')
    expect(button).toHaveClass('focus:outline-none')
    expect(button).toHaveClass('focus:ring-2')
    expect(button).toHaveClass('focus:ring-primary-500')
  })

  it('should have dark mode styles', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('dark:bg-gray-800')
    expect(button).toHaveClass('dark:hover:bg-gray-700')
    expect(button).toHaveClass('dark:focus:ring-offset-gray-900')
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    
    // Focus with tab
    await user.tab()
    expect(button).toHaveFocus()
    
    // Activate with Enter
    await user.keyboard('{Enter}')
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    
    // Activate with Space
    await user.keyboard(' ')
    expect(mockToggleTheme).toHaveBeenCalledTimes(2)
  })

  it('should have correct icon colors', () => {
    // Light mode - moon icon should be gray
    const { rerender } = render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    let svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toHaveClass('text-gray-700')
    
    // Dark mode - sun icon should be yellow
    rerender(<DarkModeToggle isDark={true} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    svg = screen.getByRole('button').querySelector('svg')
    expect(svg).toHaveClass('text-yellow-500')
  })

  it('should have transition animations', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('transition-all')
    expect(button).toHaveClass('duration-200')
    
    const svg = button.querySelector('svg')
    expect(svg).toHaveClass('transition-transform')
    expect(svg).toHaveClass('duration-200')
    expect(svg).toHaveClass('hover:scale-110')
  })

  it('should be accessible with screen readers', () => {
    render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    const button = screen.getByRole('button')
    
    // Should have proper ARIA attributes
    expect(button).toHaveAttribute('aria-label')
    expect(button).toHaveAttribute('title')
    
    // Buttons are focusable by default, no need for explicit tabindex
    expect(button.tagName).toBe('BUTTON')
  })

  it('should update when theme changes', async () => {
    const { rerender } = render(<DarkModeToggle isDark={false} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    // Initially light mode
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode')
    
    // Change to dark mode
    rerender(<DarkModeToggle isDark={true} toggleTheme={mockToggleTheme} isLoading={false} />)
    
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode')
  })
})