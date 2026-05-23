'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{name:string}|null>(null)
  const [menu, setMenu] = useState(false)
  const router = useRouter(); const pathname = usePathname()
  useEffect(() => { fetch('/api/auth/me').then(r=>r.json()).then(d=>{ if(d.user?.role==='student') setUser(d.user); else router.push('/login') }).catch(()=>router.push('/login')) }, [router])
  const logout = async () => { await fetch('/api/auth/logout',{method:'POST'}); router.push('/login') }
  const nav = [{href:'/student',label:'ড্যাশবোর্ড',icon:'🏠'},{href:'/student/homework',label:'হোমওয়ার্ক',icon:'📋'},{href:'/student/practice',label:'প্র্যাকটিস',icon:'✍️'},{href:'/student/vocabulary',label:'ভোকাবুলারী',icon:'📖'},{href:'/student/review',label:'রিভিউ',icon:'🔄'},{href:'/student/badges',label:'ব্যাজ',icon:'🏆'},{href:'/student/progress',label:'প্রগ্রেস',icon:'📊'}]
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-bg"><div className="text-navy bangla-text">লোড হচ্ছে...</div></div>
  return (<div className="min-h-screen bg-gray-bg">
    <nav className="bg-navy text-white shadow-lg sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={()=>setMenu(!menu)} className="md:hidden text-xl">☰</button><Link href="/student" className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center font-bold text-sm">P</div><span className="font-bold text-lg hidden sm:block">Pro English BD</span></Link></div><div className="flex items-center gap-4"><span className="text-sm hidden sm:block bangla-text">👋 {user.name}</span><button onClick={logout} className="text-sm px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 bangla-text">লগআউট</button></div></div></nav>
    <div className="flex"><aside className="hidden md:block w-56 bg-white shadow-sm min-h-[calc(100vh-60px)] sticky top-[60px]"><nav className="p-4 space-y-1">{nav.map(item=>(<Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bangla-text ${pathname===item.href?'bg-navy text-white':'text-gray-700 hover:bg-gray-100'}`}><span>{item.icon}</span>{item.label}</Link>))}</nav></aside>
    {menu&&<div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-black/50" onClick={()=>setMenu(false)}/><div className="absolute left-0 top-0 w-64 h-full bg-white shadow-xl pt-16"><nav className="p-4 space-y-1">{nav.map(item=>(<Link key={item.href} href={item.href} onClick={()=>setMenu(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bangla-text ${pathname===item.href?'bg-navy text-white':'text-gray-700 hover:bg-gray-100'}`}><span>{item.icon}</span>{item.label}</Link>))}</nav></div></div>}
    <main className="flex-1 p-4 md:p-6 max-w-6xl">{children}</main></div></div>)
}
