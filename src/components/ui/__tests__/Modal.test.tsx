import { render, screen, fireEvent } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

describe('Modal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('should render close button when title is provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const closeButton = screen.getByRole('button')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    // Click on backdrop (the fixed overlay)
    const backdrop = document.querySelector('.fixed.inset-0.bg-black')
    expect(backdrop).toBeInTheDocument()
    
    if (backdrop) {
      await user.click(backdrop)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    }
  })

  it('should call onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when other keys are pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should set body overflow to hidden when open', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should restore body overflow when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('unset')
  })

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(document.body.style.overflow).toBe('unset')

    removeEventListenerSpy.mockRestore()
  })

  it('should have proper modal structure', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Check for modal container
    const modalContainer = document.querySelector('.fixed.inset-0.z-50')
    expect(modalContainer).toBeInTheDocument()

    // Check for backdrop
    const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    expect(backdrop).toBeInTheDocument()

    // Check for modal content
    const modalContent = document.querySelector('.relative.bg-white.rounded-xl')
    expect(modalContent).toBeInTheDocument()
  })

  it('should have dark mode styles', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    const modalContent = document.querySelector('.relative.bg-white')
    expect(modalContent).toHaveClass('dark:bg-gray-900')

    const header = document.querySelector('.border-b')
    expect(header).toHaveClass('dark:border-gray-700')

    const title = screen.getByText('Test Modal')
    expect(title).toHaveClass('dark:text-gray-100')

    const closeButton = screen.getByRole('button')
    expect(closeButton).toHaveClass('dark:text-gray-500')
    expect(closeButton).toHaveClass('dark:hover:text-gray-300')
  })

  it('should be scrollable when content is long', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div style={{ height: '2000px' }}>Very long content</div>
      </Modal>
    )

    const modalContent = document.querySelector('.max-h-\\[90vh\\].overflow-y-auto')
    expect(modalContent).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )

    // Modal should be in a high z-index layer
    const modalContainer = document.querySelector('.z-50')
    expect(modalContainer).toBeInTheDocument()

    // Close button should be accessible
    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
  })

  it('should handle rapid open/close cycles', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    // Rapidly toggle
    rerender(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    rerender(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </Modal>
    )

    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should not close when clicking inside modal content', async () => {
    const user = userEvent.setup()
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div data-testid="modal-content">Modal content</div>
      </Modal>
    )

    const modalContent = screen.getByTestId('modal-content')
    await user.click(modalContent)

    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
