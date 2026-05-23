import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const levels = await prisma.level.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ levels })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, description, order, difficulty } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
    const level = await prisma.level.create({ data: { title, description, order: order || 0, difficulty: difficulty || 'easy' } })
    return NextResponse.json({ level })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, title, description, order, difficulty, status } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.level.update({ where: { id }, data: { title, description, order, difficulty, status } })
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
    await prisma.level.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
