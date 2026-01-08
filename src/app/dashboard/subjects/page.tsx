"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Plus, BookOpen, ChevronDown, ChevronRight, Trash2, Pencil, CheckSquare, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export interface Subject {
  id: string
  name: string
  color: string
  createdAt: string
}

export default function SubjectsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [subjectTasks, setSubjectTasks] = useState<{ [key: string]: any[] }>({})
  const [subjectEvents, setSubjectEvents] = useState<{ [key: string]: any[] }>({})
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())
  const [loadingEvents, setLoadingEvents] = useState<Set<string>>(new Set())
  const [newSubject, setNewSubject] = useState({
    name: "",
    color: "#3b82f6", // Default blue color
  })

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ]

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown-trigger]') && !target.closest('[data-dropdown-menu]')) {
        setOpenDropdown(null)
        setDropdownPosition(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [openDropdown])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects", {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      } else {
        console.error("Failed to fetch subjects:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newSubject),
      })
      if (response.ok) {
        setNewSubject({ name: "", color: "#3b82f6" })
        setShowAddForm(false)
        fetchSubjects()
      } else {
        console.error("Failed to add subject:", response.status)
      }
    } catch (error) {
      console.error("Failed to add subject:", error)
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
        credentials: 'include',
      })
      
      if (response.ok) {
        fetchSubjects()
        setOpenDropdown(null)
      } else {
        console.error("Failed to delete subject:", response.status)
      }
    } catch (error) {
      console.error("Failed to delete subject:", error)
    }
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setNewSubject({
      name: subject.name,
      color: subject.color,
    })
  }

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubject) return
    
    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newSubject),
      })
      
      if (response.ok) {
        setEditingSubject(null)
        setNewSubject({ name: "", color: "#3b82f6" })
        fetchSubjects()
      } else {
        console.error("Failed to update subject:", response.status)
      }
    } catch (error) {
      console.error("Failed to update subject:", error)
    }
  }

  const handleDropdownClick = (e: React.MouseEvent, subjectId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const right = windowWidth - rect.right
    
    setDropdownPosition({
      top: rect.bottom + 8,
      right: right
    })
    setOpenDropdown(openDropdown === subjectId ? null : subjectId)
  }

  const fetchSubjectTasks = async (subjectId: string) => {
    if (subjectTasks[subjectId]) return // Already loaded
    
    setLoadingTasks(prev => new Set(prev).add(subjectId))
    try {
      const response = await fetch(`/api/tasks?subjectId=${subjectId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSubjectTasks(prev => ({ ...prev, [subjectId]: data }))
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(subjectId)
        return newSet
      })
    }
  }

  const fetchSubjectEvents = async (subjectId: string) => {
    if (subjectEvents[subjectId]) return // Already loaded
    
    setLoadingEvents(prev => new Set(prev).add(subjectId))
    try {
      const response = await fetch(`/api/events?subjectId=${subjectId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSubjectEvents(prev => ({ ...prev, [subjectId]: data }))
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoadingEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(subjectId)
        return newSet
      })
    }
  }

  const toggleSubjectExpansion = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
      // Fetch data when expanding
      fetchSubjectTasks(subjectId)
      fetchSubjectEvents(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        // Update the task in all relevant subject caches
        setSubjectTasks(prev => {
          const updated = { ...prev }
          Object.keys(updated).forEach(subjectId => {
            updated[subjectId] = updated[subjectId].map(task => 
              task.id === taskId ? { ...task, status: newStatus } : task
            )
          })
          return updated
        })
        setOpenDropdown(null)
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">
            Manage your subjects and their associated colors
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingSubject(null)
            setNewSubject({ name: "", color: "#3b82f6" })
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Add Subject
        </button>
      </div>

      {(showAddForm || editingSubject) && (
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
          </h2>
          <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Subject Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                placeholder="e.g. Mathematics, Physics"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div 
                    key={color.value}
                    onClick={() => setNewSubject({ ...newSubject, color: color.value })}
                    className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center ${
                      newSubject.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {newSubject.color === color.value && (
                      <CheckSquare className="h-4 w-4 text-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingSubject(null)
                  setNewSubject({ name: "", color: "#3b82f6" })
                }}
                className="px-4 py-2 border border-input text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm"
              >
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card shadow overflow-visible sm:rounded-md">
        {subjects.length === 0 ? (
          <div className="text-center p-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No subjects</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new subject.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                New Subject
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-visible">
            {subjects.map((subject) => (
              <li key={subject.id} className="px-4 py-4 sm:px-6 relative">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSubjectExpansion(subject.id)}
                    className="flex items-center hover:bg-primary/10 p-2 rounded-lg transition-colors flex-1 text-left"
                  >
                    {expandedSubjects.has(subject.id) ? (
                      <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                    )}
                    <div 
                      className="h-5 w-5 rounded-full mr-3" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <p className="text-sm font-medium text-foreground">
                      {subject.name}
                    </p>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center text-muted-foreground hover:text-foreground"
                      data-dropdown-trigger
                      onClick={(e) => handleDropdownClick(e, subject.id)}
                    >
                      <span className="sr-only">Open options</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openDropdown === subject.id ? 'transform rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {/* Expandable content */}
                {expandedSubjects.has(subject.id) && (
                  <div className="mt-4 pl-8 space-y-4">
                    {/* Tasks Section */}
                    <div className="bg-background/80 backdrop-blur-md backdrop-saturate-150 rounded-lg p-4 border border-border/60 shadow-sm">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                        <h3 className="text-sm font-medium text-foreground">Tasks</h3>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({subjectTasks[subject.id]?.length || 0})
                        </span>
                      </div>
                      {loadingTasks.has(subject.id) ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      ) : subjectTasks[subject.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {subjectTasks[subject.id].map((task: any) => (
                            <div key={task.id} className="p-3 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center flex-1">
                                  {getStatusIcon(task.status)}
                                  <span className={`ml-2 text-sm ${
                                    task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'
                                  }`}>
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
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
                                          onClick={() => updateTaskStatus(task.id, "TODO")}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 transition-colors flex items-center space-x-2"
                                        >
                                          <AlertCircle className="h-3 w-3" />
                                          <span>Pending</span>
                                        </button>
                                        <button
                                          onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 transition-colors flex items-center space-x-2"
                                        >
                                          <Clock className="h-3 w-3" />
                                          <span>In Progress</span>
                                        </button>
                                        <button
                                          onClick={() => updateTaskStatus(task.id, "DONE")}
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-primary/20 transition-colors flex items-center space-x-2"
                                        >
                                          <CheckSquare className="h-3 w-3" />
                                          <span>Completed</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No tasks for this subject</p>
                      )}
                    </div>

                    {/* Events Section */}
                    <div className="bg-background/80 backdrop-blur-md backdrop-saturate-150 rounded-lg p-4 border border-border/60 shadow-sm">
                      <div className="flex items-center mb-3">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <h3 className="text-sm font-medium text-foreground">Events</h3>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({subjectEvents[subject.id]?.length || 0})
                        </span>
                      </div>
                      {loadingEvents.has(subject.id) ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      ) : subjectEvents[subject.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {subjectEvents[subject.id].map((event: any) => (
                            <div key={event.id} className="flex items-center justify-between p-3 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-sm">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                                <span className="text-sm text-foreground">{event.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.startTime).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No events for this subject</p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {openDropdown && dropdownPosition && createPortal(
        <div 
          className="fixed z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`
          }}
        >
          <div className="w-48 rounded-md shadow-lg bg-card border border-border overflow-visible" data-dropdown-menu>
            <div className="py-1">
              {subjects.find(s => s.id === openDropdown) && (
                <>
                  <button
                    onClick={() => {
                      handleEditSubject(subjects.find(s => s.id === openDropdown)!)
                      setOpenDropdown(null)
                      setDropdownPosition(null)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/10 flex items-center transition-colors"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteSubject(openDropdown)
                      setOpenDropdown(null)
                      setDropdownPosition(null)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center transition-colors"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
