import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Verify the session belongs to the current user
    const existingSession = await (prisma as any).studySession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Delete the session
    await (prisma as any).studySession.delete({
      where: {
        id: sessionId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
