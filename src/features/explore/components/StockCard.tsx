import type { Stock } from '../types'
import { cn } from '@/lib/utils'

interface StockCardProps {
  stock: Stock
  onClick?: (stock: Stock) => void
}

const StockCard = ({ stock, onClick }: StockCardProps) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200',
        'cursor-pointer hover:border-primary-300 hover:bg-gray-50'
      )}
      onClick={() => onClick?.(stock)}
    >
      {/* Company info */}
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 self-start">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
            <span className="text-primary-700 font-bold text-lg">
              {stock.ticker.substring(0, 2)}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 truncate">
            {stock.ticker}
          </h3>
          <p className="text-gray-600 truncate mt-1">
            {stock.companyName}
          </p>
          <div className="flex items-center mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {stock.sector}
            </span>
          </div>
        </div>
        
        {/* Chevron right */}
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Description */}
      {stock.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {stock.description}
          </p>
        </div>
      )}

      {/* Click to view details hint */}
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-500">Click to view live data</span>
      </div>
    </div>
  )
}

export default StockCard
