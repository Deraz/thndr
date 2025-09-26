import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import { getPreviousClose, getRateLimitStatus } from '@/lib/polygonApi'
import type { Stock } from '../types'
import type { PolygonQuoteResponse } from '../types'

interface StockDetailModalProps {
  stock: Stock | null
  isOpen: boolean
  onClose: () => void
}

interface StockPriceData {
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
}

const StockDetailModal = ({ stock, isOpen, onClose }: StockDetailModalProps) => {
  const [priceData, setPriceData] = useState<StockPriceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitStatus, setRateLimitStatus] = useState(getRateLimitStatus())

  const fetchStockData = useCallback(async () => {
    if (!stock) return

    setLoading(true)
    setError(null)

    try {
      const response = await getPreviousClose(stock.ticker) as PolygonQuoteResponse
      
      if (response.results && response.results.length > 0) {
        const data = response.results[0]
        const change = data.c - data.o
        const changePercent = (change / data.o) * 100

        setPriceData({
          price: data.c,
          change,
          changePercent,
          volume: data.v,
          high: data.h,
          low: data.l,
          open: data.o
        })
      } else {
        setError('No price data available for this stock')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data')
    } finally {
      setLoading(false)
    }
  }, [stock])

  useEffect(() => {
    if (isOpen && stock) {
      fetchStockData()
    }
    
    // Update rate limit status
    const interval = setInterval(() => {
      setRateLimitStatus(getRateLimitStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, stock, fetchStockData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatVolume = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  if (!stock) return null

  const isPositive = priceData ? priceData.change >= 0 : false

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${stock.ticker} - ${stock.companyName}`}>
      <div className="space-y-6">
        {/* Rate limit status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">API Calls Remaining:</span>
            <span className={`font-medium ${rateLimitStatus.remainingCalls > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {rateLimitStatus.remainingCalls}/{rateLimitStatus.totalCalls}
            </span>
          </div>
          {rateLimitStatus.timeUntilNextCall > 0 && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Next call in:</span>
              <span className="font-medium text-orange-600">
                {Math.round(rateLimitStatus.timeUntilNextCall / 1000)}s
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Fetching live data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {priceData && (
          <div className="space-y-4">
            {/* Price Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(priceData.price)}
                </div>
                <div className={`text-lg font-medium flex items-center justify-center space-x-2 mt-1 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>
                    {isPositive ? '+' : ''}{formatCurrency(priceData.change)}
                  </span>
                  <span>
                    ({isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%)
                  </span>
                  {isPositive ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* OHLV Data */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Open:</span>
                  <span className="font-medium">{formatCurrency(priceData.open)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">High:</span>
                  <span className="font-medium">{formatCurrency(priceData.high)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Low:</span>
                  <span className="font-medium">{formatCurrency(priceData.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Volume:</span>
                  <span className="font-medium">{formatVolume(priceData.volume)}</span>
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sector:</span>
                  <span className="font-medium">{stock.sector}</span>
                </div>
                {stock.description && (
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <p className="text-gray-700 mt-1">{stock.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {!loading && !priceData && !error && (
            <button
              onClick={fetchStockData}
              disabled={!rateLimitStatus.canMakeCall}
              className={`btn-primary ${!rateLimitStatus.canMakeCall ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {rateLimitStatus.canMakeCall ? 'Fetch Live Data' : 'Rate Limited'}
            </button>
          )}
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default StockDetailModal
