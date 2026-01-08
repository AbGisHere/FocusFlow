import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme-context"
import { TimerProvider } from "@/contexts/timer-context"
import { MinimizedTimer } from "@/components/minimized-timer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FocusFlow - Productivity Dashboard",
  description: "A modern productivity dashboard for managing tasks and events",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <TimerProvider>
            {children}
            <MinimizedTimer />
          </TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
