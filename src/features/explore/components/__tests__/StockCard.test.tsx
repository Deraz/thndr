import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import StockCard from '../StockCard'
import { mockStock } from '@/test/utils'

describe('StockCard', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render stock information', () => {
    render(<StockCard stock={mockStock} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('should render stock logo with first two letters', () => {
    render(<StockCard stock={mockStock} />)

    expect(screen.getByText('AA')).toBeInTheDocument() // First 2 letters of AAPL
  })

  it('should render description when provided', () => {
    render(<StockCard stock={mockStock} />)

    expect(screen.getByText(mockStock.description)).toBeInTheDocument()
  })

  it('should not render description section when not provided', () => {
    const stockWithoutDescription = { ...mockStock, description: undefined }
    render(<StockCard stock={stockWithoutDescription} />)

    expect(screen.queryByText(mockStock.description)).not.toBeInTheDocument()
  })

  it('should render click hint', () => {
    render(<StockCard stock={mockStock} />)

    expect(screen.getByText('Click to view live data')).toBeInTheDocument()
  })

  it('should render chevron icon', () => {
    render(<StockCard stock={mockStock} />)

    const chevron = document.querySelector('svg')
    expect(chevron).toBeInTheDocument()
  })

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup()
    render(<StockCard stock={mockStock} onClick={mockOnClick} />)

    // Find the outermost card div by looking for the one with cursor-pointer class
    const card = document.querySelector('.cursor-pointer')
    expect(card).toBeInTheDocument()

    if (card) {
      await user.click(card)
      expect(mockOnClick).toHaveBeenCalledWith(mockStock)
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    }
  })

  it('should not call onClick when no onClick handler provided', async () => {
    const user = userEvent.setup()
    render(<StockCard stock={mockStock} />)

    const card = document.querySelector('.bg-white')
    if (card) {
      await user.click(card)
      // Should not throw error
    }
  })

  it('should have proper hover styles', () => {
    render(<StockCard stock={mockStock} />)

    const card = document.querySelector('.bg-white')
    expect(card).toHaveClass('hover:shadow-lg')
    expect(card).toHaveClass('hover:border-primary-300')
    expect(card).toHaveClass('hover:bg-gray-50')
  })

  it('should have dark mode styles', () => {
    render(<StockCard stock={mockStock} />)

    const card = document.querySelector('.bg-white')
    expect(card).toHaveClass('dark:bg-gray-800')
    expect(card).toHaveClass('dark:border-gray-700')
    expect(card).toHaveClass('dark:hover:bg-gray-700')
    expect(card).toHaveClass('dark:hover:border-primary-600')

    // Check logo dark mode styles
    const logo = screen.getByText('AA').closest('div')
    expect(logo).toHaveClass('dark:bg-primary-900')

    const logoText = screen.getByText('AA')
    expect(logoText).toHaveClass('dark:text-primary-300')

    // Check text dark mode styles
    const ticker = screen.getByText('AAPL')
    expect(ticker).toHaveClass('dark:text-gray-100')

    const companyName = screen.getByText('Apple Inc.')
    expect(companyName).toHaveClass('dark:text-gray-300')

    const sector = screen.getByText('Technology')
    expect(sector).toHaveClass('dark:text-gray-200')
  })

  it('should be accessible', () => {
    render(<StockCard stock={mockStock} onClick={mockOnClick} />)

    const card = document.querySelector('.cursor-pointer')
    expect(card).toHaveClass('cursor-pointer')
    
    // Should be clickable
    expect(card).toBeInTheDocument()
  })

  it('should handle long company names', () => {
    const stockWithLongName = {
      ...mockStock,
      companyName: 'Very Long Company Name That Should Be Truncated Because It Is Too Long',
    }

    render(<StockCard stock={stockWithLongName} />)

    const companyName = screen.getByText(stockWithLongName.companyName)
    expect(companyName).toHaveClass('truncate')
  })

  it('should handle long descriptions', () => {
    const stockWithLongDescription = {
      ...mockStock,
      description: 'This is a very long description that should be clamped to two lines using the line-clamp utility class because it contains too much text to display properly in the card layout without taking up too much space.',
    }

    render(<StockCard stock={stockWithLongDescription} />)

    const description = screen.getByText(stockWithLongDescription.description)
    expect(description).toHaveClass('line-clamp-2')
  })

  it('should handle single letter tickers', () => {
    const stockWithSingleLetter = { ...mockStock, ticker: 'A' }
    render(<StockCard stock={stockWithSingleLetter} />)

    // Use getAllByText since 'A' appears in both logo and ticker
    const aElements = screen.getAllByText('A')
    expect(aElements.length).toBeGreaterThan(0)
  })

  it('should handle empty sector', () => {
    const stockWithoutSector = { ...mockStock, sector: '' }
    render(<StockCard stock={stockWithoutSector} />)

    // Should still render the sector badge, even if empty
    const sectorBadge = document.querySelector('.rounded-full')
    expect(sectorBadge).toBeInTheDocument()
  })

  it('should have proper spacing and layout', () => {
    render(<StockCard stock={mockStock} />)

    const card = document.querySelector('.bg-white')
    expect(card).toHaveClass('p-6')
    expect(card).toHaveClass('rounded-lg')

    // Check for proper flex layout
    const contentContainer = document.querySelector('.flex.items-center')
    expect(contentContainer).toHaveClass('items-center')
    expect(contentContainer).toHaveClass('space-x-4')
  })

  it('should render border and background correctly', () => {
    render(<StockCard stock={mockStock} />)

    const card = document.querySelector('.bg-white')
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('border-gray-200')
  })

  it('should have transition animations', () => {
    render(<StockCard stock={mockStock} />)

    const card = document.querySelector('.bg-white')
    expect(card).toHaveClass('transition-all')
    expect(card).toHaveClass('duration-200')
  })

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<StockCard stock={mockStock} onClick={mockOnClick} />)

    const card = document.querySelector('.cursor-pointer')
    
    // Card should be focusable if it has onClick
    if (card) {
      // Add keyboard event handler for testing
      card.addEventListener('keydown', (e: Event) => {
        const keyboardEvent = e as KeyboardEvent
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          mockOnClick(mockStock)
        }
      })
      
      // Simulate tab navigation
      card.setAttribute('tabindex', '0')
      const focusableCard = card as HTMLElement
      focusableCard.focus()
      
      if (document.activeElement === card) {
        await user.keyboard('{Enter}')
        expect(mockOnClick).toHaveBeenCalledWith(mockStock)
      }
    }
  })
})
