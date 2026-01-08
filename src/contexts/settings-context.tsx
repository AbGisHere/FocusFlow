"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Settings {
  showTasks: boolean
  showCalendar: boolean
  movableMinimizedTimer: boolean
  // Session Records columns
  showStartTime: boolean
  showEndTime: boolean
  showDuration: boolean
  showEvent: boolean
  showTasksCompleted: boolean
  showActions: boolean
  showStudyEfficiency: boolean
  showSessionType: boolean
  showBreakDuration: boolean
  showBreakAmounts: boolean
  showFocusScore: boolean
  showProductivityRating: boolean
}

interface SettingsContextType {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  saveSettings: () => void
}

const defaultSettings: Settings = {
  showTasks: true,
  showCalendar: true,
  movableMinimizedTimer: true,
  showStartTime: true,
  showEndTime: true,
  showDuration: true,
  showEvent: true,
  showTasksCompleted: true,
  showActions: true,
  showStudyEfficiency: true,
  showSessionType: true,
  showBreakDuration: true,
  showBreakAmounts: true,
  showFocusScore: true,
  showProductivityRating: true,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('focusflow-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('focusflow-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  // Auto-save settings whenever they change
  useEffect(() => {
    saveSettings()
  }, [settings])

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
