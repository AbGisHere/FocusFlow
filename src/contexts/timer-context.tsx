"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

interface TimerState {
  eventId: string | null
  eventTitle: string
  subjectName: string
  subjectColor: string
  isRunning: boolean
  elapsedTime: number
  startTime: Date | null
}

interface TimerContextType {
  timer: TimerState
  startTimer: (eventId: string, eventTitle: string, subjectName: string, subjectColor: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  endTimer: () => Promise<void>
  minimizeTimer: () => void
  isMinimized: boolean
  restoreTimer: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timer, setTimer] = useState<TimerState>({
    eventId: null,
    eventTitle: '',
    subjectName: '',
    subjectColor: '',
    isRunning: false,
    elapsedTime: 0,
    startTime: null
  })
  const [isMinimized, setIsMinimized] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timer.isRunning && timer.startTime) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedTime: Date.now() - timer.startTime!.getTime()
        }))
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
  }, [timer.isRunning, timer.startTime])

  const startTimer = (eventId: string, eventTitle: string, subjectName: string, subjectColor: string) => {
    // Only reset if this is a different event or no timer is running
    if (timer.eventId !== eventId) {
      setTimer({
        eventId,
        eventTitle,
        subjectName,
        subjectColor,
        isRunning: true,
        elapsedTime: 0,
        startTime: new Date()
      })
      setIsMinimized(false)
    } else {
      // Same event, just ensure it's running and not minimized
      setTimer(prev => ({ ...prev, isRunning: true }))
      setIsMinimized(false)
    }
  }

  const pauseTimer = () => {
    setTimer(prev => ({ ...prev, isRunning: false }))
  }

  const resumeTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date(Date.now() - prev.elapsedTime)
    }))
  }

  const endTimer = async () => {
    if (!timer.eventId) return

    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId: timer.eventId,
          durationMs: timer.elapsedTime
        })
      })
      
      if (response.ok) {
        // Reset timer state
        setTimer({
          eventId: null,
          eventTitle: '',
          subjectName: '',
          subjectColor: '',
          isRunning: false,
          elapsedTime: 0,
          startTime: null
        })
        setIsMinimized(false)
        
        // Redirect to analytics
        window.location.href = '/dashboard/analytics'
      }
    } catch (error) {
      console.error("Error saving study session:", error)
    }
  }

  const minimizeTimer = () => {
    setIsMinimized(true)
  }

  const restoreTimer = () => {
    setIsMinimized(false)
  }

  return (
    <TimerContext.Provider value={{
      timer,
      startTimer,
      pauseTimer,
      resumeTimer,
      endTimer,
      minimizeTimer,
      isMinimized,
      restoreTimer
    }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
