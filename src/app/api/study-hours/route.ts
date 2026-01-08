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

    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      subjectId,
      isRecurring,
      recurringDays,
      recurringEndDate
    } = await request.json()

    console.log("Received data:", { title, startTime, endTime, isRecurring, recurringDays, subjectId })

    if (isRecurring && (!recurringDays || recurringDays.length === 0)) {
      return NextResponse.json({ error: "Recurring days are required for recurring events" }, { status: 400 })
    }

    const events = []

    if (isRecurring) {
      const startDateTime = new Date(startTime)
      const endDateTime = new Date(endTime)
      const endDate = recurringEndDate ? new Date(recurringEndDate) : null
      
      const dayMap: { [key: string]: number } = {
        'SUNDAY': 0,
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6
      }

      const recurringDayNumbers = recurringDays.map((day: string) => dayMap[day.toUpperCase()])
      
      let currentDate = new Date(startDateTime)
      
      while (!endDate || currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay()
        
        if (recurringDayNumbers.includes(dayOfWeek)) {
          const eventStart = new Date(currentDate)
          eventStart.setHours(startDateTime.getHours(), startDateTime.getMinutes(), 0, 0)
          
          const eventEnd = new Date(currentDate)
          eventEnd.setHours(endDateTime.getHours(), endDateTime.getMinutes(), 0, 0)
          
          const event = await prisma.event.create({
            data: {
              title,
              description,
              startTime: eventStart,
              endTime: eventEnd,
              isRecurring: true,
              recurringDays: JSON.stringify(recurringDays),
              recurringEndDate: endDate,
              subjectId: subjectId && subjectId !== "" ? subjectId : null,
              userId: session.user.id,
            },
          })
          
          events.push(event)
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else {
      const event = await prisma.event.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isRecurring: false,
          subjectId: subjectId && subjectId !== "" ? subjectId : null,
          userId: session.user.id,
        },
      })
      
      events.push(event)
    }

    return NextResponse.json(events)
  } catch (error) {
    console.error("Failed to create study hours:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 })
  }
}
