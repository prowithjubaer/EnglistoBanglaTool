import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const students = await prisma.user.findMany({ where: { role: 'student' }, include: { batch: true, studentStats: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ students: students.map(s => ({ id: s.id, name: s.name, email: s.email, status: s.status, batch: s.batch?.name || null, batchId: s.batchId, lastLogin: s.lastLoginAt, createdAt: s.createdAt, stats: s.studentStats ? { totalCompleted: s.studentStats.totalCompleted, averageScore: Math.round(s.studentStats.averageScore), totalPoints: s.studentStats.totalPoints, currentStreak: s.studentStats.currentStreak } : null })) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, email, password, batchId } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 409 })
    const passwordHash = await hashPassword(password)
    const student = await prisma.user.create({ data: { name, email, passwordHash, role: 'student', batchId: batchId || null } })
    await prisma.studentStats.create({ data: { studentId: student.id } })
    return NextResponse.json({ student: { id: student.id, name, email } })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, name, email, status, batchId, password } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const data: Record<string, unknown> = {}
    if (name) data.name = name; if (email) data.email = email; if (status) data.status = status
    if (batchId !== undefined) data.batchId = batchId || null
    if (password) data.passwordHash = await hashPassword(password)
    await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
