import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    if (user.status !== 'active') return NextResponse.json({ error: 'Account deactivated' }, { status: 403 })
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const token = generateToken({ userId: user.id, email: user.email, role: user.role, name: user.name })
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
    return response
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
