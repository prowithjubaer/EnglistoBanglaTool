import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const [totalStudents, activeStudents, totalTasks, totalLevels, totalCategories, totalHomework, todaySubmissions] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }), prisma.user.count({ where: { role: 'student', status: 'active' } }),
      prisma.task.count(), prisma.level.count(), prisma.category.count(), prisma.homework.count(),
      prisma.submission.count({ where: { submittedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } })
    ])
    const allSubs = await prisma.submission.findMany({ where: { selfScore: { not: null } }, select: { selfScore: true } })
    const averageScore = allSubs.length > 0 ? Math.round(allSubs.reduce((s, sub) => s + (sub.selfScore || 0), 0) / allSubs.length) : 0
    const topStudents = await prisma.studentStats.findMany({ orderBy: { totalPoints: 'desc' }, take: 5, include: { student: { select: { name: true, email: true } } } })
    const recentSubmissions = await prisma.submission.findMany({ orderBy: { submittedAt: 'desc' }, take: 10, include: { student: { select: { name: true } }, task: { select: { englishText: true } } } })
    return NextResponse.json({ totalStudents, activeStudents, totalTasks, totalLevels, totalCategories, totalHomework, todaySubmissions, averageScore, topStudents: topStudents.map(s => ({ name: s.student.name, email: s.student.email, points: s.totalPoints, completed: s.totalCompleted, streak: s.currentStreak })), recentSubmissions: recentSubmissions.map(s => ({ studentName: s.student.name, taskPreview: s.task.englishText.substring(0, 50), score: s.selfScore, date: s.submittedAt })) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
