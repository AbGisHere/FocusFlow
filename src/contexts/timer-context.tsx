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
  const [isEnding, setIsEnding] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load timer state from localStorage on mount
  useEffect(() => {
    try {
      const savedTimer = localStorage.getItem('focusflow-timer')
      const savedMinimized = localStorage.getItem('focusflow-timer-minimized')
      
      if (savedTimer) {
        const parsedTimer = JSON.parse(savedTimer)
        // Convert startTime back to Date object if it exists
        if (parsedTimer.startTime) {
          parsedTimer.startTime = new Date(parsedTimer.startTime)
          
          // If timer was running, adjust startTime to account for time elapsed since page refresh
          if (parsedTimer.isRunning) {
            const now = Date.now()
            const savedElapsed = parsedTimer.elapsedTime
            // Calculate new startTime that would give us the correct elapsed time
            parsedTimer.startTime = new Date(now - savedElapsed)
          }
        }
        setTimer(parsedTimer)
      }
      
      if (savedMinimized) {
        setIsMinimized(JSON.parse(savedMinimized))
      }
    } catch (error) {
      console.error('Error loading timer state from localStorage:', error)
    }
  }, [])

  // Save timer state to localStorage whenever it changes (but not when ending)
  useEffect(() => {
    if (isEnding) return // Don't save when ending timer
    
    try {
      localStorage.setItem('focusflow-timer', JSON.stringify(timer))
    } catch (error) {
      console.error('Error saving timer state to localStorage:', error)
    }
  }, [timer, isEnding])

  // Save minimized state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('focusflow-timer-minimized', JSON.stringify(isMinimized))
    } catch (error) {
      console.error('Error saving minimized state to localStorage:', error)
    }
  }, [isMinimized])

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

    // Set ending flag to prevent localStorage saves
    setIsEnding(true)
    
    // Stop the timer first
    setTimer(prev => ({ ...prev, isRunning: false }))

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
        // Clear localStorage immediately
        try {
          localStorage.removeItem('focusflow-timer')
          localStorage.removeItem('focusflow-timer-minimized')
          localStorage.removeItem('focusflow-timer-position')
        } catch (error) {
          console.error('Error clearing timer state from localStorage:', error)
        }
        
        // Reset timer state
        const resetTimer = {
          eventId: null,
          eventTitle: '',
          subjectName: '',
          subjectColor: '',
          isRunning: false,
          elapsedTime: 0,
          startTime: null
        }
        setTimer(resetTimer)
        setIsMinimized(false)
        
        // Redirect to analytics after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard/analytics'
        }, 100)
      }
    } catch (error) {
      console.error("Error saving study session:", error)
      // Reset ending flag on error
      setIsEnding(false)
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
