import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const homework = await prisma.homework.findMany({ include: { tasks: { include: { task: true } }, assignments: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ homework })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, description, assignedType, batchId, deadline, passingAverageScore, status, taskIds } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const homework = await prisma.homework.create({ data: { title, description, assignedType: assignedType || 'all', startDate: new Date(), deadline: deadline ? new Date(deadline) : null, passingAverageScore: passingAverageScore ? parseInt(passingAverageScore) : 70, status: status || 'draft', createdBy: user.id } })
    if (taskIds && Array.isArray(taskIds)) await prisma.homeworkTask.createMany({ data: taskIds.map((taskId: string, i: number) => ({ homeworkId: homework.id, taskId, order: i + 1 })) })
    if (assignedType === 'batch' && batchId) await prisma.homeworkAssignment.create({ data: { homeworkId: homework.id, batchId } })
    return NextResponse.json({ homework })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, title, description, status, deadline, passingAverageScore } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.homework.update({ where: { id }, data: { title, description, status, deadline: deadline ? new Date(deadline) : undefined, passingAverageScore } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.homework.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
