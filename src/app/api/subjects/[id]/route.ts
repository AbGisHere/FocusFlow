import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

declare global {
  namespace PrismaClient {
    interface PrismaClientOptions {
      datasources?: {
        db?: {
          url: string
        }
      }
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Error fetching subject:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, color } = await request.json()

    const subject = await prisma.subject.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Error updating subject:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, check if the subject exists and belongs to the user
    const subject = await prisma.subject.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse('Subject not found', { status: 404 })
    }

    // Delete the subject
    await prisma.subject.delete({
      where: {
        id: id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
