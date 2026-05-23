import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'weak'
    if (type === 'weak') {
      const items = await prisma.submission.findMany({ where: { studentId: user.id, selfScore: { lte: 50 } }, include: { task: { include: { level: true, category: true } } }, orderBy: { submittedAt: 'desc' } })
      return NextResponse.json({ items: items.map(s => ({ id: s.id, taskId: s.taskId, englishText: s.task.englishText, studentAnswer: s.studentAnswer, correctTranslation: s.task.banglaTranslation, selfScore: s.selfScore, level: s.task.level.title, category: s.task.category.name, submittedAt: s.submittedAt })) })
    }
    if (type === 'difficult') {
      const items = await prisma.difficultItem.findMany({ where: { studentId: user.id }, include: { task: { include: { level: true, category: true } } }, orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ items: items.map(i => ({ id: i.id, taskId: i.taskId, englishText: i.task.englishText, correctTranslation: i.task.banglaTranslation, level: i.task.level.title, category: i.task.category.name })) })
    }
    if (type === 'review_later') {
      const items = await prisma.reviewLater.findMany({ where: { studentId: user.id }, include: { task: { include: { level: true, category: true } } }, orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ items: items.map(i => ({ id: i.id, taskId: i.taskId, englishText: i.task.englishText, correctTranslation: i.task.banglaTranslation, level: i.task.level.title, category: i.task.category.name })) })
    }
    const subs = await prisma.submission.findMany({ where: { studentId: user.id, selfScore: { not: null } }, include: { task: { include: { level: true, category: true } } }, orderBy: { submittedAt: 'desc' }, take: 50 })
    return NextResponse.json({ items: subs.map(s => ({ id: s.id, taskId: s.taskId, englishText: s.task.englishText, studentAnswer: s.studentAnswer, correctTranslation: s.task.banglaTranslation, selfScore: s.selfScore, level: s.task.level.title, category: s.task.category.name, submittedAt: s.submittedAt })) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { taskId, type } = await req.json()
    if (!taskId || !type) return NextResponse.json({ error: 'Required' }, { status: 400 })
    if (type === 'difficult') await prisma.difficultItem.upsert({ where: { studentId_taskId: { studentId: user.id, taskId } }, create: { studentId: user.id, taskId }, update: {} })
    else if (type === 'review_later') await prisma.reviewLater.upsert({ where: { studentId_taskId: { studentId: user.id, taskId } }, create: { studentId: user.id, taskId }, update: {} })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
