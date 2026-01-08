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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause conditionally
    const whereClause: any = {
      userId: session.user.id
    }

    if (subjectId) {
      whereClause.subjectId = subjectId
    }
    if (startDate) {
      whereClause.startTime = { gte: new Date(startDate) }
    }
    if (endDate) {
      whereClause.endTime = { lte: new Date(endDate) }
    }

    // Fetch events for the specified subject and date range
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        subject: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Failed to fetch calendar events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
