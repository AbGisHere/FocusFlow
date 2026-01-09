"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

interface MusicState {
  currentSound: string | null
  isPlaying: boolean
  volume: number
  isLoading: boolean
  error: string | null
}

interface MusicContextType {
  musicState: MusicState
  playSound: (soundId: string, soundUrl: string, soundName: string) => Promise<void>
  stopSound: () => void
  togglePlayPause: () => void
  setVolume: (volume: number) => void
  clearError: () => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

interface SoundOption {
  id: string
  name: string
  url: string
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [musicState, setMusicState] = useState<MusicState>({
    currentSound: null,
    isPlaying: false,
    volume: 0.3,
    isLoading: false,
    error: null
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const isInitialized = useRef(false)
  const resumeAttemptsRef = useRef(0)

  // Load state from localStorage on mount
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedState = localStorage.getItem('focusflow-background-music')
        if (savedState) {
          const parsed = JSON.parse(savedState)
          setMusicState(prev => ({
            ...prev,
            currentSound: parsed.currentSound,
            isPlaying: parsed.isPlaying,
            volume: parsed.volume || 0.3
          }))
        }
      } catch (error) {
        console.error('Error loading background music state:', error)
      }
      isInitialized.current = true
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized.current) {
      try {
        const stateToSave = {
          currentSound: musicState.currentSound,
          isPlaying: musicState.isPlaying,
          volume: musicState.volume
        }
        localStorage.setItem('focusflow-background-music', JSON.stringify(stateToSave))
      } catch (error) {
        console.error('Error saving background music state:', error)
      }
    }
  }, [musicState.currentSound, musicState.isPlaying, musicState.volume])

  // Initialize and protect audio context
  const getOrCreateAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Prevent audio context from being suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(console.error)
        }
      } catch (error) {
        console.error('Failed to create audio context:', error)
      }
    }
    return audioContextRef.current
  }

  // Aggressive audio protection function
  const protectAudio = async () => {
    if (!audioRef.current || !musicState.isPlaying || !musicState.currentSound) return
    
    const audio = audioRef.current
    const audioContext = getOrCreateAudioContext()
    
    // Resume audio context if suspended
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume()
        console.log('Audio context resumed')
      } catch (error) {
        console.error('Failed to resume audio context:', error)
      }
    }
    
    // Resume audio if paused
    if (audio.paused && audio.readyState >= 2) {
      try {
        await audio.play()
        console.log('Audio resumed successfully')
        resumeAttemptsRef.current = 0 // Reset counter on success
      } catch (error) {
        console.error('Failed to resume audio:', error)
        resumeAttemptsRef.current++
        
        // If we've tried too many times, stop trying to avoid spam
        if (resumeAttemptsRef.current > 5) {
          console.log('Too many resume attempts, stopping protection')
          return
        }
      }
    }
  }

  // Monitor and resume audio if it gets interrupted
  useEffect(() => {
    if (audioRef.current && musicState.isPlaying && musicState.currentSound) {
      const audio = audioRef.current
      
      // Check if audio was paused unexpectedly
      if (audio.paused && audio.readyState >= 2) {
        console.log('Audio was interrupted, attempting to resume...')
        protectAudio()
      }
    }
  }, [musicState.isPlaying, musicState.currentSound])

  // Handle page visibility changes to resume audio when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          audioRef.current && 
          musicState.isPlaying && 
          musicState.currentSound &&
          audioRef.current.paused) {
        
        console.log('Page became visible, resuming audio...')
        protectAudio()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [musicState.isPlaying, musicState.currentSound])

  // More aggressive periodic check during timer operations
  useEffect(() => {
    if (!musicState.isPlaying || !musicState.currentSound) return

    const interval = setInterval(() => {
      protectAudio()
    }, 1000) // Check every second for more aggressive protection

    return () => clearInterval(interval)
  }, [musicState.isPlaying, musicState.currentSound])

  // Additional protection during browser focus events
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        if (musicState.isPlaying && musicState.currentSound) {
          protectAudio()
        }
      }, 100) // Small delay to allow timer operations to complete
    }

    const handleBlur = () => {
      // Store current state before potential interruption
      if (musicState.isPlaying && musicState.currentSound) {
        console.log('Window blurred, protecting audio state')
      }
    }

    // Additional protection for mouse events that might trigger audio interruption
    const handleMouseDown = () => {
      if (musicState.isPlaying && musicState.currentSound && audioRef.current) {
        // Pre-emptively protect audio before user interactions
        setTimeout(() => protectAudio(), 50)
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [musicState.isPlaying, musicState.currentSound])

  const playSound = async (soundId: string, soundUrl: string, soundName: string) => {
    setMusicState(prev => ({ ...prev, isLoading: true, error: null }))
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    try {
      const audio = new Audio(soundUrl)
      
      // Initialize audio context for better control
      getOrCreateAudioContext()
      
      // Set up audio properties
      audio.preload = 'auto'
      audio.loop = true
      audio.volume = musicState.volume
      
      // Add event listeners to prevent interruption
      audio.addEventListener('suspend', () => {
        console.log('Audio was suspended, attempting to resume...')
        // Try to resume if this was unexpected
        if (musicState.isPlaying) {
          setTimeout(() => {
            protectAudio()
          }, 100)
        }
      })

      audio.addEventListener('stalled', () => {
        console.log('Audio stalled, attempting to resume...')
        setTimeout(() => {
          protectAudio()
        }, 200)
      })
      
      audioRef.current = audio

      // Wait for audio to be ready before playing
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio ready to play: ${soundName}`)
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setMusicState(prev => ({
                ...prev,
                isPlaying: true,
                currentSound: soundId,
                isLoading: false,
                error: null
              }))
              console.log(`Successfully playing: ${soundName}`)
            })
            .catch(error => {
              console.error(`Error playing ${soundName}:`, error)
              setMusicState(prev => ({
                ...prev,
                isLoading: false,
                error: error.name === 'NotAllowedError' 
                  ? 'Browser blocked autoplay. Please click the sound again.'
                  : `Failed to play ${soundName}. Please try again.`
              }))
            })
        }
      })

      audio.addEventListener('error', (e) => {
        console.error(`Audio error for ${soundName}:`, e)
        setMusicState(prev => ({
          ...prev,
          isLoading: false,
          error: `Failed to load ${soundName}. Please try again.`
        }))
      })

      // Add timeout for loading
      setTimeout(() => {
        if (musicState.isLoading) {
          setMusicState(prev => ({
            ...prev,
            isLoading: false,
            error: `Loading timeout for ${soundName}. Please try again.`
          }))
        }
      }, 5000)

    } catch (error) {
      console.error(`Failed to create audio for ${soundName}:`, error)
      setMusicState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load ${soundName}. Please try another sound.`
      }))
    }
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setMusicState(prev => ({
      ...prev,
      isPlaying: false,
      currentSound: null,
      isLoading: false,
      error: null
    }))
  }

  const togglePlayPause = () => {
    if (musicState.isPlaying && musicState.currentSound) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setMusicState(prev => ({ ...prev, isPlaying: false }))
    } else if (musicState.currentSound) {
      if (audioRef.current) {
        // Resume audio context if it was suspended
        if (audioRef.current.paused && audioRef.current.readyState >= 2) {
          audioRef.current.play().catch(error => {
            console.error('Error resuming audio:', error)
          })
        }
      }
      setMusicState(prev => ({ ...prev, isPlaying: true }))
    }
  }

  const setVolume = (newVolume: number) => {
    setMusicState(prev => ({ ...prev, volume: newVolume }))
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const clearError = () => {
    setMusicState(prev => ({ ...prev, error: null }))
  }

  return (
    <MusicContext.Provider value={{
      musicState,
      playSound,
      stopSound,
      togglePlayPause,
      setVolume,
      clearError
    }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider')
  }
  return context
}
