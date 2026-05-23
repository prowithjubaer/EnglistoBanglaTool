'use client'
import { useState, useEffect } from 'react'
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/admin/dashboard').then(r=>r.json()).then(setData) }, [])
  if (!data) return <div className="text-center py-10 text-gray-500">Loading...</div>
  return (<div className="space-y-6"><h1 className="text-2xl font-bold text-navy">📊 Admin Dashboard</h1>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{l:'Students',v:data.totalStudents,i:'👥',c:'bg-blue-50 border-blue-200'},{l:'Active',v:data.activeStudents,i:'✅',c:'bg-green-50 border-green-200'},{l:'Tasks',v:data.totalTasks,i:'📝',c:'bg-purple-50 border-purple-200'},{l:'Today',v:data.todaySubmissions,i:'📤',c:'bg-orange-50 border-orange-200'},{l:'Homework',v:data.totalHomework,i:'📋',c:'bg-indigo-50 border-indigo-200'},{l:'Avg Score',v:`${data.averageScore}%`,i:'⭐',c:'bg-yellow-50 border-yellow-200'},{l:'Levels',v:data.totalLevels,i:'📶',c:'bg-teal-50 border-teal-200'},{l:'Categories',v:data.totalCategories,i:'📁',c:'bg-pink-50 border-pink-200'}].map((s,i)=>(<div key={i} className={`rounded-xl p-4 border ${s.c}`}><div className="flex items-center gap-2"><span className="text-xl">{s.i}</span><div><p className="text-xl font-bold text-navy">{s.v}</p><p className="text-xs text-gray-600">{s.l}</p></div></div></div>))}</div>
    <div className="grid lg:grid-cols-2 gap-6"><div className="bg-white rounded-xl p-5 shadow-sm border border-gray-border"><h3 className="font-bold text-navy mb-4">🏆 Top Students</h3>{data.topStudents?.map((s:any,i:number)=>(<div key={i} className="flex items-center justify-between p-2 border-b last:border-0"><span className="text-sm font-medium text-navy">{s.name}</span><span className="text-sm text-gray-600">{s.points} pts</span></div>))}</div>
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-border"><h3 className="font-bold text-navy mb-4">📤 Recent</h3>{data.recentSubmissions?.slice(0,5).map((s:any,i:number)=>(<div key={i} className="flex items-center justify-between p-2 border-b last:border-0"><span className="text-sm text-navy">{s.studentName}</span><span className={`text-sm font-bold ${s.score>=70?'text-green-600':'text-orange-600'}`}>{s.score||'-'}%</span></div>))}</div></div>
  </div>)
}
