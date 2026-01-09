"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Pause, Square, ArrowLeft } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { AuthenticatedBackgroundMusic } from "@/components/authenticated-background-music"

export default function StudySessionPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    // Check authentication first
    const checkAuth = async () => {
      try {
        const sessionData = await authClient.getSession()
        if (!sessionData?.data?.user) {
          router.push('/')
          return
        }
        setAuthLoading(false)
        fetchEvent()
      } catch (error) {
        console.error("Error checking authentication:", error)
        router.push('/')
      }
    }
    
    checkAuth()
  }, [eventId, router])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        if (startTime) {
          const now = new Date()
          const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
          setSeconds(diff)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    setIsRunning(true)
    setStartTime(new Date())
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setStartTime(null)
    // TODO: Save study session data
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Study Session Not Found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Calendar</span>
          </button>
          <h1 className="text-xl font-semibold text-foreground">Study Session</h1>
          <div className="flex items-center space-x-2">
            <AuthenticatedBackgroundMusic />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Event Info */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">{event.title}</h2>
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}
            {event.subject && (
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: event.subject.color }}
                ></div>
                <span className="text-muted-foreground">{event.subject.name}</span>
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="bg-card rounded-2xl p-12 shadow-lg border border-border">
            <div className="text-7xl font-mono font-bold text-foreground tabular-nums">
              {formatTime(seconds)}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium"
              >
                <Play className="h-6 w-6" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 px-8 py-4 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors text-lg font-medium"
              >
                <Pause className="h-6 w-6" />
                <span>Pause</span>
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="flex items-center space-x-2 px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-lg font-medium"
            >
              <Square className="h-6 w-6" />
              <span>Stop</span>
            </button>
          </div>

          {/* Session Info */}
          <div className="text-sm text-muted-foreground">
            {isRunning ? (
              <p>Session in progress... Keep focused!</p>
            ) : seconds > 0 ? (
              <p>Session paused. Click Start to resume or Stop to end.</p>
            ) : (
              <p>Ready to start your study session. Click Start when you're ready.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
