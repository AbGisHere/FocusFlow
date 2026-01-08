"use client"

import { useState } from "react"
import { Timer, Database, Settings as SettingsIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, children }: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  children: React.ReactNode 
}) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={`w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </div>
    <div className="flex-1">
      {children}
    </div>
  </label>
)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'timer' | 'sessions'>('sessions')
  const router = useRouter()
  const { settings, updateSetting } = useSettings()
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null)
  const [exportRange, setExportRange] = useState<'week' | 'month' | 'all'>('all')

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(format)
    try {
      const response = await fetch(`/api/export/${format}?range=${exportRange}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `focusflow-sessions.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error(`Failed to export ${format}:`, response.status)
        alert(`Failed to export ${format.toUpperCase()}. Please try again.`)
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error)
      alert(`Error exporting ${format.toUpperCase()}. Please try again.`)
    } finally {
      setIsExporting(null)
    }
  }

  const tabs = [
    {
      id: 'timer' as const,
      label: 'Timer',
      icon: Timer,
      description: 'Configure timer settings and preferences'
    },
    {
      id: 'sessions' as const,
      label: 'Session Records',
      icon: Database,
      description: 'View and manage your study session history'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences and data</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
          {activeTab === 'timer' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Timer Settings</h2>
                <p className="text-muted-foreground">Configure timer display and behavior preferences</p>
              </div>
              
              <div className="space-y-6">
                {/* Display Options */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Display Options</h3>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={settings.showTasks}
                      onChange={(checked) => updateSetting('showTasks', checked)}
                    >
                      <div>
                        <span className="text-sm font-medium text-foreground">Show Tasks</span>
                        <p className="text-xs text-muted-foreground">Display task list during timer sessions</p>
                      </div>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showCalendar}
                      onChange={(checked) => updateSetting('showCalendar', checked)}
                    >
                      <div>
                        <span className="text-sm font-medium text-foreground">Show Calendar</span>
                        <p className="text-xs text-muted-foreground">Display calendar view during timer sessions</p>
                      </div>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.movableMinimizedTimer}
                      onChange={(checked) => updateSetting('movableMinimizedTimer', checked)}
                    >
                      <div>
                        <span className="text-sm font-medium text-foreground">Movable Minimized Timer</span>
                        <p className="text-xs text-muted-foreground">Allow minimized timer to be moved around screen</p>
                      </div>
                    </ToggleSwitch>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Session Records</h2>
                <p className="text-muted-foreground">View and manage your study session history</p>
              </div>
              
              <div className="space-y-6">
                {/* Column Display Options */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Display Columns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ToggleSwitch
                      checked={settings.showStartTime}
                      onChange={(checked) => updateSetting('showStartTime', checked)}
                    >
                      <span className="text-sm text-foreground">Start Time</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showEndTime}
                      onChange={(checked) => updateSetting('showEndTime', checked)}
                    >
                      <span className="text-sm text-foreground">End Time</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showDuration}
                      onChange={(checked) => updateSetting('showDuration', checked)}
                    >
                      <span className="text-sm text-foreground">Duration</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showEvent}
                      onChange={(checked) => updateSetting('showEvent', checked)}
                    >
                      <span className="text-sm text-foreground">Event</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showTasksCompleted}
                      onChange={(checked) => updateSetting('showTasksCompleted', checked)}
                    >
                      <span className="text-sm text-foreground">Tasks Completed</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showActions}
                      onChange={(checked) => updateSetting('showActions', checked)}
                    >
                      <span className="text-sm text-foreground">Actions</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showStudyEfficiency}
                      onChange={(checked) => updateSetting('showStudyEfficiency', checked)}
                    >
                      <span className="text-sm text-foreground">Study Efficiency</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showSessionType}
                      onChange={(checked) => updateSetting('showSessionType', checked)}
                    >
                      <span className="text-sm text-foreground">Session Type</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showBreakDuration}
                      onChange={(checked) => updateSetting('showBreakDuration', checked)}
                    >
                      <span className="text-sm text-foreground">Break Duration</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showBreakAmounts}
                      onChange={(checked) => updateSetting('showBreakAmounts', checked)}
                    >
                      <span className="text-sm text-foreground">Break Amounts</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showFocusScore}
                      onChange={(checked) => updateSetting('showFocusScore', checked)}
                    >
                      <span className="text-sm text-foreground">Focus Score</span>
                    </ToggleSwitch>
                    <ToggleSwitch
                      checked={settings.showProductivityRating}
                      onChange={(checked) => updateSetting('showProductivityRating', checked)}
                    >
                      <span className="text-sm text-foreground">Productivity Rating</span>
                    </ToggleSwitch>
                  </div>
                </div>

                {/* Data Management */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-md">
                      <h4 className="font-medium text-foreground mb-2">Export Data</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download your study session data for backup or analysis
                      </p>
                      
                      {/* Date Range Selector */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
                        <div className="inline-flex rounded-lg border border-border bg-card p-1">
                          <button
                            onClick={() => setExportRange('week')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              exportRange === 'week' 
                                ? 'bg-primary text-white' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Last Week
                          </button>
                          <button
                            onClick={() => setExportRange('month')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              exportRange === 'month' 
                                ? 'bg-primary text-white' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Last Month
                          </button>
                          <button
                            onClick={() => setExportRange('all')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              exportRange === 'all' 
                                ? 'bg-primary text-white' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            All Time
                          </button>
                        </div>
                      </div>
                      
                      {/* Export Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleExport('csv')}
                          disabled={isExporting === 'csv'}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isExporting === 'csv' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent"></div>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Export to CSV
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleExport('pdf')}
                          disabled={isExporting === 'pdf'}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isExporting === 'pdf' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent"></div>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Export to PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-red-200 dark:border-red-800 rounded-md">
                      <h4 className="font-medium text-destructive mb-2">Delete All Sessions</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Permanently delete all your study session records. This action cannot be undone.
                      </p>
                      <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
                        Delete All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
