"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Clock, CheckCircle, XCircle, TrendingUp, BookOpen, Target } from 'lucide-react'

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

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        console.error("Failed to fetch analytics:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your study progress and task completion</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
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
                <YAxis />
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
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: subject.subjectColor }}
                        ></div>
                        <span className="text-sm font-medium text-foreground">{subject.subjectName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{formatHours(subject.totalHours)}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{subject.sessionCount}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{formatHours(subject.averageSessionLength)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
