import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student stats
    const stats = await prisma.studentStats.findUnique({ where: { studentId: user.id } })

    // Get all submissions with task details
    const submissions = await prisma.submission.findMany({
      where: { studentId: user.id },
      include: { task: { include: { level: true, category: true } } },
      orderBy: { submittedAt: 'desc' }
    })

    // Calculate level-wise progress
    const levels = await prisma.level.findMany({
      where: { status: 'active' },
      orderBy: { order: 'asc' },
      include: { tasks: { where: { status: 'published' } } }
    })

    const levelProgress = levels.map(level => {
      const totalTasks = level.tasks.length
      const completedTasks = submissions.filter(s => s.task.levelId === level.id).length
      const uniqueCompleted = new Set(submissions.filter(s => s.task.levelId === level.id).map(s => s.taskId)).size
      const levelSubmissions = submissions.filter(s => s.task.levelId === level.id && s.selfScore !== null)
      const avgScore = levelSubmissions.length > 0
        ? Math.round(levelSubmissions.reduce((sum, s) => sum + (s.selfScore || 0), 0) / levelSubmissions.length)
        : 0
      return {
        id: level.id,
        title: level.title,
        difficulty: level.difficulty,
        totalTasks,
        completedTasks: uniqueCompleted,
        percentage: totalTasks > 0 ? Math.round((uniqueCompleted / totalTasks) * 100) : 0,
        avgScore
      }
    })

    // Calculate category-wise progress
    const categories = await prisma.category.findMany({
      where: { status: 'active' },
      include: { tasks: { where: { status: 'published' } } }
    })

    const categoryProgress = categories.map(cat => {
      const totalTasks = cat.tasks.length
      const uniqueCompleted = new Set(submissions.filter(s => s.task.categoryId === cat.id).map(s => s.taskId)).size
      const catSubmissions = submissions.filter(s => s.task.categoryId === cat.id && s.selfScore !== null)
      const avgScore = catSubmissions.length > 0
        ? Math.round(catSubmissions.reduce((sum, s) => sum + (s.selfScore || 0), 0) / catSubmissions.length)
        : 0
      return {
        id: cat.id,
        name: cat.name,
        totalTasks,
        completedTasks: uniqueCompleted,
        percentage: totalTasks > 0 ? Math.round((uniqueCompleted / totalTasks) * 100) : 0,
        avgScore
      }
    })

    // Homework progress
    const homeworkSubmissions = await prisma.submission.findMany({
      where: { studentId: user.id, homeworkId: { not: null } },
      include: { homework: true }
    })

    const homeworkIds = [...new Set(homeworkSubmissions.map(s => s.homeworkId).filter(Boolean))]
    const homeworkProgress = await Promise.all(homeworkIds.map(async (hwId) => {
      const hw = await prisma.homework.findUnique({
        where: { id: hwId! },
        include: { tasks: true }
      })
      if (!hw) return null
      const hwSubs = homeworkSubmissions.filter(s => s.homeworkId === hwId && s.selfScore !== null)
      const avgScore = hwSubs.length > 0
        ? Math.round(hwSubs.reduce((sum, s) => sum + (s.selfScore || 0), 0) / hwSubs.length)
        : 0
      return {
        id: hw.id,
        title: hw.title,
        totalTasks: hw.tasks.length,
        completedTasks: hwSubs.length,
        percentage: hw.tasks.length > 0 ? Math.round((hwSubs.length / hw.tasks.length) * 100) : 0,
        avgScore,
        passed: avgScore >= hw.passingAverageScore
      }
    }))

    // Recent activity (last 10 submissions)
    const recentActivity = submissions.slice(0, 10).map(s => ({
      id: s.id,
      taskTitle: s.task.englishText,
      levelTitle: s.task.level.title,
      categoryName: s.task.category.name,
      selfScore: s.selfScore,
      points: s.points,
      xp: s.xp,
      submittedAt: s.submittedAt
    }))

    // Badges earned
    const badges = await prisma.studentBadge.findMany({
      where: { studentId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    })

    // Saved vocabulary count
    const savedVocabCount = await prisma.savedVocabulary.count({ where: { studentId: user.id } })

    // Weak areas (tasks with score <= 50)
    const weakItems = submissions
      .filter(s => s.selfScore !== null && s.selfScore <= 50)
      .slice(0, 5)
      .map(s => ({
        taskId: s.taskId,
        englishText: s.task.englishText,
        selfScore: s.selfScore,
        levelTitle: s.task.level.title
      }))

    return NextResponse.json({
      stats: stats || { totalCompleted: 0, averageScore: 0, totalPoints: 0, totalXp: 0, currentStreak: 0, bestStreak: 0 },
      levelProgress,
      categoryProgress,
      homeworkProgress: homeworkProgress.filter(Boolean),
      recentActivity,
      badges: badges.map(b => ({ ...b.badge, earnedAt: b.earnedAt })),
      savedVocabCount,
      weakItems,
      totalSubmissions: submissions.length
    })
  } catch (error) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
