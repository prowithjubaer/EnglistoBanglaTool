import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    const regSetting = await prisma.settings.findUnique({ where: { key: 'allow_registration' } })
    if (regSetting?.value === 'false') return NextResponse.json({ error: 'Registration disabled' }, { status: 403 })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: 'student', status: 'active' } })
    await prisma.studentStats.create({ data: { studentId: user.id } })
    const token = generateToken({ userId: user.id, email: user.email, role: user.role, name: user.name })
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
    return response
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
