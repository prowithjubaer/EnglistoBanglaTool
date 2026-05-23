import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const saved = await prisma.savedVocabulary.findMany({ where: { studentId: user.id }, include: { vocabulary: { include: { task: { select: { level: true, category: true } } } } }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ vocabulary: saved.map(s => ({ id: s.id, vocabularyId: s.vocabularyId, wordOrPhrase: s.vocabulary.wordOrPhrase, banglaMeaning: s.vocabulary.banglaMeaning, example: s.vocabulary.example, note: s.vocabulary.note, level: s.vocabulary.task.level.title, category: s.vocabulary.task.category.name, savedAt: s.createdAt })) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { vocabularyId } = await req.json()
    if (!vocabularyId) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.savedVocabulary.upsert({ where: { studentId_vocabularyId: { studentId: user.id, vocabularyId } }, create: { studentId: user.id, vocabularyId }, update: {} })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'student') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.savedVocabulary.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
