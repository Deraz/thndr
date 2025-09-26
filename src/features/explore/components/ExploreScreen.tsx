import { useState } from 'react'
import Navbar from './Navbar'
import StockList from './StockList'
import StockDetailModal from './StockDetailModal'
import type { Stock } from '../types'

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStock(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      <main>
        <StockList
          searchQuery={searchQuery}
          onStockClick={handleStockClick}
        />
      </main>
      
      <StockDetailModal
        stock={selectedStock}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default ExploreScreen
