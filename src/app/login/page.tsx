'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(data.user.role === 'admin' ? '/admin' : '/student')
    } catch { setError('Something went wrong') } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex items-center justify-center p-4">
      <div className="w-full max-w-md"><div className="text-center mb-8"><Link href="/" className="inline-flex items-center gap-2 text-white"><div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center font-bold text-lg">P</div><span className="text-2xl font-bold">Pro English BD</span></Link></div>
        <div className="bg-white rounded-2xl shadow-xl p-8"><h2 className="text-2xl font-bold text-navy text-center mb-2 bangla-text">লগইন করুন</h2><p className="text-gray-500 text-center text-sm mb-6 bangla-text">আপনার একাউন্টে প্রবেশ করুন</p>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-navy mb-1">ইমেইল</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-navy outline-none" placeholder="your@email.com" required /></div><div><label className="block text-sm font-medium text-navy mb-1">পাসওয়ার্ড</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-navy outline-none" required /></div><button type="submit" disabled={loading} className="w-full py-3 bg-navy text-white rounded-lg font-bold hover:bg-navy-light transition disabled:opacity-50">{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</button></form>
          <p className="text-center text-sm text-gray-500 mt-6 bangla-text">একাউন্ট নেই? <Link href="/register" className="text-navy font-bold hover:underline">রেজিস্ট্রেশন করুন</Link></p>
          <div className="mt-6 pt-6 border-t border-gray-200"><p className="text-xs text-gray-400 text-center mb-3">Demo:</p><div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-gray-50 p-2 rounded"><p className="font-bold text-navy">Admin</p><p>admin@proenglishbd.com</p><p>admin123</p></div><div className="bg-gray-50 p-2 rounded"><p className="font-bold text-navy">Student</p><p>student@proenglishbd.com</p><p>student123</p></div></div></div>
        </div></div></div>)
}
