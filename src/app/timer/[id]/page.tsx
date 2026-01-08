"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Pause, Square, CheckCircle, Circle, Clock, AlertTriangle, Minimize2 } from "lucide-react"
import Link from "next/link"
import { useTimer } from "@/contexts/timer-context"

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

interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
  createdAt: string
  updatedAt: string
  userId: string
  subjectId?: string
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
  
  const { timer, startTimer, pauseTimer, resumeTimer, endTimer, minimizeTimer } = useTimer()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  useEffect(() => {
    if (event?.subject?.id) {
      fetchTasks(event.subject.id)
    }
  }, [event])

  useEffect(() => {
    // Only start timer if we have event data and no timer is running
    if (event && !timer.eventId) {
      startTimer(
        eventId,
        event.title,
        event.subject?.name || '',
        event.subject?.color || '#000'
      )
    } else if (event && timer.eventId === eventId) {
      // Timer is already running for this event, just ensure it's not minimized
      // and sync the event details in case they changed
      if (timer.eventTitle !== event.title || 
          timer.subjectName !== event.subject?.name || 
          timer.subjectColor !== event.subject?.color) {
        // Update event details but preserve timer state
        startTimer(
          eventId,
          event.title,
          event.subject?.name || '',
          event.subject?.color || '#000'
        )
      }
    }
  }, [event, eventId, timer.eventId])

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
        router.push('/dashboard/analytics')
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
      router.push('/dashboard/analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/tasks?subjectId=${subjectId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else {
        console.error("Failed to fetch tasks:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const handlePause = () => {
    pauseTimer()
  }

  const handleResume = () => {
    resumeTimer()
  }

  const handleMinimize = () => {
    minimizeTimer()
    // Navigate to dashboard after minimizing
    router.push('/dashboard')
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-500'
      case 'MEDIUM': return 'text-yellow-500'
      case 'LOW': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-500" />
      case 'TODO': return <Circle className="h-4 w-4 text-gray-400" />
      default: return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-end">
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section - 2 columns */}
          <div className="lg:col-span-2 text-center">
          {/* Event Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
          {event.description && (
            <p className="text-muted-foreground mb-8">{event.description}</p>
          )}

          {/* Timer Display */}
          <div className="mb-12">
            <div className="inline-block bg-card/90 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-8">
              <div className="text-6xl font-mono font-bold text-foreground tabular-nums">
                {formatTime(timer.elapsedTime)}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {timer.isRunning ? (
              <button
                onClick={handlePause}
                className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-lg"
              >
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Resume
              </button>
            )}
            
            <button
              onClick={handleMinimize}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Minimize2 className="mr-2 h-5 w-5" />
              Minimize
            </button>
            
            <button
              onClick={endTimer}
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

          {/* Tasks Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Related Tasks</h2>
              
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tasks found for this subject.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-background/50 rounded-lg p-3 border border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
                        </div>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 ${
                            isOverdue(task.dueDate) && task.status !== 'DONE' ? 'text-red-500' : 'text-muted-foreground'
                          }`}>
                            <AlertTriangle className="h-3 w-3" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <span className="text-muted-foreground">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {event?.subject && (
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      minimizeTimer()
                      router.push(`/dashboard/tasks?subject=${event.subject!.id}`)
                    }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View all {event.subject.name} tasks →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
