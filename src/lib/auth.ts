import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'pro-english-bd-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, status: true, batchId: true }
  })
  if (!user || user.status !== 'active') return null
  return user
}

export async function requireAuth(role?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  if (role && user.role !== role) throw new Error('Forbidden')
  return user
}

export function getPointsForScore(score: number): number {
  const map: Record<number, number> = { 20: 2, 40: 4, 50: 5, 70: 7, 85: 9, 90: 10, 100: 12 }
  return map[score] || 0
}

export function getFeedbackForScore(score: number): string {
  const map: Record<number, string> = {
    20: 'চিন্তা করবেন না, আবার চেষ্টা করুন। শেখার শুরু এখান থেকেই।',
    40: 'ভালো চেষ্টা করেছেন। Correct translation দেখে sentence structure বুঝে নিন।',
    50: 'ভালো চেষ্টা! এবার correct translation দেখে structure আর vocabulary মিলিয়ে দেখুন।',
    70: 'ভালো হচ্ছে! আরেকটু practice করলে আরও strong হবে।',
    85: 'Great! আপনি meaning বেশ ভালো ধরতে পারছেন।',
    90: 'Excellent! আপনি sentence meaning খুব ভালো বুঝেছেন।',
    100: 'Perfect! অসাধারণ কাজ করেছেন।'
  }
  return map[score] || ''
}
