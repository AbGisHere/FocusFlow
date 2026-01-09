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
    const subjectId = searchParams.get('subjectId')
    const range = searchParams.get('range') as '24h' | 'week' | 'month' | 'custom' | 'all' || 'month'
    const customStartDate = searchParams.get('startDate')
    const customEndDate = searchParams.get('endDate')

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 })
    }

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
          console.log('Custom session range API:', { startDate, endDate, customStartDate, customEndDate })
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

    // Fetch study sessions for the specific subject
    // First get events for this subject, then get sessions for those events
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        subjectId: subjectId,
        startTime: { 
          gte: startDate,
          ...(endDate ? { lte: endDate } : {})
        }
      },
      select: {
        id: true,
        title: true,
        subject: {
          select: {
            name: true
          }
        }
      }
    })

    const eventIds = events.map(e => e.id)

    const sessions = await (prisma as any).studySession.findMany({
      where: {
        userId: session.user.id,
        eventId: { in: eventIds },
        startTime: { 
          gte: startDate,
          ...(endDate ? { lte: endDate } : {})
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // For each session, fetch completed tasks during that session time period
    // First fetch all completed tasks for this subject in time range
    const allCompletedTasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        subjectId: subjectId,
        status: 'DONE',
        updatedAt: { 
          gte: startDate,
          ...(endDate ? { lte: endDate } : {})
        }
      },
      select: {
        id: true,
        updatedAt: true
      }
    })

    const sessionsWithTaskCount = sessions.map((sessionRecord: any) => {
      const sessionEnd = sessionRecord.endTime || new Date()
      const event = events.find(e => e.id === sessionRecord.eventId)
      
      // Count tasks completed during this session
      const completedTasks = allCompletedTasks.filter(task => 
        task.updatedAt >= sessionRecord.startTime && task.updatedAt <= sessionEnd
      ).length

      return {
        id: sessionRecord.id,
        startTime: sessionRecord.startTime,
        endTime: sessionRecord.endTime,
        durationMs: sessionRecord.durationMs,
        tasksCompleted: completedTasks,
        eventTitle: event?.title || 'Unknown Event',
        subjectName: event?.subject?.name || 'Unknown'
      }
    })

    return NextResponse.json({
      sessions: sessionsWithTaskCount,
      subjectId,
      subjectName: sessionsWithTaskCount[0]?.subjectName || 'Unknown'
    })
  } catch (error) {
    console.error("Failed to fetch session records:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
