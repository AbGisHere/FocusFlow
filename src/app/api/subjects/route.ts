import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, color } = await request.json()

    if (!name || !color) {
      return new NextResponse('Name and color are required', { status: 400 })
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        color,
        userId: session.user.id,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
