import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, priority, dueDate, status } = await request.json()

    const data: Record<string, unknown> = {}
    if (typeof title === "string") data.title = title
    if (typeof description === "string" || description === null) data.description = description
    if (typeof priority === "string") data.priority = priority
    if (typeof status === "string") data.status = status
    if (typeof dueDate === "string") {
      data.dueDate = dueDate ? new Date(dueDate) : null
    }

    const task = await prisma.task.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.task.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
