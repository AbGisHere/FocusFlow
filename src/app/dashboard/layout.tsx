"use client"

import { Calendar, CheckSquare } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { FrostedHeader } from "@/components/frosted-header"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSession() {
      try {
        const sessionData = await authClient.getSession()
        setSession(sessionData)
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }
    
    getSession()
  }, [])

  if (loading) {
    return <div>Loading...</div>
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
                    <Calendar className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/tasks"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Tasks</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                
                {session?.data?.user && (
                  <ProfileDropdown user={session.data.user} />
                )}
              </div>
            </div>
          </div>
        </nav>
      </FrostedHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {children}
      </main>
    </div>
  )
}
