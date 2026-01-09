"use client"

import { useEffect, useState } from "react"
import { BackgroundMusicPlayer } from "./background-music-player"
import { authClient } from "@/lib/auth-client"

export function AuthenticatedBackgroundMusic() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const sessionData = await authClient.getSession()
      setIsAuthenticated(!!sessionData?.data?.user)
    } catch (error) {
      console.error("Error checking authentication:", error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    // Re-check authentication when window gains focus (user returns to tab)
    const handleFocus = () => {
      checkAuth()
    }

    window.addEventListener('focus', handleFocus)
    
    // Also check periodically every 30 seconds as a fallback
    const interval = setInterval(checkAuth, 30000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  // Don't render anything while loading or if not authenticated
  if (loading || !isAuthenticated) {
    return null
  }

  return <BackgroundMusicPlayer />
}
