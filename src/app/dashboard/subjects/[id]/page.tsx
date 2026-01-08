"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Calendar, CheckSquare, Clock, AlertCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate?: string
  createdAt: string
}

interface Event {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  createdAt: string
}

interface Subject {
  id: string
  name: string
  color: string
  createdAt: string
}

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSubjectData()
    }
  }, [params.id])

  const fetchSubjectData = async () => {
    try {
      const [subjectResponse, tasksResponse, eventsResponse] = await Promise.all([
        fetch(`/api/subjects/${params.id}`, {
          credentials: 'include'
        }),
        fetch(`/api/tasks?subjectId=${params.id}`, {
          credentials: 'include'
        }),
        fetch(`/api/events?subjectId=${params.id}`, {
          credentials: 'include'
        })
      ])

      if (subjectResponse.ok) {
        const subjectData = await subjectResponse.json()
        setSubject(subjectData)
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData)
      }
    } catch (error) {
      console.error("Failed to fetch subject data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "DONE":
        return <CheckSquare className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-green-100 text-green-700"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">Subject not found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The subject you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div 
            className="h-8 w-8 rounded-full" 
            style={{ backgroundColor: subject.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(subject.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
              <p className="text-muted-foreground">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">{events.length}</p>
              <p className="text-muted-foreground">Total Events</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {tasks.filter(task => task.status === "TODO").length}
              </p>
              <p className="text-muted-foreground">Pending Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <CheckSquare className="h-5 w-5" />
          <span>Tasks</span>
        </h2>
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No tasks for this subject</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="bg-background p-4 rounded-lg border border-border">
                <div className="flex items-start space-x-3">
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
                      <p className="text-muted-foreground mt-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <span className="text-sm text-muted-foreground mt-2 inline-block">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Events</span>
        </h2>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No events for this subject</p>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="bg-background p-4 rounded-lg border border-border">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    {event.description && (
                      <p className="text-muted-foreground mt-1">{event.description}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Start: {new Date(event.startTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        End: {new Date(event.endTime).toLocaleString()}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">
                          Location: {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
