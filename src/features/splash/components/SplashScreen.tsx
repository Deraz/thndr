import { useDarkMode } from '@/hooks/useDarkMode'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete: () => void
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const { isDark } = useDarkMode()

  useEffect(() => {
    const splashDuration = parseInt(import.meta.env.VITE_SPLASH_DURATION) || 3000 // 3 seconds default
    const fadeOutDuration = parseInt(import.meta.env.VITE_SPLASH_FADE_DURATION) || 500 // 0.5 seconds fade

    // Start fade out animation
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, splashDuration - fadeOutDuration)

    // Complete splash screen
    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, splashDuration)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col items-center justify-center transition-all duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Nasdaq Logo */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="mb-8 animate-pulse">
          <img 
            src={isDark ? "/images/nasdaq-white-logo.png" : "/images/nasdaq-full-logo.png"} 
            alt="Nasdaq Logo" 
            className="w-48 h-auto"
          />
        </div>
        
        {/* Loading animation */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-logo dark:bg-white rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-logo dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-logo dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Built with ❤️ by Yehia Deraz */}
      <div className="pb-12">
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Built with ❤️ by{' '}
          <span className="text-logo font-bold">Yehia Deraz</span>
        </p>
      </div>
    </div>
  )
}

export default SplashScreen
