"use client"

import { Calendar, CheckSquare, Clock, TrendingUp, AlertCircle, ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
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

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const sessionData = await authClient.getSession()
        if (!sessionData?.data?.user) {
          setError("Please sign in to view the dashboard")
          setLoading(false)
          return
        }

        setSession(sessionData)

        // Fetch tasks and events
        const [tasksResponse, eventsResponse] = await Promise.all([
          fetch('/api/tasks', {
            credentials: 'include'
          }).then(res => {
            if (!res.ok) {
              if (res.status === 401) {
                throw new Error('Please sign in again')
              }
              throw new Error(`Failed to fetch tasks: ${res.status}`)
            }
            return res.json()
          }).catch(() => []), // Return empty array on error
          fetch('/api/events', {
            credentials: 'include'
          }).then(res => {
            if (!res.ok) {
              if (res.status === 401) {
                throw new Error('Please sign in again')
              }
              throw new Error(`Failed to fetch events: ${res.status}`)
            }
            return res.json()
          }).catch(() => []) // Return empty array on error
        ])

        setTasks(Array.isArray(tasksResponse) ? tasksResponse : [])
        setEvents(Array.isArray(eventsResponse) ? eventsResponse : [])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setError(error instanceof Error ? error.message : "Failed to load dashboard data. Please try refreshing the page.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        // Reload tasks to get updated data
        const tasksResponse = await fetch('/api/tasks', {
          credentials: 'include'
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`)
          return res.json()
        }).catch(() => [])
        setTasks(Array.isArray(tasksResponse) ? tasksResponse : [])
        setOpenDropdown(null)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleStatusChange = (taskId: string, status: string) => {
    updateTaskStatus(taskId, status)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckSquare className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-green-100 text-green-700"
    }
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">
            {getStatusIcon(task.status)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-foreground">{task.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
            {task.dueDate && (
              <span className="text-sm text-muted-foreground mt-2 inline-block">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === task.id ? null : task.id)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {openDropdown === task.id && (
            <div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleStatusChange(task.id, "TODO")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 transition-colors flex items-center space-x-2"
              >
                <AlertCircle className="h-3 w-3" />
                <span>Pending</span>
              </button>
              <button
                onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 transition-colors flex items-center space-x-2"
              >
                <Clock className="h-3 w-3" />
                <span>In Progress</span>
              </button>
              <button
                onClick={() => handleStatusChange(task.id, "DONE")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 transition-colors flex items-center space-x-2"
              >
                <CheckSquare className="h-3 w-3" />
                <span>Completed</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session?.data?.user) {
    return <div>Please sign in to view the dashboard</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'DONE').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter(t => t.status === 'TODO').length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.data.user.name || session.data.user.email}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
              <p className="text-2xl font-bold text-purple-600">{events.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks yet</p>
            ) : (
              tasks.map(task => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No events scheduled</p>
            ) : (
              events.map((event) => {
                // Use consistent card styling like other tabs
                const eventColor = 'bg-card/90 backdrop-blur-sm border-border shadow-sm';
                
                return (
                  <div key={event.id} className={`flex items-center justify-between p-3 rounded-lg border ${eventColor}`}>
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
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      {event.subject && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.subject.color }}></div>
                          <span className="text-xs text-muted-foreground">{event.subject.name}</span>
                        </div>
                      )}
                    </div>
                    {event.location && (
                      <div className="text-sm text-muted-foreground">{event.location}</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
