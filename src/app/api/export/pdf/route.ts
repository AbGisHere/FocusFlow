import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import jsPDF from 'jspdf'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') as 'week' | 'month' | 'all' || 'all'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    // Fetch study sessions with event and subject data
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
        startTime: { gte: startDate }
      },
      include: {
        event: {
          include: {
            subject: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Fetch tasks to calculate completed tasks per session
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate }
      }
    })

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    // Add title
    pdf.setFontSize(16)
    pdf.text('FocusFlow Session Records', 20, 15)
    
    // Add date range
    pdf.setFontSize(10)
    pdf.text(`Date Range: ${range === 'all' ? 'All Time' : range === 'week' ? 'Last 7 Days' : 'Last 30 Days'}`, 20, 25)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 32)
    
    // Add summary statistics
    const totalSessions = studySessions.length
    const totalMinutes = studySessions.reduce((sum, session) => {
      const duration = session.durationMs 
        ? Math.round(session.durationMs / (1000 * 60))
        : (session.endTime 
          ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
          : 0)
      return sum + duration
    }, 0)
    const totalHours = (totalMinutes / 60).toFixed(1)
    
    pdf.setFontSize(12)
    pdf.text('Summary', 20, 42)
    pdf.setFontSize(9)
    pdf.text(`Total Sessions: ${totalSessions}`, 20, 49)
    pdf.text(`Total Study Time: ${totalHours} hours`, 20, 55)
    
    // Add session details table
    let yPosition = 65
    pdf.setFontSize(11)
    pdf.text('Session Details', 20, yPosition)
    yPosition += 8
    
    // Table headers - More compact layout for landscape
    pdf.setFontSize(8)
    const headers = ['Date', 'Time', 'Duration', 'Event', 'Subject', 'Tasks', 'Actions', 'Efficiency', 'Type', 'Break', 'Amounts', 'Focus', 'Rating']
    const columnWidths = [18, 18, 15, 20, 20, 10, 10, 12, 10, 10, 10, 10, 10]
    let xPos = 20
    
    headers.forEach((header, index) => {
      pdf.text(header, xPos, yPosition)
      xPos += columnWidths[index]
    })
    
    yPosition += 5
    
    // Table rows
    pdf.setFontSize(7)
    studySessions.slice(0, 30).forEach((studySession) => { // Increased to 30 for landscape
      if (yPosition > 190) { // Start new page if needed (landscape height is ~210mm)
        pdf.addPage()
        yPosition = 20
        
        // Re-add headers on new page
        pdf.setFontSize(8)
        xPos = 20
        headers.forEach((header, index) => {
          pdf.text(header, xPos, yPosition)
          xPos += columnWidths[index]
        })
        yPosition += 5
        pdf.setFontSize(7)
      }
      
      const duration = studySession.durationMs 
        ? Math.round(studySession.durationMs / (1000 * 60))
        : (studySession.endTime 
          ? Math.round((new Date(studySession.endTime).getTime() - new Date(studySession.startTime).getTime()) / (1000 * 60))
          : 0)
      
      const completedTasks = tasks.filter(task => 
        task.status === 'completed' && 
        new Date(task.createdAt) >= new Date(studySession.startTime) &&
        new Date(task.createdAt) <= (studySession.endTime ? new Date(studySession.endTime) : new Date())
      ).length
      
      const date = new Date(studySession.startTime).toLocaleDateString()
      const time = new Date(studySession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const durationText = `${duration}m`
      const event = (studySession.event?.title || 'Study').substring(0, 8)
      const subject = (studySession.event?.subject?.name || 'No Subject').substring(0, 8)
      const tasksText = completedTasks.toString()
      const actionsText = 'Del'
      const efficiencyText = '' // Would need actual data
      const typeText = 'Study'
      const breakText = '' // Would need actual data
      const amountsText = '' // Would need actual data
      const focusText = '' // Would need actual data
      const ratingText = '' // Would need actual data
      
      xPos = 20
      const rowData = [date, time, durationText, event, subject, tasksText, actionsText, efficiencyText, typeText, breakText, amountsText, focusText, ratingText]
      
      rowData.forEach((data, index) => {
        pdf.text(data, xPos, yPosition)
        xPos += columnWidths[index]
      })
      
      yPosition += 4
    })
    
    // Add note if there are more sessions
    if (studySessions.length > 30) {
      pdf.setFontSize(9)
      pdf.text(`... and ${studySessions.length - 30} more sessions`, 20, yPosition + 8)
    }

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Create response with PDF file
    const response = new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="focusflow-sessions-${range}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

    return response

  } catch (error) {
    console.error("Error exporting PDF:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
