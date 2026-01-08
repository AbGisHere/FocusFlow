"use client"

import { useState, useEffect } from "react"
import { Plus, CheckSquare, Clock, AlertCircle, ChevronDown, Trash2, Pencil } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate?: string
  createdAt: string
  subject?: {
    id: string
    name: string
    color: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<Task["status"] | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    dueDate: "",
    subjectId: "",
  })

  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    dueDate: "",
    subjectId: "",
  })

  const [subjects, setSubjects] = useState<Array<{id: string, name: string, color: string}>>([])

  useEffect(() => {
    fetchTasks()
    fetchSubjects()
  }, [])

  // Cleanup cursor styles on component unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
      document.body.style.removeProperty('-webkit-user-select')
    }
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
        setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "", subjectId: "" })
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

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: 'include',
      })
      if (response.ok) {
        fetchTasks()
        setOpenDropdown(null)
      } else {
        console.error("Failed to delete task:", response.status)
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setEditTask({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
      subjectId: task.subject?.id || "",
    })
    setShowEditForm(true)
    setOpenDropdown(null)
  }

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          title: editTask.title,
          description: editTask.description,
          priority: editTask.priority,
          dueDate: editTask.dueDate ? new Date(editTask.dueDate).toISOString() : "",
          subjectId: editTask.subjectId || null,
        }),
      })

      if (response.ok) {
        setShowEditForm(false)
        setEditingTask(null)
        fetchTasks()
      } else {
        console.error("Failed to update task:", response.status)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
    // Close any open dropdowns when starting to drag
    setOpenDropdown(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverStatus(null)
  }

  const handleDragOver = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over state if actually leaving the column
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStatus(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault()
    setDragOverStatus(null)
    
    if (!draggedTask || draggedTask.status === newStatus) return
    
    const oldStatus = draggedTask.status
    const taskId = draggedTask.id
    
    // Optimistic update - update UI immediately
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    )
    
    // Clear dragged state immediately for smooth UX
    setDraggedTask(null)
    
    try {
      // Update backend in background
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        // If backend update fails, revert the optimistic update
        console.error("Failed to update task status:", response.status)
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: oldStatus }
              : task
          )
        )
      }
    } catch (error) {
      // If network error occurs, revert the optimistic update
      console.error("Failed to update task:", error)
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: oldStatus }
            : task
        )
      )
    }
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
    <div 
      className={`bg-card p-4 rounded-xl shadow-sm border border-border mb-3 transition-all duration-300 ease-in-out select-none cursor-grab active:cursor-grabbing ${
        draggedTask?.id === task.id ? 'scale-[1.02] shadow-xl' : 'hover:shadow-md'
      }`}
      draggable
      onClick={() => {
        // Prepare card for immediate drag on next interaction
        if (!draggedTask) {
          // This makes the card "active" for immediate drag
        }
      }}
      onDragStart={(e) => {
        e.stopPropagation()
        setDraggedTask(task)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', task.id)
        setOpenDropdown(null)
      }}
      onDragEnd={() => {
        setDraggedTask(null)
        setDragOverStatus(null)
      }}
    >
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
              {task.subject && (
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: task.subject.color }}
                >
                  {task.subject.name}
                </span>
              )}
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
            className={`p-1 text-muted-foreground hover:text-foreground transition-colors ${
              openDropdown === task.id ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{ pointerEvents: openDropdown === task.id ? 'auto' : 'none' }}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {openDropdown === task.id && (
            <div className="absolute right-0 mt-1 w-32 rounded-lg z-10 bg-background/75 supports-[backdrop-filter]:bg-background/60 backdrop-blur-xl backdrop-saturate-150 border border-border/60 shadow-sm">
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
                  Subject
                </label>
                <select
                  value={newTask.subjectId}
                  onChange={(e) => setNewTask({ ...newTask, subjectId: e.target.value })}
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
                className="px-4 py-2 border border-input text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && editingTask && (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Edit Task</h2>
          <form onSubmit={handleEditTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title
              </label>
              <input
                type="text"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
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
                  value={editTask.priority}
                  onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as Task["priority"] })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Subject
                </label>
                <select
                  value={editTask.subjectId}
                  onChange={(e) => setEditTask({ ...editTask, subjectId: e.target.value })}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editTask.dueDate}
                onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingTask(null)
                }}
                className="px-4 py-2 border border-input text-primary rounded-lg hover:bg-primary/10 transition-colors"
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
            <div 
              className={`bg-card rounded-xl shadow-sm border border-border p-6 transition-colors duration-200 ${
                dragOverStatus === "TODO" ? "bg-primary/10" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, "TODO")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "TODO")}
            >
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
            <div 
              className={`bg-card rounded-xl shadow-sm border border-border p-6 transition-colors duration-200 ${
                dragOverStatus === "IN_PROGRESS" ? "bg-primary/10" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, "IN_PROGRESS")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
            >
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
            <div 
              className={`bg-card rounded-xl shadow-sm border border-border p-6 transition-colors duration-200 ${
                dragOverStatus === "DONE" ? "bg-primary/10" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, "DONE")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "DONE")}
            >
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
