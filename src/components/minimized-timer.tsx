"use client"

import { useTimer } from '@/contexts/timer-context'
import { Play, Pause, Square, X, Maximize2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export function MinimizedTimer() {
  const { timer, pauseTimer, resumeTimer, endTimer, restoreTimer, isMinimized } = useTimer()
  const pathname = usePathname()
  const router = useRouter()

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
    <div className="fixed bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 z-50 min-w-[280px]">
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
            onClick={handleRestore}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Restore Timer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={endTimer}
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
              onClick={pauseTimer}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              title="Pause"
            >
              <Pause className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={resumeTimer}
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
