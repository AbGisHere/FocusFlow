import { NextRequest, NextResponse } from "next/server"
import { authClient } from "@/lib/auth-client"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await authClient.getSession()
    
    if (!session?.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.data.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authClient.getSession()
    
    if (!session?.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, priority, dueDate } = await request.json()

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.data.user.id,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
