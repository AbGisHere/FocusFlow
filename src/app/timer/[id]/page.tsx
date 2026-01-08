"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Pause, Square, CheckCircle, Circle, Clock, AlertTriangle, Minimize2, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import Link from "next/link"
import { useTimer } from "@/contexts/timer-context"
import { useSettings } from "@/contexts/settings-context"

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
  const { settings } = useSettings()
  
  const { timer, startTimer, pauseTimer, resumeTimer, endTimer, minimizeTimer } = useTimer()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  useEffect(() => {
    if (event?.subject?.id) {
      fetchTasks(event.subject.id)
      fetchCalendarEvents(event.subject.id)
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
      // and syncs event details in case they changed
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

  const fetchCalendarEvents = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/calendar?subjectId=${subjectId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const events = await response.json()
        setCalendarEvents(Array.isArray(events) ? events : [])
      } else {
        console.error("Failed to fetch calendar events:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error)
    }
  }

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
        // Filter to show only TODO (pending) and IN_PROGRESS (ongoing) tasks
        const activeTasks = Array.isArray(data) ? data.filter((task: Task) => 
          task.status === 'TODO' || task.status === 'IN_PROGRESS'
        ) : []
        setTasks(activeTasks)
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

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        // Update the task locally in the UI immediately
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
          
          // If task is marked as DONE, remove it from the list
          // Otherwise, keep it (for TODO <-> IN_PROGRESS changes)
          if (newStatus === 'DONE') {
            return updatedTasks.filter(task => task.id !== taskId)
          }
          return updatedTasks
        })

        // Also update calendar tasks if needed
        if (selectedDate && event?.subject?.id) {
          getAllTasksForDay(selectedDate).then(tasks => {
            setCalendarTasks(tasks || [])
          })
        }
      } else {
        console.error("Failed to update task status:", response.status)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
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

  // Calendar helper functions
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startTime)
      return isSameDay(day, eventDate)
    })
  }

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      // Include tasks without due dates in today's view
      if (!task.dueDate) {
        return isSameDay(day, new Date())
      }
      const taskDate = new Date(task.dueDate)
      return isSameDay(day, taskDate)
    })
  }

  const getAllTasksForDay = async (day: Date) => {
    // For calendar view, fetch ALL tasks (including DONE) for the day
    try {
      const response = await fetch(`/api/tasks?subjectId=${event?.subject?.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const allTasks = await response.json()
        return Array.isArray(allTasks) ? allTasks.filter((task: Task) => {
          if (!task.dueDate) {
            return isSameDay(day, new Date())
          }
          const taskDate = new Date(task.dueDate)
          return isSameDay(day, taskDate)
        }) : []
      }
    } catch (error) {
      console.error("Failed to fetch all tasks for calendar:", error)
      return []
    }
  }

  const [calendarTasks, setCalendarTasks] = useState<Task[]>([])

  useEffect(() => {
    if (selectedDate && event?.subject?.id) {
      getAllTasksForDay(selectedDate).then(tasks => {
        setCalendarTasks(tasks || [])
      })
    }
  }, [selectedDate, event?.subject?.id])

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
  }

  const getSelectedDateEvents = () => {
    if (!selectedDate) return []
    return getEventsForDay(selectedDate)
  }

  const getSelectedDateTasks = () => {
    if (!selectedDate) return []
    return calendarTasks
  }

  const getSelectedDateAllItems = () => {
    if (!selectedDate) return { events: [], tasks: [] }
    return {
      events: getEventsForDay(selectedDate),
      tasks: getTasksForDay(selectedDate)
    }
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
        <div className={`grid gap-8 ${
          settings.showCalendar && settings.showTasks 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : settings.showCalendar || settings.showTasks
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          {/* Timer Section - always visible */}
          <div className={`${
            settings.showCalendar && settings.showTasks 
              ? 'lg:col-span-1' 
              : settings.showCalendar || settings.showTasks 
                ? 'lg:col-span-1' 
                : ''
          } flex flex-col justify-center items-center`}>
            {/* Event Title */}
            <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
            {event.description && (
              <p className="text-muted-foreground mb-8">{event.description}</p>
            )}

            {/* Timer Display */}
            <div className="mb-12">
              <div className="inline-block bg-card/90 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-12">
                <div className="text-7xl lg:text-8xl xl:text-9xl font-mono font-bold text-foreground tabular-nums">
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
          </div>

          {/* Right Column - Tasks and Calendar stacked */}
          {(settings.showTasks || settings.showCalendar) && (
            <div className={`${
              settings.showCalendar && settings.showTasks 
                ? 'lg:col-span-1' 
                : 'lg:col-span-1'
            } space-y-8`}>
              {/* Tasks Section - conditional */}
              {settings.showTasks && (
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
                            <div className="relative">
                              <select
                                value={task.status}
                                onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task["status"])}
                                className={`appearance-none cursor-pointer text-xs font-medium rounded-lg border px-3 py-1.5 pr-8 transition-all duration-200 ${
                                  task.status === 'TODO' 
                                    ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
                                    : task.status === 'IN_PROGRESS'
                                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                }`}
                              >
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="DONE">DONE</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-3 h-3 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
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
              )}

              {/* Calendar Section - conditional, placed below tasks */}
              {settings.showCalendar && (
                <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-4">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Calendar</h2>
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={previousMonth}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-primary/20 rounded transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h3 className="text-sm font-medium text-foreground">
                      {format(currentMonth, "MMM yyyy")}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-primary/20 rounded transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                      <div key={index} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5">
                    {monthDays.map((day: Date, index: number) => {
                      const dayEvents = getEventsForDay(day)
                      const dayTasks = getTasksForDay(day)
                      const isCurrentMonth = isSameMonth(day, currentMonth)
                      const isToday = isSameDay(day, new Date())
                      const isSelected = selectedDate && isSameDay(day, selectedDate)

                      return (
                        <div
                          key={index}
                          onClick={() => handleDayClick(day)}
                          className={`min-h-[28px] p-1 border border-border rounded cursor-pointer flex flex-col items-center justify-center ${
                            isCurrentMonth ? "bg-card" : "bg-muted/30"
                          } ${
                            isSelected 
                              ? "ring-2 ring-primary bg-primary/10" 
                              : isToday 
                                ? "ring-1 ring-primary" 
                                : ""
                          } hover:bg-primary/5 transition-colors`}
                        >
                          <div className="text-xs text-muted-foreground leading-none">
                            {format(day, "d")}
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {/* Show colored dots for tasks */}
                            {dayTasks.slice(0, 2).map((task) => (
                              <div
                                key={task.id}
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  task.status === 'IN_PROGRESS' 
                                    ? 'bg-blue-500' 
                                    : 'bg-orange-500'
                                }`}
                                title={`${task.status === 'IN_PROGRESS' ? 'Ongoing' : 'Pending'}: ${task.title}`}
                              />
                            ))}
                            {/* Show small indicator for events */}
                            {dayEvents.length > 0 && (
                              <div
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  dayEvents.some(e => e.isRecurring) 
                                    ? 'bg-green-500' 
                                    : 'bg-primary'
                                }`}
                                title={`${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Events Summary */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-foreground">
                        {selectedDate 
                          ? format(selectedDate, "MMM d")
                          : "Today"
                        }
                      </h4>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {(selectedDate ? getSelectedDateEvents() : getEventsForDay(new Date())).length + 
                         (selectedDate ? getSelectedDateTasks() : getTasksForDay(new Date())).length} items
                      </span>
                    </div>
                    
                    {/* Events Section */}
                    {(selectedDate ? getSelectedDateEvents() : getEventsForDay(new Date())).length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Events</h5>
                        </div>
                        <div className="space-y-1">
                          {(selectedDate ? getSelectedDateEvents() : getEventsForDay(new Date())).map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-border/50">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: event.subject?.color || '#000' }}
                                ></div>
                                <span className="text-xs font-medium truncate">{event.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(event.startTime), "HH:mm")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks Section */}
                    {(selectedDate ? getSelectedDateTasks() : calendarTasks).length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasks</h5>
                        </div>
                        <div className="space-y-1">
                          {(selectedDate ? getSelectedDateTasks() : calendarTasks).map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg border border-border/50">
                              <div className="flex items-center space-x-2">
                                {task.status === 'IN_PROGRESS' ? (
                                  <Clock className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Circle className="h-3 w-3 text-orange-500" />
                                )}
                                <span className="text-xs font-medium truncate">{task.title}</span>
                              </div>
                              <div className="relative">
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task["status"])}
                                  className={`appearance-none cursor-pointer text-xs font-medium rounded-lg border px-3 py-1.5 pr-8 transition-all duration-200 ${
                                    task.status === 'TODO' 
                                      ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
                                      : task.status === 'IN_PROGRESS'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                  }`}
                                >
                                  <option value="TODO">TODO</option>
                                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                                  <option value="DONE">DONE</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <svg className="w-3 h-3 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No items message */}
                    {(selectedDate ? getSelectedDateEvents() : getEventsForDay(new Date())).length === 0 && 
                     (selectedDate ? getSelectedDateTasks() : calendarTasks).length === 0 && (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {selectedDate ? 'No events or tasks on this date' : 'No events or tasks today'}
                        </p>
                      </div>
                    )}

                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="mt-3 w-full text-xs text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 py-2 rounded-lg"
                      >
                        Back to Today
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
