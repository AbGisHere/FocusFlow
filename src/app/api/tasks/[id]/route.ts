import { NextRequest, NextResponse } from "next/server"
import { authClient } from "@/lib/auth-client"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await authClient.getSession()
    
    if (!session?.data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()

    const task = await prisma.task.update({
      where: {
        id: params.id,
        userId: session.data.user.id,
      },
      data: {
        status,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
