import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const allBadges = await prisma.badge.findMany()
    const earned = await prisma.studentBadge.findMany({ where: { studentId: user.id }, select: { badgeId: true, earnedAt: true } })
    const earnedMap = new Map(earned.map(e => [e.badgeId, e.earnedAt]))
    return NextResponse.json({ badges: allBadges.map(b => ({ ...b, earned: earnedMap.has(b.id), earnedAt: earnedMap.get(b.id) || null })) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
