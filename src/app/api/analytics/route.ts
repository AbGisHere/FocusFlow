import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') as '24h' | 'week' | 'month' | 'custom' | 'all' || 'month'
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')

    console.log('Analytics API received params:', { range, customStartDate, customEndDate })

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let endDate: Date | null = null
    
    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate)
          // For custom range, set end date to end of day to be inclusive
          endDate = new Date(customEndDate)
          endDate.setHours(23, 59, 59, 999)
          console.log('Custom range API:', { startDate, endDate, customStartDate, customEndDate })
        } else {
          // Fallback to month if custom dates are not provided
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        break
      case 'all':
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    // Fetch subject statistics
    const eventsBySubject = await prisma.event.groupBy({
      by: ['subjectId'],
      where: {
        userId: session.user.id,
        startTime: { 
          gte: startDate,
          ...(endDate ? { lte: endDate } : {})
        },
        subjectId: { not: null }
      },
      _count: {
        id: true
      }
    })

    // Get subject details and calculate actual study hours from study sessions
    const subjects = await prisma.subject.findMany({
      where: {
        userId: session.user.id,
        events: {
          some: {
            startTime: { 
              gte: startDate,
              ...(endDate ? { lte: endDate } : {})
            }
          }
        }
      },
      include: {
        events: {
          where: {
            startTime: { 
              gte: startDate,
              ...(endDate ? { lte: endDate } : {})
            }
          },
          include: {
            studySessions: true
          }
        }
      }
    })

    const subjectStatsWithDetails = subjects.map((subject: any) => {
      const events = subject.events || []
      // Calculate actual study hours from study sessions
      const totalHours = events.reduce((sum: number, event: any) => {
        const sessionHours = event.studySessions?.reduce((sessionSum: number, session: any) => {
          return sessionSum + ((session.durationMs || 0) / (1000 * 60 * 60))
        }, 0) || 0
        return sum + sessionHours
      }, 0)
      
      const sessionCount = events.reduce((count: number, event: any) => count + (event.studySessions?.length || 0), 0)
      const averageSessionLength = sessionCount > 0 ? totalHours / sessionCount : 0
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color,
        totalHours,
        sessionCount,
        averageSessionLength
      }
    })

    // Fetch task statistics
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { 
          gte: startDate,
          ...(endDate ? { lte: endDate } : {})
        }
      }
    })

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'DONE').length,
      pending: tasks.filter(task => task.status === 'TODO').length,
      inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
      overdue: tasks.filter(task => 
        task.status !== 'DONE' && 
        task.dueDate && 
        new Date(task.dueDate) < now
      ).length
    }

    // Generate weekly progress data
    const weeklyProgress = []
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const weekEvents = await prisma.event.findMany({
        where: {
          userId: session.user.id,
          startTime: { gte: weekStart, lt: weekEnd },
          subjectId: { not: null }
        }
      })

      const weekTasks = await prisma.task.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: weekStart, lt: weekEnd },
          status: 'DONE'
        }
      })

      const weekHours = weekEvents.reduce((sum, event) => {
        const duration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime()
        return sum + (duration / (1000 * 60 * 60))
      }, 0)

      weeklyProgress.push({
        week: `Week ${7 - i}`,
        hours: weekHours,
        tasksCompleted: weekTasks.length
      })
    }

    // Generate monthly trend data
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthEvents = await prisma.event.findMany({
        where: {
          userId: session.user.id,
          startTime: { gte: monthStart, lt: monthEnd },
          subjectId: { not: null }
        }
      })

      const monthHours = monthEvents.reduce((sum, event) => {
        const duration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime()
        return sum + (duration / (1000 * 60 * 60))
      }, 0)

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        hours: monthHours
      })
    }

    console.log('Analytics API results:', {
      subjectStatsCount: subjectStatsWithDetails.length,
      totalHours: subjectStatsWithDetails.reduce((sum, subject) => sum + subject.totalHours, 0),
      taskStats
    })

    return NextResponse.json({
      subjectStats: subjectStatsWithDetails,
      taskStats,
      weeklyProgress,
      monthlyTrend
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
