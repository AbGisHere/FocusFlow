"use client"

import { Calendar, CheckSquare, BookOpen, Calendar as CalendarIcon, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { FrostedHeader } from "@/components/frosted-header"
import { BackgroundMusicPlayer } from "@/components/background-music-player"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getSession() {
      try {
        const sessionData = await authClient.getSession()
        setSession(sessionData)
        
        // If no session, redirect to home
        if (!sessionData?.data?.user) {
          router.push('/')
        }
      } catch (error) {
        console.error("Error getting session:", error)
        // On error, redirect to home
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    getSession()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  // If no session, don't render anything (redirect will happen)
  if (!session?.data?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <FrostedHeader>
        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">F</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">FocusFlow</span>
                </Link>
                
                <div className="hidden md:flex space-x-6">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/tasks"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Tasks</span>
                  </Link>
                  <Link
                    href="/dashboard/calendar"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Calendar</span>
                  </Link>
                  <Link
                    href="/dashboard/subjects"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Subjects</span>
                  </Link>
                  <Link
                    href="/dashboard/analytics"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <BackgroundMusicPlayer />
                <ThemeToggle />
                
                {session?.data?.user && (
                  <ProfileDropdown user={session.data.user} />
                )}
              </div>
            </div>
          </div>
        </nav>
      </FrostedHeader>

      <main className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8 overflow-visible">
        {children}
      </main>
    </div>
  )
}
