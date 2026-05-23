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
    const levelId = searchParams.get('levelId')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const where: Record<string, unknown> = {}
    if (levelId) where.levelId = levelId; if (categoryId) where.categoryId = categoryId
    if (search) where.englishText = { contains: search }
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({ where, include: { level: true, category: true, vocabulary: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.task.count({ where })
    ])
    return NextResponse.json({ tasks, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { englishText, banglaTranslation, levelId, categoryId, difficulty, estimatedTime, explanation, grammarNote, importantPhraseNote, status, vocabulary } = body
    if (!englishText || !banglaTranslation || !levelId || !categoryId) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    const task = await prisma.task.create({ data: { englishText, banglaTranslation, levelId, categoryId, difficulty: difficulty || 'easy', estimatedTime: estimatedTime ? parseInt(estimatedTime) : null, explanation, grammarNote, importantPhraseNote, status: status || 'published', createdBy: user.id } })
    if (vocabulary && Array.isArray(vocabulary) && vocabulary.length > 0) {
      await prisma.vocabulary.createMany({ data: vocabulary.filter((v: any) => v.wordOrPhrase).map((v: any) => ({ taskId: task.id, wordOrPhrase: v.wordOrPhrase, banglaMeaning: v.banglaMeaning || '', example: v.example || null, note: v.note || null })) })
    }
    return NextResponse.json({ task })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const { id, englishText, banglaTranslation, levelId, categoryId, difficulty, estimatedTime, explanation, grammarNote, importantPhraseNote, status, vocabulary } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.task.update({ where: { id }, data: { englishText, banglaTranslation, levelId, categoryId, difficulty, estimatedTime: estimatedTime ? parseInt(estimatedTime) : null, explanation, grammarNote, importantPhraseNote, status } })
    if (vocabulary && Array.isArray(vocabulary)) {
      await prisma.vocabulary.deleteMany({ where: { taskId: id } })
      if (vocabulary.length > 0) await prisma.vocabulary.createMany({ data: vocabulary.filter((v: any) => v.wordOrPhrase).map((v: any) => ({ taskId: id, wordOrPhrase: v.wordOrPhrase, banglaMeaning: v.banglaMeaning || '', example: v.example || null, note: v.note || null })) })
    }
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
    await prisma.vocabulary.deleteMany({ where: { taskId: id } })
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
