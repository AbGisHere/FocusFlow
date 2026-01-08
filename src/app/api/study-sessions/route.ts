import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, durationMs } = await request.json()

    if (!eventId || durationMs === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create or update study session
    const studySession = await prisma.studySession.create({
      data: {
        eventId,
        userId: session.user.id,
        startTime: new Date(),
        durationMs,
        endTime: new Date()
      }
    })

    return NextResponse.json(studySession)
  } catch (error) {
    console.error("Failed to save study session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
