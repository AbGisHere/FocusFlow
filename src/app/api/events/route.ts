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

    const events = await prisma.event.findMany({
      where: { 
        userId: session.user.id,
        ...(subjectId && { subjectId }),
      },
      include: {
        subject: true,
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, startTime, endTime, location, subjectId } = await request.json()

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        subjectId: subjectId && subjectId !== "" ? subjectId : null,
        userId: session.user.id,
      },
      include: {
        subject: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Failed to create event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
