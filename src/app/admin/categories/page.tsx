'use client'
import { useState, useEffect } from 'react'
export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/admin/categories').then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false)) }, [])
  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>
  const items = data?.students || data?.tasks || data?.levels || data?.categories || data?.homework || data?.submissions || data?.batches || []
  const settings = data?.settings || null
  return (<div className="space-y-6"><h1 className="text-2xl font-bold text-navy capitalize">categories</h1>
    {settings ? <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-border"><pre className="text-sm whitespace-pre-wrap">{JSON.stringify(settings,null,2)}</pre></div> :
    Array.isArray(items) && items.length > 0 ? <div className="bg-white rounded-xl shadow-sm border border-gray-border overflow-hidden"><table className="w-full text-sm"><tbody>{items.slice(0,20).map((item:any,i:number)=>(<tr key={i} className="border-b hover:bg-gray-50"><td className="px-4 py-3 font-medium text-navy">{item.name||item.title||item.englishText?.substring(0,60)||item.student?.name||'Item '+(i+1)}</td><td className="px-4 py-3 text-gray-600">{item.email||item.difficulty||item.status||item.category?.name||''}</td><td className="px-4 py-3 text-xs text-gray-400">{item.status||item.assignedType||item.selfScore||''}</td></tr>))}</tbody></table></div>
    : <p className="text-gray-500 text-center py-10">No items found</p>}
  </div>)
}
