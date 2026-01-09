"use client"

import { useState, useRef, useEffect } from "react"
import { Music, Volume2, VolumeX, Play, Pause } from "lucide-react"

interface SoundOption {
  id: string
  name: string
  icon: string
  url: string
}

const soundOptions: SoundOption[] = [
  {
    id: "rain",
    name: "Rain",
    icon: "🌧️",
    url: "https://ahurnstusomuxdodutyk.supabase.co/storage/v1/object/public/music-assets/rain.mp3"
  },
  {
    id: "ocean",
    name: "Ocean Waves", 
    icon: "🌊",
    url: "https://ahurnstusomuxdodutyk.supabase.co/storage/v1/object/public/music-assets/ocean.mp3"
  },
  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    url: "https://ahurnstusomuxdodutyk.supabase.co/storage/v1/object/public/music-assets/forest.mp3"
  },
  {
    id: "fireplace",
    name: "Fireplace",
    icon: "🔥",
    url: "https://ahurnstusomuxdodutyk.supabase.co/storage/v1/object/public/music-assets/fireplace.mp3"
  },
  {
    id: "whitenoise",
    name: "White Noise",
    icon: "📻",
    url: "https://ahurnstusomuxdodutyk.supabase.co/storage/v1/object/public/music-assets/whitenoise.mp3"
  }
]

export function BackgroundMusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSound, setCurrentSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.3) // Higher for real audio files
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isInitialized = useRef(false)

  // Load state from localStorage on mount
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedState = localStorage.getItem('focusflow-background-music')
        if (savedState) {
          const parsed = JSON.parse(savedState)
          setCurrentSound(parsed.currentSound)
          setIsPlaying(parsed.isPlaying)
          setVolume(parsed.volume || 0.3)
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
          currentSound,
          isPlaying,
          volume
        }
        localStorage.setItem('focusflow-background-music', JSON.stringify(stateToSave))
      } catch (error) {
        console.error('Error saving background music state:', error)
      }
    }
  }, [currentSound, isPlaying, volume])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        // Save current state before cleanup
        const wasPlaying = !audioRef.current.paused
        const currentSrc = audioRef.current.src
        const currentVolume = audioRef.current.volume
        
        audioRef.current.pause()
        audioRef.current = null
        
        // Try to restore audio if it was playing
        if (wasPlaying && currentSrc && currentSound) {
          setTimeout(() => {
            const newAudio = new Audio(currentSrc)
            newAudio.volume = currentVolume
            newAudio.loop = true
            newAudio.play().catch(console.error)
            audioRef.current = newAudio
          }, 100)
        }
      }
    }
  }, [])

  const playSound = async (sound: SoundOption) => {
    setError(null)
    setIsLoading(true)
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    try {
      const audio = new Audio(sound.url)
      
      // Set up audio properties
      audio.preload = 'auto'
      audio.loop = true
      audio.volume = volume
      
      audioRef.current = audio

      // Wait for audio to be ready before playing
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio ready to play: ${sound.name}`)
        setIsLoading(false)
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              setCurrentSound(sound.id)
              setError(null)
              console.log(`Successfully playing: ${sound.name}`)
            })
            .catch(error => {
              console.error(`Error playing ${sound.name}:`, error)
              setIsLoading(false)
              if (error.name === 'NotAllowedError') {
                setError('Browser blocked autoplay. Please click the sound again.')
              } else if (error.name === 'NotSupportedError') {
                setError(`Audio format not supported for ${sound.name}.`)
              } else {
                setError(`Failed to play ${sound.name}. Please try again.`)
              }
              setIsPlaying(false)
              setCurrentSound(null)
            })
        }
      })

      audio.addEventListener('error', (e) => {
        console.error(`Audio error for ${sound.name}:`, e)
        setIsLoading(false)
        setError(`Failed to load ${sound.name}. Please try another sound.`)
        setIsPlaying(false)
        setCurrentSound(null)
      })

      // Add timeout for loading
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setError(`Loading timeout for ${sound.name}. Please try again.`)
        }
      }, 5000) // 5 second timeout

    } catch (error) {
      console.error(`Failed to create audio for ${sound.name}:`, error)
      setIsLoading(false)
      setError(`Failed to load ${sound.name}. Please try another sound.`)
      setIsPlaying(false)
      setCurrentSound(null)
    }
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentSound(null)
    setIsLoading(false)
  }

  const togglePlayPause = () => {
    if (isPlaying && currentSound) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setIsPlaying(false)
    } else if (currentSound) {
      if (audioRef.current) {
        audioRef.current.play()
      }
      setIsPlaying(true)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleSoundSelect = (sound: SoundOption) => {
    if (currentSound === sound.id && !isLoading) {
      togglePlayPause()
    } else {
      playSound(sound)
    }
  }

  return (
    <div className="relative">
      {/* Music Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-primary/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:pointer-events-none relative"
        aria-label="Background music"
      >
        <Music className="h-4 w-4" />
        {isLoading && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        )}
        {isPlaying && !isLoading && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg z-45 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Background Sounds</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center rounded-md p-1 text-sm font-medium transition-colors hover:bg-primary/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-6 w-6"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Sound Options Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {soundOptions.map((sound) => (
            <button
              key={sound.id}
              onClick={() => handleSoundSelect(sound)}
              disabled={isLoading}
              className={`flex flex-col items-center gap-2 h-20 p-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                currentSound === sound.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-primary/20 hover:text-foreground border border-border'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-2xl">{sound.icon}</span>
              <span className="text-xs">{sound.name}</span>
              {currentSound === sound.id && isLoading && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
              {currentSound === sound.id && isPlaying && !isLoading && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <VolumeX className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground w-10">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Current Playing Info */}
        {currentSound && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {soundOptions.find(s => s.id === currentSound)?.icon}
              </span>
              <span className="text-sm text-foreground">
                {soundOptions.find(s => s.id === currentSound)?.name}
              </span>
              {isLoading && (
                <span className="text-xs text-muted-foreground">Loading...</span>
              )}
            </div>
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-primary/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-8 w-8 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full"></div>
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    )}
  </div>
  )
}
