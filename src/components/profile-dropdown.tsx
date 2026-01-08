"use client"

import { User, LogOut, Settings } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ProfileDropdownProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = "/"
  }

  const handleSettings = () => {
    setIsOpen(false)
    router.push("/dashboard/settings")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/20 transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden sm:block">
          {user.name || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg py-1 z-50 bg-card/90 backdrop-blur-sm border border-border shadow-lg">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          
          <button 
            onClick={handleSettings}
            className="w-full px-4 py-2 text-sm text-left text-foreground hover:bg-primary/20 flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm text-left text-destructive hover:bg-destructive/10 flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
