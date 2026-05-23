'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
export default function RegisterPage() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    if (password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর'); setLoading(false); return }
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/student')
    } catch { setError('Something went wrong') } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex items-center justify-center p-4">
      <div className="w-full max-w-md"><div className="text-center mb-8"><Link href="/" className="inline-flex items-center gap-2 text-white"><div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center font-bold text-lg">P</div><span className="text-2xl font-bold">Pro English BD</span></Link></div>
        <div className="bg-white rounded-2xl shadow-xl p-8"><h2 className="text-2xl font-bold text-navy text-center mb-6 bangla-text">রেজিস্ট্রেশন করুন</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-navy mb-1">নাম</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg" required /></div><div><label className="block text-sm font-medium text-navy mb-1">ইমেইল</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg" required /></div><div><label className="block text-sm font-medium text-navy mb-1">পাসওয়ার্ড</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg" required /></div><button type="submit" disabled={loading} className="w-full py-3 bg-navy text-white rounded-lg font-bold hover:bg-navy-light transition disabled:opacity-50">{loading ? 'অপেক্ষা করুন...' : 'রেজিস্ট্রেশন করুন'}</button></form>
          <p className="text-center text-sm text-gray-500 mt-6 bangla-text">একাউন্ট আছে? <Link href="/login" className="text-navy font-bold hover:underline">লগইন করুন</Link></p>
        </div></div></div>)
}
