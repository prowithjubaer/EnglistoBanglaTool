import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'File required' }, { status: 400 })
    const bytes = await file.arrayBuffer()
    const workbook = XLSX.read(bytes, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet) as Record<string, string>[]
    const levels = await prisma.level.findMany()
    const categories = await prisma.category.findMany()
    const levelMap = new Map(levels.map(l => [l.title.toLowerCase(), l.id]))
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))
    let imported = 0; const errors: string[] = []
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const englishText = row['English Text'] || row['english_text']
      const banglaTranslation = row['Correct Bangla Translation'] || row['bangla_translation']
      if (!englishText || !banglaTranslation) { errors.push(`Row ${i + 2}: Missing text`); continue }
      const levelId = levelMap.get((row['Level'] || '').toLowerCase()) || levels[0]?.id
      const categoryId = categoryMap.get((row['Category'] || '').toLowerCase()) || categories[0]?.id
      if (!levelId || !categoryId) { errors.push(`Row ${i + 2}: Invalid level/category`); continue }
      const existing = await prisma.task.findFirst({ where: { englishText } })
      if (existing) { errors.push(`Row ${i + 2}: Duplicate`); continue }
      const task = await prisma.task.create({ data: { englishText, banglaTranslation, levelId, categoryId, difficulty: row['Difficulty'] || 'easy', explanation: row['Explanation'] || null, grammarNote: row['Grammar Note'] || null, importantPhraseNote: row['Important Phrase Note'] || null, estimatedTime: row['Estimated Time'] ? parseInt(row['Estimated Time']) : null, status: row['Status'] || 'published', createdBy: user.id } })
      const vocabWords = row['Vocabulary Words'] || ''
      const vocabMeanings = row['Vocabulary Bangla Meanings'] || ''
      if (vocabWords) { const words = vocabWords.split(',').map(w => w.trim()); const meanings = vocabMeanings.split(',').map(m => m.trim()); for (let j = 0; j < words.length; j++) { if (words[j]) await prisma.vocabulary.create({ data: { taskId: task.id, wordOrPhrase: words[j], banglaMeaning: meanings[j] || '' } }) } }
      imported++
    }
    return NextResponse.json({ imported, errors, total: data.length })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const template = [{ 'English Text': 'I eat rice.', 'Correct Bangla Translation': 'আমি ভাত খাই।', 'Level': 'Level 1: Very Easy Sentences', 'Category': 'Daily Life English', 'Difficulty': 'easy', 'Vocabulary Words': 'eat,rice', 'Vocabulary Bangla Meanings': 'খাওয়া,ভাত', 'Explanation': '', 'Grammar Note': '', 'Important Phrase Note': '', 'Estimated Time': '2', 'Status': 'published' }]
    const ws = XLSX.utils.json_to_sheet(template); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new NextResponse(buf, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename=template.xlsx' } })
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
