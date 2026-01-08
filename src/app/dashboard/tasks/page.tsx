"use client"

import { useState, useEffect } from "react"
import { Plus, CheckSquare, Clock, AlertCircle, ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate?: string
  createdAt: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    dueDate: "",
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks", {
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
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newTask),
      })
      if (response.ok) {
        setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "" })
        setShowAddForm(false)
        fetchTasks()
      } else {
        console.error("Failed to add task:", response.status)
      }
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        fetchTasks()
        setOpenDropdown(null) // Close dropdown after update
      } else {
        console.error("Failed to update task status:", response.status)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleStatusChange = (taskId: string, status: Task["status"]) => {
    updateTaskStatus(taskId, status)
  }

  // Group tasks by status
  const pendingTasks = tasks.filter(task => task.status === "TODO")
  const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS")
  const completedTasks = tasks.filter(task => task.status === "DONE")

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
              <p className="text-muted-foreground mt-1">{task.description}</p>
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
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">Create your first task to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Tasks */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-foreground">Pending</h2>
                <span className="text-sm text-muted-foreground">({pendingTasks.length})</span>
              </div>
              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending tasks</p>
                ) : (
                  pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>

            {/* In Progress Tasks */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-foreground">In Progress</h2>
                <span className="text-sm text-muted-foreground">({inProgressTasks.length})</span>
              </div>
              <div className="space-y-3">
                {inProgressTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No tasks in progress</p>
                ) : (
                  inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-foreground">Completed</h2>
                <span className="text-sm text-muted-foreground">({completedTasks.length})</span>
              </div>
              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No completed tasks</p>
                ) : (
                  completedTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
