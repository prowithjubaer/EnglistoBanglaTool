'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
export default function PracticePage() {
  const searchParams = useSearchParams()
  const homeworkId = searchParams.get('homeworkId')
  const [task, setTask] = useState<any>(null)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [scoreResult, setScoreResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [vocabOpen, setVocabOpen] = useState(false)
  const [hwInfo, setHwInfo] = useState<any>(null)
  const [levels, setLevels] = useState<any[]>([])
  const [selLevel, setSelLevel] = useState('')
  const [showPicker, setShowPicker] = useState(!homeworkId && !searchParams.get('taskId'))

  useEffect(() => {
    if (!showPicker) loadTask()
    else { fetch('/api/admin/levels').then(r=>r.json()).then(d=>setLevels(d.levels||[])); setLoading(false) }
  }, [])

  const loadTask = async (lvl?:string) => {
    setLoading(true); setSubmitted(false); setResult(null); setScoreResult(null); setAnswer('')
    const p = new URLSearchParams()
    if (homeworkId) p.set('homeworkId', homeworkId)
    if (searchParams.get('taskId')) p.set('taskId', searchParams.get('taskId')!)
    if (lvl||selLevel) p.set('levelId', lvl||selLevel)
    const res = await fetch(`/api/student/practice?${p}`)
    const data = await res.json()
    if (data.completed) { setCompleted(true); setTask(null) }
    else { setTask(data.task); if(data.totalTasks) setHwInfo({cur:data.currentIndex,total:data.totalTasks}) }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!answer.trim()||!task) return; setSubmitted(true)
    const res = await fetch('/api/student/submit', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({taskId:task.id,studentAnswer:answer,homeworkId}) })
    setResult(await res.json())
  }

  const handleScore = async (score:number) => {
    if (!result) return
    const res = await fetch('/api/student/submit', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({submissionId:result.submissionId,selfScore:score}) })
    setScoreResult(await res.json())
  }

  const markItem = async (type:string) => { if(!task) return; await fetch('/api/student/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({taskId:task.id,type})}); alert('সংরক্ষিত!') }
  const saveVocab = async (id:string) => { await fetch('/api/student/vocabulary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vocabularyId:id})}); alert('সংরক্ষিত!') }

  if (showPicker && !loading) return (<div className="space-y-6"><h1 className="text-2xl font-bold text-navy bangla-text">✍️ ফ্রি প্র্যাকটিস</h1><p className="text-gray-600 bangla-text">লেভেল নির্বাচন করুন</p><select value={selLevel} onChange={e=>setSelLevel(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg"><option value="">সব লেভেল</option>{levels.map((l:any)=><option key={l.id} value={l.id}>{l.title}</option>)}</select><button onClick={()=>{setShowPicker(false);loadTask(selLevel)}} className="px-6 py-3 bg-navy text-white rounded-lg font-bold bangla-text">শুরু করুন →</button></div>)
  if (loading) return <div className="text-center py-10 bangla-text text-gray-500">লোড হচ্ছে...</div>
  if (completed) return <div className="text-center py-16"><div className="text-6xl mb-4">🎉</div><h2 className="text-2xl font-bold text-navy bangla-text mb-2">অভিনন্দন!</h2><p className="text-gray-600 bangla-text mb-6">সব সম্পন্ন!</p><a href="/student" className="px-6 py-3 bg-navy text-white rounded-lg font-bold bangla-text">ড্যাশবোর্ড</a></div>
  if (!task) return <div className="text-center py-10 bangla-text text-gray-500">কোনো টাস্ক নেই</div>

  return (<div className="flex flex-col lg:flex-row gap-6">
    <div className="flex-1 space-y-4">
      <div className="flex items-center gap-2 flex-wrap"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{task.levelTitle}</span><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">{task.categoryName}</span><span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">{task.difficulty}</span>{hwInfo&&<span className="text-xs text-gray-500">({hwInfo.cur}/{hwInfo.total})</span>}</div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-border"><h3 className="text-xs font-bold text-gray-400 uppercase mb-2">ENGLISH TEXT</h3><p className="text-lg text-navy leading-relaxed font-medium">{task.englishText}</p></div>
      <button onClick={()=>setVocabOpen(!vocabOpen)} className="lg:hidden w-full py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm bangla-text font-medium text-yellow-800">📖 শব্দার্থ {vocabOpen?'▲':'▼'}</button>
      {vocabOpen && task.vocabulary?.length > 0 && <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 lg:hidden"><div className="space-y-2">{task.vocabulary.map((v:any)=>(<div key={v.id} className="bg-white rounded-lg p-2 border border-yellow-100"><p className="font-bold text-navy text-sm">{v.wordOrPhrase} <span className="font-normal text-yellow-800 bangla-text">— {v.banglaMeaning}</span></p>{v.example&&<p className="text-xs text-gray-500 italic">{v.example}</p>}<button onClick={()=>saveVocab(v.id)} className="text-xs text-yellow-700 mt-1">💾 সংরক্ষণ</button></div>))}</div></div>}
      {!submitted ? (<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-border"><h3 className="text-sm font-bold text-navy mb-2 bangla-text">📝 অনুবাদ লিখুন:</h3><textarea value={answer} onChange={e=>setAnswer(e.target.value)} className="w-full px-4 py-3 border border-gray-border rounded-lg min-h-[120px] bangla-text resize-y" placeholder="বাংলায় অনুবাদ লিখুন..." /><div className="flex gap-3 mt-4 flex-wrap"><button onClick={handleSubmit} disabled={!answer.trim()} className="px-6 py-3 bg-navy text-white rounded-lg font-bold disabled:opacity-50 bangla-text">সাবমিট করুন ✓</button><button onClick={()=>markItem('difficult')} className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg text-sm bangla-text">কঠিন</button><button onClick={()=>markItem('review_later')} className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg text-sm bangla-text">পরে রিভিউ</button></div></div>)
      : (<div className="space-y-4">
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200"><h4 className="text-sm font-bold text-blue-800 mb-2 bangla-text">📝 আপনার উত্তর:</h4><p className="text-blue-900 bangla-text">{answer}</p></div>
        {result && (<><div className="bg-green-50 rounded-xl p-5 border border-green-200"><h4 className="text-sm font-bold text-green-800 mb-2 bangla-text">✅ সঠিক অনুবাদ:</h4><p className="text-green-900 bangla-text font-medium">{result.correctTranslation}</p></div>
        {result.explanation&&<div className="bg-purple-50 rounded-xl p-5 border border-purple-200"><h4 className="text-sm font-bold text-purple-800 mb-2 bangla-text">💡 ব্যাখ্যা:</h4><p className="text-purple-900 bangla-text text-sm">{result.explanation}</p></div>}
        {result.grammarNote&&<div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200"><h4 className="text-sm font-bold text-indigo-800 mb-2">📐 Grammar:</h4><p className="text-indigo-900 text-sm">{result.grammarNote}</p></div>}
        {!scoreResult&&<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-border"><h4 className="font-bold text-navy mb-3 bangla-text">🎯 আপনার স্কোর নির্বাচন করুন:</h4><div className="flex flex-wrap gap-2">{[20,40,50,70,85,90,100].map(s=>(<button key={s} onClick={()=>handleScore(s)} className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-100 text-navy hover:bg-navy hover:text-white transition">{s}%</button>))}</div></div>}
        {scoreResult&&<div className="bg-gradient-to-r from-navy to-navy-light rounded-xl p-6 text-white text-center"><p className="text-lg bangla-text font-medium mb-4">{scoreResult.feedback}</p><div className="flex justify-center gap-6"><div><p className="text-2xl font-bold">+{scoreResult.points}</p><p className="text-xs text-gray-300">পয়েন্ট</p></div><div><p className="text-2xl font-bold">+{scoreResult.xp}</p><p className="text-xs text-gray-300">XP</p></div><div><p className="text-2xl font-bold">🔥{scoreResult.currentStreak}</p><p className="text-xs text-gray-300">স্ট্রিক</p></div></div><button onClick={()=>loadTask()} className="mt-6 px-6 py-3 bg-white text-navy rounded-lg font-bold bangla-text">পরবর্তী বাক্য →</button></div>}</>)}
      </div>)}
    </div>
    <div className="hidden lg:block w-80"><div className="sticky top-20">{task.vocabulary?.length > 0 && <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 shadow-sm"><h3 className="font-bold text-yellow-800 mb-3 bangla-text text-sm">📖 শব্দার্থ</h3><div className="space-y-3">{task.vocabulary.map((v:any)=>(<div key={v.id} className="bg-white rounded-lg p-3 border border-yellow-100"><div className="flex justify-between items-start"><div><p className="font-bold text-navy text-sm">{v.wordOrPhrase}</p><p className="text-yellow-800 text-sm bangla-text">{v.banglaMeaning}</p></div><button onClick={()=>saveVocab(v.id)} className="text-xs px-2 py-1 bg-yellow-100 rounded" title="Save">💾</button></div>{v.example&&<p className="text-xs text-gray-500 mt-1 italic">{v.example}</p>}</div>))}</div></div>}</div></div>
  </div>)
}
