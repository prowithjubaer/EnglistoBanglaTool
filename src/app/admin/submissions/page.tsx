'use client'
import { useState, useEffect } from 'react'

interface Submission {
  id: string; studentId: string; studentAnswer: string; selfScore: number | null; points: number; xp: number; submittedAt: string
  student: { name: string; email: string }
  task: { englishText: string; banglaTranslation: string; level: { title: string }; category: { name: string } }
  homework: { title: string } | null
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Submission | null>(null)

  useEffect(() => { load() }, [page])

  const load = () => {
    fetch(`/api/admin/submissions?page=${page}&limit=20`).then(r => r.json()).then(d => {
      setSubmissions(d.submissions || []); setTotalPages(d.totalPages || 1); setTotal(d.total || 0); setLoading(false)
    }).catch(() => setLoading(false))
  }

  const scoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-500'
    if (score >= 85) return 'bg-green-100 text-green-700'
    if (score >= 70) return 'bg-blue-100 text-blue-700'
    if (score >= 50) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">✅ Submissions</h1>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-navy">Submission Detail</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Student</span><span className="font-medium text-navy">{selected.student.name}</span></div>
                <div><span className="text-gray-500 block">Score</span><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${scoreColor(selected.selfScore)}`}>{selected.selfScore ?? '-'}%</span></div>
                <div><span className="text-gray-500 block">Points</span><span className="font-medium">{selected.points}</span></div>
                <div><span className="text-gray-500 block">XP</span><span className="font-medium">{selected.xp}</span></div>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-1">English Text:</p>
                <p className="text-sm font-medium text-navy">{selected.task.englishText}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Correct Translation:</p>
                <p className="text-sm text-green-700">{selected.task.banglaTranslation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Student Answer:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{selected.studentAnswer}</p>
              </div>
              <div className="text-xs text-gray-500">
                <span>{selected.task.level?.title} • {selected.task.category?.name}</span>
                {selected.homework && <span> • HW: {selected.homework.title}</span>}
                <span className="block mt-1">Submitted: {new Date(selected.submittedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Task</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Level</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No submissions yet</td></tr>
            ) : submissions.map(sub => (
              <tr key={sub.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3"><div className="font-medium text-navy text-xs">{sub.student.name}</div><div className="text-xs text-gray-400">{sub.student.email}</div></td>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{sub.task.englishText}</td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{sub.task.level?.title}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${scoreColor(sub.selfScore)}`}>{sub.selfScore ?? '-'}%</span></td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => setSelected(sub)} className="text-navy hover:underline text-xs">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">← Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next →</button>
        </div>
      )}
    </div>
  )
}
