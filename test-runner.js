#!/usr/bin/env node

// Simple test runner to verify our test setup
console.log('🧪 Testing Setup Verification')
console.log('============================')

// Check if all test files exist
const fs = require('fs')
const path = require('path')

const testFiles = [
  'src/hooks/__tests__/useDarkMode.test.ts',
  'src/features/explore/hooks/__tests__/useStocks.test.ts',
  'src/components/ui/__tests__/SearchInput.test.tsx',
  'src/components/ui/__tests__/DarkModeToggle.test.tsx',
  'src/components/ui/__tests__/Modal.test.tsx',
  'src/features/explore/components/__tests__/StockCard.test.tsx',
  'src/features/explore/components/__tests__/Navbar.test.tsx',
  'src/lib/__tests__/utils.test.ts',
  'src/lib/__tests__/polygonApi.test.ts',
  'src/features/explore/services/__tests__/stockService.test.ts',
  'src/test/__tests__/integration.test.tsx',
]

let allFilesExist = true

testFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - NOT FOUND`)
    allFilesExist = false
  }
})

console.log('\n📊 Test Coverage Summary')
console.log('========================')
console.log(`📁 Total test files: ${testFiles.length}`)
console.log(`✅ Files created: ${testFiles.filter(f => fs.existsSync(path.join(__dirname, f))).length}`)

if (allFilesExist) {
  console.log('\n🎉 All test files created successfully!')
  console.log('\n📋 Test Categories:')
  console.log('• Custom Hooks: useDarkMode, useStocks')
  console.log('• UI Components: SearchInput, DarkModeToggle, Modal')
  console.log('• Feature Components: StockCard, Navbar')
  console.log('• Services & Utilities: polygonApi, stockService, utils')
  console.log('• Integration Tests: Full app workflow')
  
  console.log('\n🚀 To run tests:')
  console.log('npm run test        # Run in watch mode')
  console.log('npm run test:run    # Run once')
  console.log('npm run test:ui     # Run with UI')
} else {
  console.log('\n❌ Some test files are missing')
}

console.log('\n📝 Test Setup Features:')
console.log('• Vitest + React Testing Library')
console.log('• jsdom environment for DOM testing')
console.log('• Mock localStorage, fetch, matchMedia')
console.log('• Custom render with QueryClient provider')
console.log('• Comprehensive mocking setup')
console.log('• Dark mode testing utilities')
console.log('• API mocking and error simulation')
