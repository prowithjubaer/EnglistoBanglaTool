import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getPointsForScore, getFeedbackForScore } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { taskId, studentAnswer, homeworkId } = await req.json()
    if (!taskId || !studentAnswer) return NextResponse.json({ error: 'Task ID and answer required' }, { status: 400 })
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { vocabulary: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    const submission = await prisma.submission.create({ data: { studentId: user.id, taskId, homeworkId: homeworkId || null, studentAnswer, points: 0, xp: 0 } })
    return NextResponse.json({ submissionId: submission.id, correctTranslation: task.banglaTranslation, explanation: task.explanation, grammarNote: task.grammarNote, importantPhraseNote: task.importantPhraseNote, vocabulary: task.vocabulary })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { submissionId, selfScore } = await req.json()
    if (!submissionId || !selfScore) return NextResponse.json({ error: 'Required' }, { status: 400 })
    const points = getPointsForScore(selfScore)
    const xp = points + 2
    await prisma.submission.update({ where: { id: submissionId }, data: { selfScore, points, xp } })
    const allSubs = await prisma.submission.findMany({ where: { studentId: user.id, selfScore: { not: null } } })
    const totalCompleted = allSubs.length
    const totalPoints = allSubs.reduce((s, sub) => s + sub.points, 0)
    const totalXp = allSubs.reduce((s, sub) => s + sub.xp, 0)
    const averageScore = allSubs.reduce((s, sub) => s + (sub.selfScore || 0), 0) / totalCompleted
    const stats = await prisma.studentStats.findUnique({ where: { studentId: user.id } })
    let currentStreak = stats?.currentStreak || 0
    let bestStreak = stats?.bestStreak || 0
    const today = new Date().toDateString()
    const lastPractice = stats?.lastPracticeDate
    if (lastPractice) {
      const lastDate = new Date(lastPractice).toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      if (lastDate === today) { /* same day */ } else if (lastDate === yesterday) { currentStreak += 1 } else { currentStreak = 1 }
    } else { currentStreak = 1 }
    if (currentStreak > bestStreak) bestStreak = currentStreak
    await prisma.studentStats.upsert({ where: { studentId: user.id }, create: { studentId: user.id, totalCompleted, averageScore, totalPoints, totalXp, currentStreak, bestStreak, lastPracticeDate: new Date() }, update: { totalCompleted, averageScore, totalPoints, totalXp, currentStreak, bestStreak, lastPracticeDate: new Date() } })
    const feedback = getFeedbackForScore(selfScore)
    return NextResponse.json({ points, xp, totalPoints, totalXp, currentStreak, feedback })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
