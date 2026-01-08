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
    const range = searchParams.get('range') as 'week' | 'month' | 'all' || 'all'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    // Fetch study sessions with event and subject data
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate }
      },
      include: {
        event: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Fetch tasks to calculate completed tasks per session
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate }
      }
    })

    // Create CSV data - Include all possible columns
    const csvHeaders = [
      'Start Time',
      'End Time',
      'Duration (minutes)',
      'Event Title',
      'Subject',
      'Tasks Completed',
      'Actions Available',
      'Study Efficiency (%)',
      'Session Type',
      'Break Duration (minutes)',
      'Break Amounts',
      'Focus Score (/10)',
      'Productivity Rating (/5)'
    ]

    const csvRows = studySessions.map(studySession => {
      const duration = studySession.durationMs 
        ? Math.round(studySession.durationMs / (1000 * 60))
        : (studySession.endTime 
          ? Math.round((new Date(studySession.endTime).getTime() - new Date(studySession.startTime).getTime()) / (1000 * 60))
          : 0)

      // Count tasks completed during this session time period
      const completedTasks = tasks.filter(task => 
        task.status === 'completed' && 
        new Date(task.createdAt) >= new Date(studySession.startTime) &&
        new Date(task.createdAt) <= (studySession.endTime ? new Date(studySession.endTime) : new Date())
      ).length

      return [
        new Date(studySession.startTime).toLocaleString(),
        studySession.endTime ? new Date(studySession.endTime).toLocaleString() : 'In Progress',
        duration.toString(),
        studySession.event?.title || 'Study Session',
        studySession.event?.subject?.name || 'No Subject',
        completedTasks.toString(),
        'Delete', // Actions available
        '', // Study efficiency - would need to be calculated from actual data
        'Study', // Session type - default value
        '', // Break duration - would need to be tracked in actual data
        '', // Break amounts - would need to be tracked in actual data
        '', // Focus score - would need to be tracked in actual data
        ''  // Productivity rating - would need to be tracked in actual data
      ]
    })

    // Convert to CSV string
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create response with CSV file
    const response = new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="focusflow-sessions-${range}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

    return response

  } catch (error) {
    console.error("Error exporting CSV:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
