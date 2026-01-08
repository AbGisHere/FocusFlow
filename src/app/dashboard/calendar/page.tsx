"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Trash2, ChevronDown, AlertCircle, CheckSquare, Pencil, Play } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate?: string
  createdAt: string
  updatedAt: string
  userId: string
}

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

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showStudyHoursForm, setShowStudyHoursForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingStudyHours, setEditingStudyHours] = useState<Event | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    subjectId: "",
  })

  const [studyHours, setStudyHours] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    subjectId: "",
    isRecurring: false,
    recurringDays: [] as string[],
    recurringEndDate: "",
  })

  // Initialize with today's date for one-time sessions
  useEffect(() => {
    const now = new Date()
    const localDate = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0')
    
    // Calculate closest 15-minute interval
    const minutes = now.getMinutes()
    const roundedMinutes = Math.ceil(minutes / 15) * 15
    const startTime = new Date(now)
    startTime.setMinutes(roundedMinutes, 0, 0)
    
    // End time is 60 minutes after start time
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + 60)
    
    const startTimeStr = String(startTime.getHours()).padStart(2, '0') + ':' + String(startTime.getMinutes()).padStart(2, '0')
    const endTimeStr = String(endTime.getHours()).padStart(2, '0') + ':' + String(endTime.getMinutes()).padStart(2, '0')
    
    setStudyHours(prev => ({
      ...prev,
      startTime: prev.startTime || `${localDate}T${startTimeStr}`,
      endTime: prev.endTime || `${localDate}T${endTimeStr}`
    }))
  }, [])

  const [subjects, setSubjects] = useState<Array<{id: string, name: string, color: string}>>([])

  useEffect(() => {
    fetchData()
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects", {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    }
  }

  const fetchData = async () => {
    try {
      const [eventsResponse, tasksResponse] = await Promise.all([
        fetch("/api/events", {
          credentials: 'include'
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
          return res.json()
        }).catch(() => []),
        fetch("/api/tasks", {
          credentials: 'include'
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`)
          return res.json()
        }).catch(() => []),
      ])

      setEvents(Array.isArray(eventsResponse) ? eventsResponse : [])
      setTasks(Array.isArray(tasksResponse) ? tasksResponse : [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newEvent),
      })
      if (response.ok) {
        setNewEvent({ title: "", description: "", startTime: "", endTime: "", location: "", subjectId: "" })
        setShowAddForm(false)
        fetchData()
      } else {
        console.error("Failed to add event:", response.status)
      }
    } catch (error) {
      console.error("Failed to add event:", error)
    }
  }

  const handleAddStudyHours = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/study-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(studyHours),
      })
      if (response.ok) {
        const now = new Date()
        const localDate = now.getFullYear() + '-' + 
          String(now.getMonth() + 1).padStart(2, '0') + '-' + 
          String(now.getDate()).padStart(2, '0')
        
        // Calculate closest 15-minute interval
        const minutes = now.getMinutes()
        const roundedMinutes = Math.ceil(minutes / 15) * 15
        const startTime = new Date(now)
        startTime.setMinutes(roundedMinutes, 0, 0)
        
        // End time is 60 minutes after start time
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + 60)
        
        const startTimeStr = String(startTime.getHours()).padStart(2, '0') + ':' + String(startTime.getMinutes()).padStart(2, '0')
        const endTimeStr = String(endTime.getHours()).padStart(2, '0') + ':' + String(endTime.getMinutes()).padStart(2, '0')
        
        setStudyHours({ 
          title: "", 
          description: "", 
          startTime: `${localDate}T${startTimeStr}`, 
          endTime: `${localDate}T${endTimeStr}`, 
          subjectId: "", 
          isRecurring: false, 
          recurringDays: [], 
          recurringEndDate: "" 
        })
        setShowStudyHoursForm(false)
        fetchData()
      } else {
        console.error("Failed to add study hours:", response.status)
      }
    } catch (error) {
      console.error("Failed to add study hours:", error)
    }
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return
    
    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          title: editingEvent.title,
          description: editingEvent.description,
          startTime: editingEvent.startTime,
          endTime: editingEvent.endTime,
          location: editingEvent.location,
        }),
      })
      if (response.ok) {
        setEditingEvent(null)
        setShowAddForm(false)
        fetchData()
      } else {
        console.error("Failed to update event:", response.status)
      }
    } catch (error) {
      console.error("Failed to update event:", error)
    }
  }

  const handleEditStudyHours = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudyHours) return
    
    try {
      const response = await fetch(`/api/events/${editingStudyHours.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          title: studyHours.title,
          description: studyHours.description,
          startTime: studyHours.startTime,
          endTime: studyHours.endTime,
          subjectId: studyHours.subjectId,
        }),
      })
      if (response.ok) {
        setEditingStudyHours(null)
        setShowStudyHoursForm(false)
        fetchData()
      } else {
        console.error("Failed to update study hours:", response.status)
      }
    } catch (error) {
      console.error("Failed to update study hours:", error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        credentials: 'include',
      })
      if (response.ok) {
        fetchData()
        setOpenDropdown(null)
      } else {
        console.error("Failed to delete event:", response.status)
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        fetchData()
        setOpenDropdown(null)
      } else {
        console.error("Failed to update task status:", response.status)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: 'include',
      })
      if (response.ok) {
        fetchData()
        setOpenDropdown(null)
      } else {
        console.error("Failed to delete task:", response.status)
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const openEditTask = (task: Task) => {
    // For now, route editing to the Tasks tab (keeps UX consistent and avoids duplicate forms).
    window.location.href = "/dashboard/tasks"
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return isSameDay(day, eventDate)
    })
  }

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return isSameDay(day, taskDate)
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStudyHoursForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Study Hours</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Add New Event</h2>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location
              </label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Subject
              </label>
              <select
                value={newEvent.subjectId}
                onChange={(e) => setNewEvent({ ...newEvent, subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              >
                <option value="">No Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Event
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-input text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showStudyHoursForm && (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">{editingStudyHours ? "Edit Study Hours" : "Add Study Hours"}</h2>
          <form onSubmit={editingStudyHours ? handleEditStudyHours : handleAddStudyHours} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                value={studyHours.title}
                onChange={(e) => setStudyHours({ ...studyHours, title: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="e.g., Study Mathematics"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={studyHours.description}
                onChange={(e) => setStudyHours({ ...studyHours, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                rows={3}
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Subject
              </label>
              <select
                value={studyHours.subjectId}
                onChange={(e) => setStudyHours({ ...studyHours, subjectId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {!studyHours.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={studyHours.startTime ? new Date(studyHours.startTime).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value
                    const existingStartTime = studyHours.startTime ? new Date(studyHours.startTime).toTimeString().split(' ')[0].substring(0, 5) : '00:00'
                    const existingEndTime = studyHours.endTime ? new Date(studyHours.endTime).toTimeString().split(' ')[0].substring(0, 5) : '01:00'
                    
                    setStudyHours({ 
                      ...studyHours, 
                      startTime: date ? `${date}T${existingStartTime}` : '',
                      endTime: date ? `${date}T${existingEndTime}` : ''
                    })
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Time
                </label>
                <input
                  type={studyHours.isRecurring ? "time" : "time"}
                  value={studyHours.isRecurring ? studyHours.startTime : (studyHours.startTime ? new Date(studyHours.startTime).toTimeString().split(' ')[0].substring(0, 5) : '')}
                  onChange={(e) => {
                    if (studyHours.isRecurring) {
                      setStudyHours({ ...studyHours, startTime: e.target.value })
                    } else {
                      const dateObj = studyHours.startTime ? new Date(studyHours.startTime) : new Date()
                      const localDate = dateObj.getFullYear() + '-' + 
                        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(dateObj.getDate()).padStart(2, '0')
                      setStudyHours({ ...studyHours, startTime: `${localDate}T${e.target.value}` })
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Time
                </label>
                <input
                  type={studyHours.isRecurring ? "time" : "time"}
                  value={studyHours.isRecurring ? studyHours.endTime : (studyHours.endTime ? new Date(studyHours.endTime).toTimeString().split(' ')[0].substring(0, 5) : '')}
                  onChange={(e) => {
                    if (studyHours.isRecurring) {
                      setStudyHours({ ...studyHours, endTime: e.target.value })
                    } else {
                      const dateObj = studyHours.endTime ? new Date(studyHours.endTime) : new Date()
                      const localDate = dateObj.getFullYear() + '-' + 
                        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(dateObj.getDate()).padStart(2, '0')
                      setStudyHours({ ...studyHours, endTime: `${localDate}T${e.target.value}` })
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={studyHours.isRecurring}
                  onChange={(e) => setStudyHours({ ...studyHours, isRecurring: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">Recurring Study Hours</span>
              </label>
            </div>

            {studyHours.isRecurring && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Recurring Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                      <label key={day} className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={studyHours.recurringDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStudyHours({ 
                                ...studyHours, 
                                recurringDays: [...studyHours.recurringDays, day] 
                              })
                            } else {
                              setStudyHours({ 
                                ...studyHours, 
                                recurringDays: studyHours.recurringDays.filter(d => d !== day) 
                              })
                            }
                          }}
                          className="mr-1"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Recurring End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={studyHours.recurringEndDate}
                    onChange={(e) => setStudyHours({ ...studyHours, recurringEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                    placeholder="Leave empty for no end date"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {editingStudyHours ? "Update Study Hours" : "Add Study Hours"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowStudyHoursForm(false)
                  setEditingStudyHours(null)
                }}
                className="px-4 py-2 border border-input text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={previousMonth}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-primary/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-primary/20 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-colors">
            <CalendarIcon className="h-4 w-4" />
            <span>Today</span>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day: Date, index: number) => {
            const dayEvents = getEventsForDay(day)
            const dayTasks = getTasksForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border border-border rounded-lg ${
                  isCurrentMonth ? "bg-card" : "bg-muted/50"
                } ${isToday ? "ring-2 ring-primary" : ""}`}
              >
                <div className="text-sm text-muted-foreground mb-1">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.length === 0 && dayTasks.length === 0 ? (
                    <div className="text-center text-muted-foreground text-xs">
                      {isToday ? "Today" : ""}
                    </div>
                  ) : (
                    <>
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border mb-1 relative cursor-pointer ${
                            event.isRecurring 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                          onClick={() => setOpenDropdown(openDropdown === event.id ? null : event.id)}
                        >
                          {event.isRecurring && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full m-0.5"></div>
                          )}
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {format(new Date(event.startTime), "HH:mm")}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs truncate">{event.location}</span>
                            </div>
                          )}
                          
                          {openDropdown === event.id && (
                            <div className="absolute right-0 mt-1 w-32 rounded-lg z-10 text-foreground bg-background/75 supports-[backdrop-filter]:bg-background/60 backdrop-blur-xl backdrop-saturate-150 border border-border/60 shadow-sm">
                              {event.isRecurring && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.location.href = `/study-session/${event.id}`
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Join</span>
                                </button>
                              )}
                              {event.subject && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.location.href = `/timer/${event.id}`
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                                >
                                  <Play className="h-3 w-3" />
                                  <span>Start</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Study-hour events are those created via study-hours endpoint (always have subject)
                                  if (event.subject) {
                                    setEditingStudyHours(event)
                                    setStudyHours({
                                      title: event.title,
                                      description: event.description || "",
                                      startTime: event.startTime,
                                      endTime: event.endTime,
                                      subjectId: event.subject?.id || "",
                                      isRecurring: event.isRecurring || false,
                                      recurringDays: event.recurringDays ? JSON.parse(event.recurringDays) : [],
                                      recurringEndDate: event.recurringEndDate ? new Date(event.recurringEndDate).toISOString().split('T')[0] : ""
                                    })
                                    setShowStudyHoursForm(true)
                                    setShowAddForm(false)
                                  } else {
                                    setEditingEvent(event)
                                    setShowAddForm(true)
                                    setShowStudyHoursForm(false)
                                  }
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                              <div className="border-t border-border"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteEvent(event.id)
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center space-x-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {dayTasks.map((task: Task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border mb-1 relative ${
                            task.status === 'DONE' ? 'bg-green-100 text-green-700 border-green-200' :
                            task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium truncate">{task.title}</div>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className={`text-xs px-1 py-0.5 rounded-full ${
                                  task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setOpenDropdown(openDropdown === task.id ? null : task.id)}
                              className="p-1 text-muted-foreground hover:text-foreground hover:bg-primary/20 rounded transition-colors"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {openDropdown === task.id && (
                            <div className="absolute right-0 mt-1 w-32 rounded-lg z-10 text-foreground bg-background/75 supports-[backdrop-filter]:bg-background/60 backdrop-blur-xl backdrop-saturate-150 border border-border/60 shadow-sm">
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, "TODO")}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                              >
                                <AlertCircle className="h-3 w-3" />
                                <span>Pending</span>
                              </button>
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                              >
                                <Clock className="h-3 w-3" />
                                <span>In Progress</span>
                              </button>
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, "DONE")}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                              >
                                <CheckSquare className="h-3 w-3" />
                                <span>Completed</span>
                              </button>
                              <div className="border-t border-border"></div>
                              <button
                                onClick={() => openEditTask(task)}
                                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/20 transition-colors flex items-center space-x-2"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                              <div className="border-t border-border"></div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center space-x-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No events scheduled</p>
          ) : (
            events
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((event) => {
                // Use consistent card styling like other tabs
                const eventColor = 'bg-card/90 backdrop-blur-sm border-border shadow-sm';
                
                return (
                  <div key={event.id} className={`p-4 rounded-lg border ${eventColor}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-foreground">{event.title}</h3>
                          {event.isRecurring && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{format(new Date(event.startTime), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(event.startTime), "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        {event.subject && (
                          <div className="flex items-center space-x-1 mt-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.subject.color }}></div>
                            <span className="text-xs text-muted-foreground">{event.subject.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>
    </div>
  )
}
