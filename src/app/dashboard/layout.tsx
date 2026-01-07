import { Calendar, CheckSquare, User, LogOut } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await authClient.getSession()

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-xl font-bold text-slate-900">FocusFlow</span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Tasks</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {session?.data?.user && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.data.user.image ? (
                      <img
                        src={session.data.user.image}
                        alt={session.data.user.name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {session.data.user.name || session.data.user.email}
                    </span>
                  </div>
                  
                  <form
                    action={async () => {
                      "use server"
                      await authClient.signOut()
                    }}
                  >
                    <button
                      type="submit"
                      className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
