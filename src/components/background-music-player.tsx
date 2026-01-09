"use client"

import { useState } from "react"
import { Music, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { useMusic } from "@/contexts/music-context"

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
  const { musicState, playSound, stopSound, togglePlayPause, setVolume, clearError } = useMusic()

  const handleSoundSelect = (sound: SoundOption) => {
    if (musicState.currentSound === sound.id && !musicState.isLoading) {
      togglePlayPause()
    } else {
      playSound(sound.id, sound.url, sound.name)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
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
        {musicState.isLoading && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        )}
        {musicState.isPlaying && !musicState.isLoading && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg z-[9999] p-4">
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
        {musicState.error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{musicState.error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-xs text-destructive hover:text-destructive/80 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sound Options Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {soundOptions.map((sound) => (
            <button
              key={sound.id}
              onClick={() => handleSoundSelect(sound)}
              disabled={musicState.isLoading}
              className={`flex flex-col items-center gap-2 h-20 p-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                musicState.currentSound === sound.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-primary/20 hover:text-foreground border border-border'
              } ${musicState.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-2xl">{sound.icon}</span>
              <span className="text-xs">{sound.name}</span>
              {musicState.currentSound === sound.id && musicState.isLoading && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
              {musicState.currentSound === sound.id && musicState.isPlaying && !musicState.isLoading && (
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
            value={musicState.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground w-10">
            {Math.round(musicState.volume * 100)}%
          </span>
        </div>

        {/* Current Playing Info */}
        {musicState.currentSound && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {soundOptions.find(s => s.id === musicState.currentSound)?.icon}
              </span>
              <span className="text-sm text-foreground">
                {soundOptions.find(s => s.id === musicState.currentSound)?.name}
              </span>
              {musicState.isLoading && (
                <span className="text-xs text-muted-foreground">Loading...</span>
              )}
            </div>
            <button
              onClick={togglePlayPause}
              disabled={musicState.isLoading}
              className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-primary/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-8 w-8 disabled:opacity-50"
            >
              {musicState.isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full"></div>
              ) : musicState.isPlaying ? (
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
