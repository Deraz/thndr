import { render, screen, fireEvent } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import SearchInput from '../SearchInput'

describe('SearchInput', () => {
  it('should render with placeholder text', () => {
    render(<SearchInput placeholder="Search stocks..." />)
    
    expect(screen.getByPlaceholderText('Search stocks...')).toBeInTheDocument()
  })

  it('should render search icon', () => {
    render(<SearchInput />)
    
    const searchIcon = screen.getByRole('textbox').previousElementSibling
    expect(searchIcon).toBeInTheDocument()
    expect(searchIcon?.querySelector('svg')).toBeInTheDocument()
  })

  it('should call onSearch when typing', async () => {
    const user = userEvent.setup()
    const mockOnSearch = vi.fn()
    
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'AAPL')
    
    expect(mockOnSearch).toHaveBeenCalledWith('A')
    expect(mockOnSearch).toHaveBeenCalledWith('AA')
    expect(mockOnSearch).toHaveBeenCalledWith('AAP')
    expect(mockOnSearch).toHaveBeenCalledWith('AAPL')
  })

  it('should call onChange when typing', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    
    render(<SearchInput onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'AAPL')
    
    expect(mockOnChange).toHaveBeenCalledTimes(4)
  })

  it('should display controlled value', () => {
    render(<SearchInput value="AAPL" onChange={() => {}} />)
    
    expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<SearchInput disabled />)
    
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<SearchInput className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<SearchInput ref={ref} />)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('should handle empty search', async () => {
    const user = userEvent.setup()
    const mockOnSearch = vi.fn()
    
    render(<SearchInput onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'AAPL')
    await user.clear(input)
    
    expect(mockOnSearch).toHaveBeenLastCalledWith('')
  })

  it('should have proper accessibility attributes', () => {
    render(<SearchInput aria-label="Search for stocks" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Search for stocks')
  })

  it('should handle keyboard events', () => {
    const mockOnKeyDown = vi.fn()
    render(<SearchInput onKeyDown={mockOnKeyDown} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(mockOnKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'Enter',
        code: 'Enter',
      })
    )
  })

  it('should apply dark mode styles', () => {
    render(<SearchInput />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('dark:bg-gray-800')
    expect(input).toHaveClass('dark:text-gray-100')
    expect(input).toHaveClass('dark:border-gray-600')
  })

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup()
    const mockOnFocus = vi.fn()
    const mockOnBlur = vi.fn()
    
    render(<SearchInput onFocus={mockOnFocus} onBlur={mockOnBlur} />)
    
    const input = screen.getByRole('textbox')
    
    await user.click(input)
    expect(mockOnFocus).toHaveBeenCalled()
    
    await user.tab()
    expect(mockOnBlur).toHaveBeenCalled()
  })
})
