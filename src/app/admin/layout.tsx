'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{name:string}|null>(null)
  const [menu, setMenu] = useState(false)
  const router = useRouter(); const pathname = usePathname()
  useEffect(() => { fetch('/api/auth/me').then(r=>r.json()).then(d=>{ if(d.user?.role==='admin') setUser(d.user); else router.push('/login') }).catch(()=>router.push('/login')) }, [router])
  const logout = async () => { await fetch('/api/auth/logout',{method:'POST'}); router.push('/login') }
  const nav = [{href:'/admin',label:'Dashboard',icon:'📊'},{href:'/admin/students',label:'Students',icon:'👥'},{href:'/admin/tasks',label:'Tasks',icon:'📝'},{href:'/admin/levels',label:'Levels',icon:'📶'},{href:'/admin/categories',label:'Categories',icon:'📁'},{href:'/admin/homework',label:'Homework',icon:'📋'},{href:'/admin/bulk-import',label:'Import',icon:'📤'},{href:'/admin/submissions',label:'Submissions',icon:'✅'},{href:'/admin/settings',label:'Settings',icon:'⚙️'}]
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-bg"><div className="text-navy">Loading...</div></div>
  return (<div className="min-h-screen bg-gray-bg">
    <nav className="bg-navy-dark text-white shadow-lg sticky top-0 z-50"><div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={()=>setMenu(!menu)} className="lg:hidden text-xl">☰</button><Link href="/admin" className="flex items-center gap-2"><div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center font-bold text-sm">P</div><span className="font-bold text-lg hidden sm:block">Pro English BD</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded ml-2">Admin</span></Link></div><div className="flex items-center gap-4"><span className="text-sm hidden sm:block">👋 {user.name}</span><button onClick={logout} className="text-sm px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20">Logout</button></div></div></nav>
    <div className="flex"><aside className="hidden lg:block w-56 bg-white shadow-sm min-h-[calc(100vh-60px)] sticky top-[60px]"><nav className="p-3 space-y-1">{nav.map(item=>(<Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${pathname===item.href?'bg-navy text-white':'text-gray-700 hover:bg-gray-100'}`}><span>{item.icon}</span>{item.label}</Link>))}</nav></aside>
    {menu&&<div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={()=>setMenu(false)}/><div className="absolute left-0 top-0 w-64 h-full bg-white shadow-xl pt-16"><nav className="p-4 space-y-1">{nav.map(item=>(<Link key={item.href} href={item.href} onClick={()=>setMenu(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${pathname===item.href?'bg-navy text-white':'text-gray-700 hover:bg-gray-100'}`}><span>{item.icon}</span>{item.label}</Link>))}</nav></div></div>}
    <main className="flex-1 p-4 lg:p-6">{children}</main></div></div>)
}
