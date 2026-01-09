"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, CheckCircle, XCircle, TrendingUp, BookOpen, Target, Trash2, Calendar } from 'lucide-react'
import { useSettings } from "@/contexts/settings-context"

interface SubjectStats {
  subjectId: string
  subjectName: string
  subjectColor: string
  totalHours: number
  sessionCount: number
  averageSessionLength: number
}

interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  overdue: number
}

interface AnalyticsData {
  subjectStats: SubjectStats[]
  taskStats: TaskStats
  weeklyProgress: Array<{ week: string; hours: number; tasksCompleted: number }>
  monthlyTrend: Array<{ month: string; hours: number }>
}

interface SessionRecord {
  id: string
  startTime: string
  endTime?: string
  durationMs?: number
  tasksCompleted: number
  eventTitle: string
  subjectName: string
  studyEfficiency?: number
  sessionType?: string
  breakDuration?: number
  breakAmounts?: number
  focusScore?: number
  productivityRating?: number
}

interface SessionData {
  sessions: SessionRecord[]
  subjectId: string
  subjectName: string
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'24h' | 'week' | 'month' | 'custom' | 'all'>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [deletingSession, setDeletingSession] = useState<string | null>(null)
  const { settings } = useSettings()

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, customStartDate, customEndDate])

  useEffect(() => {
    if (timeRange === 'custom') {
      setShowCustomDatePicker(true)
    } else {
      setShowCustomDatePicker(false)
      setCustomStartDate('')
      setCustomEndDate('')
    }
  }, [timeRange])

  // Auto-refresh session data when time range changes and a subject is expanded
  useEffect(() => {
    if (expandedSubject) {
      fetchSessionData(expandedSubject)
    }
  }, [timeRange, customStartDate, customEndDate])

  const fetchAnalytics = async () => {
    try {
      const timestamp = Date.now() // Add cache-busting
      let url = `/api/analytics?range=${timeRange}&t=${timestamp}`
      
      if (timeRange === 'custom' && customStartDate && customEndDate) {
        // Ensure dates are in YYYY-MM-DD format and add time to make them inclusive
        const startDate = new Date(customStartDate)
        const endDate = new Date(customEndDate)
        
        // Set end date to end of day to be inclusive
        endDate.setHours(23, 59, 59, 999)
        
        const formattedStartDate = startDate.toISOString().split('T')[0]
        const formattedEndDate = endDate.toISOString().split('T')[0]
        
        url += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        
        console.log('Custom date range:', {
          customStartDate,
          customEndDate,
          formattedStartDate,
          formattedEndDate,
          url
        })
      }
      
      console.log('Fetching analytics from URL:', url)
      
      // Force clear loading state
      setLoading(true)
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store' // Prevent caching
      })
      console.log('Analytics response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Analytics data received:', data)
        
        // Force update the state
        setAnalyticsData(null) // Clear first
        setTimeout(() => {
          setAnalyticsData(data) // Then set new data
        }, 0)
      } else {
        console.error("Failed to fetch analytics:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionData = async (subjectId: string) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null)
      setSessionData(null)
      return
    }

    setLoadingSessions(true)
    setExpandedSubject(subjectId)
    
    try {
      let url = `/api/analytics/sessions?subjectId=${subjectId}&range=${timeRange}`
      
      if (timeRange === 'custom' && customStartDate && customEndDate) {
        // Ensure dates are in YYYY-MM-DD format and add time to make them inclusive
        const startDate = new Date(customStartDate)
        const endDate = new Date(customEndDate)
        
        // Set end date to end of day to be inclusive
        endDate.setHours(23, 59, 59, 999)
        
        const formattedStartDate = startDate.toISOString().split('T')[0]
        const formattedEndDate = endDate.toISOString().split('T')[0]
        
        url += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        
        console.log('Custom session date range:', {
          customStartDate,
          customEndDate,
          formattedStartDate,
          formattedEndDate,
          url
        })
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
      } else {
        console.error("Failed to fetch session data:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    setDeletingSession(sessionId)
    
    try {
      const response = await fetch(`/api/analytics/sessions/delete?sessionId=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Remove the deleted session from the local state
        setSessionData(prev => prev ? {
          ...prev,
          sessions: prev.sessions.filter(session => session.id !== sessionId)
        } : null)
        
        // Refresh the main analytics data to update the stats
        fetchAnalytics()
      } else {
        console.error("Failed to delete session:", response.status)
        alert('Failed to delete session. Please try again.')
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
      alert('Failed to delete session. Please try again.')
    } finally {
      setDeletingSession(null)
    }
  }

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    
    if (wholeHours === 0 && minutes === 0) {
      return '0hrs'
    } else if (wholeHours === 0) {
      return `${minutes}mins`
    } else if (minutes === 0) {
      return `${wholeHours}hrs`
    } else {
      return `${wholeHours}hrs ${minutes}mins`
    }
  }

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A'
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours === 0 && minutes === 0) {
      return '0mins'
    } else if (hours === 0) {
      return `${minutes}mins`
    } else if (minutes === 0) {
      return `${hours}hrs`
    } else {
      return `${hours}hrs ${minutes}mins`
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCompletionRate = (completed: number, total: number) => {
    return total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No analytics data available</h1>
          <p className="text-muted-foreground">Start studying and completing tasks to see your progress!</p>
        </div>
      </div>
    )
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your study progress and task completion</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === '24h' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 24h
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'week' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'month' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setTimeRange('custom')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'custom' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Custom
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === 'all' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Custom Date Range Picker */}
          {showCustomDatePicker && (
            <div className="mt-4 p-4 bg-card/90 backdrop-blur-sm rounded-lg border border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-foreground">From:</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium text-foreground">To:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      fetchAnalytics()
                    }
                  }}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Study Hours</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatHours(analyticsData.subjectStats.reduce((sum, subject) => sum + subject.totalHours, 0))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.taskStats.completed}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getCompletionRate(analyticsData.taskStats.completed, analyticsData.taskStats.total)}% completion rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.taskStats.pending}
                </p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Overdue</p>
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.taskStats.overdue}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject Breakdown Chart */}
          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Study Hours by Subject</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subjectName" />
                <YAxis tickFormatter={(value: number) => formatHours(value)} />
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? [formatHours(value), 'Hours'] : ['', '']} />
                <Bar dataKey="totalHours" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Pie Chart */}
          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Task Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: analyticsData.taskStats.completed },
                    { name: 'In Progress', value: analyticsData.taskStats.inProgress },
                    { name: 'Pending', value: analyticsData.taskStats.pending },
                    { name: 'Overdue', value: analyticsData.taskStats.overdue }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Completed', value: analyticsData.taskStats.completed },
                    { name: 'In Progress', value: analyticsData.taskStats.inProgress },
                    { name: 'Pending', value: analyticsData.taskStats.pending },
                    { name: 'Overdue', value: analyticsData.taskStats.overdue }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Details Table */}
        <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Subject Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sessions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg Session</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.subjectStats.map((subject) => (
                  <tr key={subject.subjectId} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => fetchSessionData(subject.subjectId)}
                        className="flex items-center space-x-2 hover:text-primary transition-colors"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.subjectColor }}
                        ></div>
                        <span className="text-sm font-medium text-foreground">{subject.subjectName}</span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${expandedSubject === subject.subjectId ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{formatHours(subject.totalHours)}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{subject.sessionCount}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{formatHours(subject.averageSessionLength)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Session Records Dropdown */}
          {expandedSubject && (
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-md font-semibold text-foreground mb-4">
                Session Records - {sessionData?.subjectName}
              </h3>
              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : sessionData?.sessions && sessionData.sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border">
                        {settings.showStartTime && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Start Time</th>
                        )}
                        {settings.showEndTime && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">End Time</th>
                        )}
                        {settings.showDuration && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Duration</th>
                        )}
                        {settings.showEvent && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Event</th>
                        )}
                        {settings.showStudyEfficiency && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Study Efficiency</th>
                        )}
                        {settings.showSessionType && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Session Type</th>
                        )}
                        {settings.showBreakDuration && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Break Duration</th>
                        )}
                        {settings.showBreakAmounts && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Break Amounts</th>
                        )}
                        {settings.showFocusScore && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Focus Score</th>
                        )}
                        {settings.showProductivityRating && (
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Productivity Rating</th>
                        )}
                        {settings.showTasksCompleted && (
                          <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground w-20">Tasks</th>
                        )}
                        {settings.showActions && (
                          <th className="text-center py-2 px-2 text-xs font-medium text-muted-foreground w-16">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sessionData.sessions.map((session) => (
                        <tr key={session.id} className="border-b border-border/30">
                          {settings.showStartTime && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {formatDateTime(session.startTime)}
                            </td>
                          )}
                          {settings.showEndTime && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.endTime ? formatDateTime(session.endTime) : 'In Progress'}
                            </td>
                          )}
                          {settings.showDuration && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {formatDuration(session.durationMs)}
                            </td>
                          )}
                          {settings.showEvent && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.eventTitle}
                            </td>
                          )}
                          {settings.showStudyEfficiency && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.studyEfficiency ? `${session.studyEfficiency}%` : 'N/A'}
                            </td>
                          )}
                          {settings.showSessionType && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.sessionType || 'Study'}
                            </td>
                          )}
                          {settings.showBreakDuration && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.breakDuration ? formatDuration(session.breakDuration) : 'N/A'}
                            </td>
                          )}
                          {settings.showBreakAmounts && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.breakAmounts ? session.breakAmounts.toString() : 'N/A'}
                            </td>
                          )}
                          {settings.showFocusScore && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.focusScore ? `${session.focusScore}/10` : 'N/A'}
                            </td>
                          )}
                          {settings.showProductivityRating && (
                            <td className="py-2 px-3 text-xs text-foreground">
                              {session.productivityRating ? `${session.productivityRating}/5` : 'N/A'}
                            </td>
                          )}
                          {settings.showTasksCompleted && (
                            <td className="py-2 px-2 text-xs text-foreground text-center">
                              <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium min-w-[20px] ${
                                session.tasksCompleted > 0 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {session.tasksCompleted}
                              </span>
                            </td>
                          )}
                          {settings.showActions && (
                            <td className="py-2 px-2 text-xs text-foreground text-center">
                              <button
                                onClick={() => deleteSession(session.id)}
                                disabled={deletingSession === session.id}
                                className="inline-flex items-center justify-center p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete session"
                              >
                                {deletingSession === session.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No session records found for this subject.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
