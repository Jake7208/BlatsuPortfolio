'use client'

import React, { useEffect, useState } from 'react'

export default function Preloader() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    // Disable scroll during preloading
    document.body.style.overflow = 'hidden'

    const startTime = Date.now()

    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(1000 - elapsedTime, 0) // Enforce minimum 1.0s display time

      setTimeout(() => {
        setIsLoaded(true)
        document.body.style.overflow = ''
        // Unmount component from DOM after fade-out transition completes
        setTimeout(() => {
          setShouldRender(false)
        }, 800)
      }, remainingTime)
    }

    // Wait for the window load event to ensure all resources are loaded
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      const fallbackTimer = setTimeout(handleLoad, 2000) // Fallback in case load event is slow
      window.addEventListener('load', handleLoad)
      return () => {
        clearTimeout(fallbackTimer)
        window.removeEventListener('load', handleLoad)
        document.body.style.overflow = ''
      }
    }
  }, [])

  if (!shouldRender) return null

  return (
    <div className={`preloader${isLoaded ? ' is-loaded' : ''}`}>
      <div className="preloader-content">
        <div className="preloader-title">BLATSU</div>
        <div className="preloader-subtitle">LOADING</div>
      </div>
    </div>
  )
}
