import Link from "next/link"
import { Github, Calendar, CheckCircle, ArrowRight } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { FrostedHeader } from "@/components/frosted-header"

export default async function HomePage() {
  const session = await authClient.getSession()

  return (
    <div className="min-h-screen bg-background">
      <FrostedHeader>
        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">FocusFlow</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                
                {session?.data?.user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </FrostedHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Focus on What
            <span className="text-primary"> Matters</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A modern productivity dashboard that helps you manage tasks, track events, 
            and stay organized with a clean, intuitive interface.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/sign-in"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/AbGisHere/FocusFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors text-lg font-medium flex items-center justify-center space-x-2"
            >
              <Github className="h-5 w-5" />
              <span>View on GitHub</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Task Management</h3>
              <p className="text-muted-foreground">
                Organize your tasks with priorities, due dates, and status tracking.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Calendar Events</h3>
              <p className="text-muted-foreground">
                Schedule and manage your events with an intuitive calendar interface.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Github className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Open Source</h3>
              <p className="text-muted-foreground">
                Built with modern technologies and available for community contribution.
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Version 0.2.0 • Built with Next.js 15, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </main>
    </div>
  )
}
