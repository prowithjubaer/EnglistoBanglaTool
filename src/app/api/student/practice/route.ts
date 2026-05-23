import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const levelId = searchParams.get('levelId')
    const categoryId = searchParams.get('categoryId')
    const homeworkId = searchParams.get('homeworkId')
    const taskId = searchParams.get('taskId')

    if (taskId) {
      const task = await prisma.task.findUnique({ where: { id: taskId }, include: { vocabulary: true, level: true, category: true } })
      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      const existing = await prisma.submission.findFirst({ where: { studentId: user.id, taskId: task.id, selfScore: { not: null } } })
      return NextResponse.json({ task: { id: task.id, englishText: task.englishText, levelTitle: task.level.title, categoryName: task.category.name, difficulty: task.difficulty, estimatedTime: task.estimatedTime, vocabulary: task.vocabulary.map(v => ({ id: v.id, wordOrPhrase: v.wordOrPhrase, banglaMeaning: v.banglaMeaning, example: v.example, note: v.note })) }, alreadyCompleted: !!existing })
    }

    if (homeworkId) {
      const hw = await prisma.homework.findUnique({ where: { id: homeworkId }, include: { tasks: { include: { task: { include: { vocabulary: true, level: true, category: true } } }, orderBy: { order: 'asc' } } } })
      if (!hw) return NextResponse.json({ error: 'Homework not found' }, { status: 404 })
      const submissions = await prisma.submission.findMany({ where: { studentId: user.id, homeworkId, selfScore: { not: null } } })
      const completedTaskIds = new Set(submissions.map(s => s.taskId))
      const nextTask = hw.tasks.find(t => !completedTaskIds.has(t.taskId))
      if (!nextTask) return NextResponse.json({ completed: true, message: 'All tasks completed!' })
      const task = nextTask.task
      return NextResponse.json({ task: { id: task.id, englishText: task.englishText, levelTitle: task.level.title, categoryName: task.category.name, difficulty: task.difficulty, estimatedTime: task.estimatedTime, vocabulary: task.vocabulary.map(v => ({ id: v.id, wordOrPhrase: v.wordOrPhrase, banglaMeaning: v.banglaMeaning, example: v.example, note: v.note })) }, homeworkId, currentIndex: hw.tasks.indexOf(nextTask) + 1, totalTasks: hw.tasks.length, completedCount: completedTaskIds.size })
    }

    const where: Record<string, unknown> = { status: 'published' }
    if (levelId) where.levelId = levelId
    if (categoryId) where.categoryId = categoryId
    const completedTaskIds = (await prisma.submission.findMany({ where: { studentId: user.id, selfScore: { not: null } }, select: { taskId: true } })).map(s => s.taskId)
    const task = await prisma.task.findFirst({ where: { ...where, id: { notIn: completedTaskIds } }, include: { vocabulary: true, level: true, category: true }, orderBy: { createdAt: 'asc' } })
    if (!task) return NextResponse.json({ completed: true, message: 'No more tasks!' })
    return NextResponse.json({ task: { id: task.id, englishText: task.englishText, levelTitle: task.level.title, categoryName: task.category.name, difficulty: task.difficulty, estimatedTime: task.estimatedTime, vocabulary: task.vocabulary.map(v => ({ id: v.id, wordOrPhrase: v.wordOrPhrase, banglaMeaning: v.banglaMeaning, example: v.example, note: v.note })) } })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
