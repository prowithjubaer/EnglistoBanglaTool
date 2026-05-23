import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const homework = await prisma.homework.findMany({
      where: { status: 'published', OR: [{ assignedType: 'all' }, { assignments: { some: { studentId: user.id } } }, { assignments: { some: { batchId: user.batchId || undefined } } }] },
      include: { tasks: true }, orderBy: { createdAt: 'desc' }
    })
    const result = await Promise.all(homework.map(async (hw) => {
      const completedCount = await prisma.submission.count({ where: { studentId: user.id, homeworkId: hw.id, selfScore: { not: null } } })
      const subs = await prisma.submission.findMany({ where: { studentId: user.id, homeworkId: hw.id, selfScore: { not: null } }, select: { selfScore: true } })
      const avgScore = subs.length > 0 ? subs.reduce((s, sub) => s + (sub.selfScore || 0), 0) / subs.length : 0
      return { id: hw.id, title: hw.title, description: hw.description, deadline: hw.deadline, totalTasks: hw.tasks.length, completedTasks: completedCount, averageScore: Math.round(avgScore), isComplete: completedCount >= hw.tasks.length, isPastDeadline: hw.deadline ? new Date(hw.deadline) < new Date() : false }
    }))
    return NextResponse.json({ homework: result })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
