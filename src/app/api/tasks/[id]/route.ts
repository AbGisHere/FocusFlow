import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ✅ GET Task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        subject: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to fetch task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ PATCH Task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, status, priority, dueDate, subjectId } = await request.json()

    const task = await prisma.task.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        subjectId: subjectId || null,
      },
      include: {
        subject: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ DELETE Task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.task.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
