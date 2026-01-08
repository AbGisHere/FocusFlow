"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Pause, Square, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  isRecurring?: boolean
  recurringDays?: string
  recurringEndDate?: string
  createdAt: string
  updatedAt: string
  userId: string
  subject?: {
    id: string
    name: string
    color: string
  }
}

export default function TimerPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime())
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, startTime])

  useEffect(() => {
    // Auto-start timer when page loads
    setStartTime(new Date())
    setIsRunning(true)
  }, [])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      } else {
        console.error("Failed to fetch event:", response.status)
        router.push('/dashboard/calendar')
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
      router.push('/dashboard/calendar')
    } finally {
      setLoading(false)
    }
  }

  const handlePause = () => {
    if (isRunning) {
      setIsRunning(false)
    }
  }

  const handleEnd = async () => {
    setIsRunning(false)
    
    try {
      // Save the actual study session
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId,
          durationMs: elapsedTime
        })
      })
      
      if (response.ok) {
        alert(`Study session completed! Total time: ${formatTime(elapsedTime)}`)
        // Redirect to analytics tab
        router.push('/dashboard/analytics')
      } else {
        console.error("Failed to save study session")
        alert("Failed to save study session. Please try again.")
      }
    } catch (error) {
      console.error("Error saving study session:", error)
      alert("Error saving study session. Please try again.")
    }
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event not found</h1>
          <Link 
            href="/dashboard/calendar" 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard/calendar" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calendar
            </Link>
            <div className="flex items-center space-x-2">
              {event.subject && (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: event.subject.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{event.subject.name}</span>
                </div>
              )}
              {event.isRecurring && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Timer Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          {/* Event Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-muted-foreground mb-8">{event.description}</p>
          )}

          {/* Timer Display */}
          <div className="mb-12">
            <div className="inline-block bg-card/90 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-8">
              <div className="text-6xl font-mono font-bold text-foreground tabular-nums">
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
              >
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </button>
            ) : (
              <button
                onClick={() => {
                  setStartTime(new Date(Date.now() - elapsedTime))
                  setIsRunning(true)
                }}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Resume
              </button>
            )}
            
            <button
              onClick={handleEnd}
              className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            >
              <Square className="mr-2 h-5 w-5" />
              End
            </button>
          </div>

          {/* Event Details */}
          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6 text-left max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-4">Study Session Details</h2>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-24">Scheduled:</span>
                <span className="text-foreground">
                  {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-24">Duration:</span>
                <span className="text-foreground">
                  {new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground w-24">Location:</span>
                  <span className="text-foreground">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
