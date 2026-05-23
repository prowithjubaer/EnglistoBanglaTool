'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
export default function Page() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/student/progress').then(r=>r.json()).then(setData) }, [])
  if (!data) return <div className="text-center py-10 bangla-text text-gray-500">লোড হচ্ছে...</div>
  const items = data.items || data.vocabulary || data.badges || data.homework || []
  return (<div className="space-y-6"><h1 className="text-2xl font-bold text-navy bangla-text">📊 প্রগ্রেস</h1>
    {Array.isArray(items) && items.length > 0 ? <div className="space-y-3">{items.map((item:any,i:number)=>(<div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-border"><p className="font-medium text-navy text-sm">{item.englishText || item.wordOrPhrase || item.name || item.title || 'Item'}</p>{item.banglaMeaning && <p className="text-sm text-gray-600 bangla-text mt-1">{item.banglaMeaning}</p>}{item.correctTranslation && <p className="text-sm text-green-700 bangla-text mt-1">{item.correctTranslation}</p>}{item.selfScore && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.selfScore}%</span>}{item.description && <p className="text-xs text-gray-500 bangla-text mt-1">{item.description}</p>}{item.earned !== undefined && <span className={item.earned ? "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded" : "text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded"}>{item.earned ? "অর্জিত" : "লক"}</span>}{item.taskId && <Link href={`/student/practice?taskId=${item.taskId}`} className="text-xs text-navy hover:underline ml-2">আবার করুন</Link>}</div>))}</div> : <div className="text-center py-16"><div className="text-5xl mb-4">📭</div><p className="text-gray-500 bangla-text">কোনো আইটেম নেই</p><Link href="/student/practice" className="mt-4 inline-block px-4 py-2 bg-navy text-white rounded-lg text-sm bangla-text">প্র্যাকটিস করুন</Link></div>}
  </div>)
}
