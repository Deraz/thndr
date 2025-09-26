import { useState } from 'react'
import { ExploreScreen } from '@/features/explore'
import { SplashScreen } from '@/features/splash'
import { useDarkMode } from './hooks/useDarkMode'

function App() {
  useDarkMode()
  const [showSplash, setShowSplash] = useState(true)
  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return <ExploreScreen />
}

export default App
