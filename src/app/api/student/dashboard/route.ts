import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const stats = await prisma.studentStats.findUnique({ where: { studentId: user.id } })
    const homework = await prisma.homework.findMany({
      where: { status: 'published', OR: [{ assignedType: 'all' }, { assignments: { some: { studentId: user.id } } }, { assignments: { some: { batchId: user.batchId || undefined } } }] },
      include: { tasks: { include: { task: true } } }, orderBy: { createdAt: 'desc' }, take: 10
    })
    const homeworkWithProgress = await Promise.all(homework.map(async (hw) => {
      const completedCount = await prisma.submission.count({ where: { studentId: user.id, homeworkId: hw.id, selfScore: { not: null } } })
      return { ...hw, totalTasks: hw.tasks.length, completedTasks: completedCount, isComplete: completedCount >= hw.tasks.length }
    }))
    const badges = await prisma.studentBadge.findMany({ where: { studentId: user.id }, include: { badge: true }, orderBy: { earnedAt: 'desc' }, take: 5 })
    const savedVocabCount = await prisma.savedVocabulary.count({ where: { studentId: user.id } })
    const weakItemsCount = await prisma.submission.count({ where: { studentId: user.id, selfScore: { lte: 50 } } })
    return NextResponse.json({
      stats: stats || { totalCompleted: 0, averageScore: 0, totalPoints: 0, totalXp: 0, currentStreak: 0, bestStreak: 0 },
      homework: homeworkWithProgress, badges: badges.map(b => b.badge), savedVocabCount, weakItemsCount
    })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
