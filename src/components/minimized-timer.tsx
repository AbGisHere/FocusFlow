"use client"

import { useTimer } from '@/contexts/timer-context'
import { useSettings } from '@/contexts/settings-context'
import { Play, Pause, Square, X, Maximize2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
}

export function MinimizedTimer() {
  const { timer, pauseTimer, resumeTimer, endTimer, restoreTimer, isMinimized } = useTimer()
  const { settings } = useSettings()
  const pathname = usePathname()
  const router = useRouter()
  
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const timerRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  // Track screen size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      
      // Reposition timer to stay within bounds on resize
      setPosition(prev => {
        const timerWidth = 280
        const timerHeight = 120
        const margin = 20
        
        // Ensure timer stays within new screen bounds
        const newX = Math.max(margin, Math.min(prev.x, screenWidth - timerWidth - margin))
        const newY = Math.max(margin, Math.min(prev.y, screenHeight - timerHeight - margin))
        
        return { x: newX, y: newY }
      })
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedPosition = localStorage.getItem('focusflow-timer-position')
        if (savedPosition) {
          const parsed = JSON.parse(savedPosition)
          setPosition(parsed)
        } else {
          // Default position (bottom-right)
          setPosition({ x: window.innerWidth - 320, y: window.innerHeight - 150 })
        }
      } catch (error) {
        console.error('Error loading timer position:', error)
        setPosition({ x: window.innerWidth - 320, y: window.innerHeight - 150 })
      }
      isInitialized.current = true
    }
  }, [])

  // Save position to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized.current) {
      try {
        localStorage.setItem('focusflow-timer-position', JSON.stringify(position))
      } catch (error) {
        console.error('Error saving timer position:', error)
      }
    }
  }, [position])

  // Auto-align to corners only when dragged near corners
  const snapToCorner = (x: number, y: number): Position => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const timerWidth = 280 // min-w-[280px] + padding
    const timerHeight = 120 // approximate height
    const margin = 20 // distance from edges
    const snapThreshold = 50 // Distance from corner to trigger snap
    
    // Determine if timer is near any corner
    const nearLeftCorner = x < snapThreshold
    const nearRightCorner = x > screenWidth - timerWidth - snapThreshold
    const nearTopCorner = y < snapThreshold
    const nearBottomCorner = y > screenHeight - timerHeight - snapThreshold
    
    let snappedX = x
    let snappedY = y
    
    // Only snap if dragged near a corner
    if (nearLeftCorner || nearRightCorner || nearTopCorner || nearBottomCorner) {
      // Snap horizontally
      if (nearLeftCorner) {
        snappedX = margin // Left side with margin
      } else if (nearRightCorner) {
        snappedX = screenWidth - timerWidth - margin // Right side with margin
      }
      
      // Snap vertically
      if (nearTopCorner) {
        snappedY = margin // Top with margin
      } else if (nearBottomCorner) {
        snappedY = screenHeight - timerHeight - margin // Bottom with margin
      }
    }
    
    return { x: snappedX, y: snappedY }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return // Ignore button clicks
    
    // Check if movable timer is enabled in settings
    if (!settings.movableMinimizedTimer) return
    
    e.preventDefault() // Prevent default text selection behavior
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    
    // Change cursor for the whole document
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none' // For Safari
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Keep timer within viewport bounds with proper margins
      const maxX = window.innerWidth - 280 // timer width
      const maxY = window.innerHeight - 120 // timer height
      const margin = 20 // Distance from edges
      const constrainedX = Math.max(margin, Math.min(newX, maxX - margin))
      const constrainedY = Math.max(margin, Math.min(newY, maxY - margin))
      
      setPosition({ x: constrainedX, y: constrainedY })
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        // Restore document styles
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
        
        // Snap to corner
        const snappedPosition = snapToCorner(position.x, position.y)
        setPosition(snappedPosition)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Restore document styles in case of cleanup
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
    }
  }, [isDragging, dragStart, position])

  // Don't show minimized timer if:
  // 1. No timer is running
  // 2. Timer is not minimized
  // 3. We're on the full timer page for this event
  if (!timer.eventId || !isMinimized || pathname?.startsWith(`/timer/${timer.eventId}`)) {
    return null
  }

  const handleRestore = () => {
    restoreTimer()
    router.push(`/timer/${timer.eventId}`)
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={timerRef}
      className={`fixed bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 z-50 min-w-[280px] transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-2xl scale-105' : 
        settings.movableMinimizedTimer ? 'cursor-grab hover:shadow-xl' : 'cursor-default hover:shadow-xl'
      } select-none`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: timer.subjectColor }}
          ></div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{timer.eventTitle}</p>
            <p className="text-xs text-muted-foreground">{timer.subjectName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRestore()
            }}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Restore Timer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              endTimer()
            }}
            className="p-1 text-red-500 hover:text-red-600 transition-colors"
            title="End Session"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-lg font-mono font-bold text-foreground tabular-nums">
          {formatTime(timer.elapsedTime)}
        </div>
        
        <div className="flex items-center space-x-1">
          {timer.isRunning ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                pauseTimer()
              }}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              title="Pause"
            >
              <Pause className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                resumeTimer()
              }}
              className="p-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              title="Resume"
            >
              <Play className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
