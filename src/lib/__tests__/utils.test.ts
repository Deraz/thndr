import { cn } from '../utils'

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes', () => {
      const result = cn('text-red-500', true && 'bg-blue-500', false && 'hidden')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle undefined and null values', () => {
      const result = cn('text-red-500', undefined, null, 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle empty strings', () => {
      const result = cn('text-red-500', '', 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['text-red-500', 'font-bold'], 'bg-blue-500')
      expect(result).toBe('text-red-500 font-bold bg-blue-500')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'font-bold': true,
      })
      expect(result).toBe('text-red-500 font-bold')
    })

    it('should merge conflicting Tailwind classes correctly', () => {
      // This tests the tailwind-merge functionality
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500') // Later class should win
    })

    it('should handle complex class merging', () => {
      const result = cn(
        'px-4 py-2 bg-red-500',
        'px-6', // Should override px-4
        'text-white'
      )
      expect(result).toBe('py-2 bg-red-500 px-6 text-white')
    })

    it('should handle responsive classes', () => {
      const result = cn('text-sm md:text-lg', 'text-base md:text-xl')
      expect(result).toBe('text-base md:text-xl')
    })

    it('should handle hover and focus states', () => {
      const result = cn(
        'hover:bg-red-500 focus:bg-red-500',
        'hover:bg-blue-500' // Should override hover:bg-red-500
      )
      expect(result).toBe('focus:bg-red-500 hover:bg-blue-500')
    })

    it('should handle dark mode classes', () => {
      const result = cn(
        'bg-white dark:bg-gray-900',
        'dark:bg-gray-800' // Should override dark:bg-gray-900
      )
      expect(result).toBe('bg-white dark:bg-gray-800')
    })

    it('should return empty string for no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle nested arrays and objects', () => {
      const result = cn(
        ['text-red-500', { 'font-bold': true, 'italic': false }],
        'bg-blue-500'
      )
      expect(result).toBe('text-red-500 font-bold bg-blue-500')
    })

    it('should handle function calls in conditions', () => {
      const isActive = () => true
      const isDisabled = () => false
      
      const result = cn(
        'base-class',
        isActive() && 'active',
        isDisabled() && 'disabled'
      )
      expect(result).toBe('base-class active')
    })

    it('should handle template literals', () => {
      const variant = 'primary'
      const size = 'lg'
      
      const result = cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`
      )
      expect(result).toBe('btn btn-primary btn-lg')
    })

    it('should handle spacing classes correctly', () => {
      const result = cn('p-4', 'px-6') // px-6 should override px part of p-4
      expect(result).toBe('p-4 px-6') // tailwind-merge may not split p-4 into py-4 px-4
    })

    it('should handle border classes correctly', () => {
      const result = cn('border border-gray-200', 'border-red-500')
      expect(result).toBe('border border-red-500')
    })

    it('should handle complex component class merging', () => {
      const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium'
      const variantClasses = 'bg-primary-600 text-white hover:bg-primary-700'
      const sizeClasses = 'h-10 px-4 py-2'
      const customClasses = 'bg-red-500 px-6' // Should override bg and px
      
      const result = cn(baseClasses, variantClasses, sizeClasses, customClasses)
      expect(result).toBe('inline-flex items-center justify-center rounded-md text-sm font-medium text-white hover:bg-primary-700 h-10 py-2 bg-red-500 px-6')
    })
  })
})
