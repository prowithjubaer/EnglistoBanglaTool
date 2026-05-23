import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const where: Record<string, unknown> = { selfScore: { not: null } }
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({ where, include: { student: { select: { name: true, email: true } }, task: { select: { englishText: true, banglaTranslation: true, level: true, category: true } }, homework: { select: { title: true } } }, orderBy: { submittedAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.submission.count({ where })
    ])
    return NextResponse.json({ submissions, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
